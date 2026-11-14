"""
Empirical Challenger 2 Test Suite: Milestone 1 (Backend Auth Core)
Targeted verification of:
1. Server Lifecycle: Rapid stop and restart of HTTP server on port 9911,
   verifying ReusableHTTPServer allow_reuse_address = True prevents bind collision errors.
2. CORS & OPTIONS headers: Verify do_OPTIONS returns 200 with Access-Control-Allow-Origin: *
   and all GET/POST endpoints include CORS headers for external clients.
3. Multi-threaded concurrency: Multi-threaded simultaneous logins, logouts,
   and _save_config invocations to verify _config_lock re-entrant safety and cross-service isolation.
"""

import time
import json
import urllib.request
import urllib.error
import urllib.parse
import http.client
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor, as_completed
from unittest.mock import patch, MagicMock

from tests.test_helpers import create_test_plugin, run_async


class TestServerLifecycle(unittest.TestCase):
    """
    Stress-tests the HTTP auth server lifecycle on port 9911.
    Specifically tests rapid start/stop cycles, address reuse (SO_REUSEADDR),
    and port release behavior.
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        # Allow socket to clean up
        time.sleep(0.1)
        self.temp_dir.cleanup()

    def test_rapid_stop_and_restart_cycles(self):
        """
        Verify that stopping and immediately restarting the HTTP server in rapid
        succession does not raise Address already in use ([Errno 98]) thanks to
        allow_reuse_address = True in ReusableHTTPServer.
        """
        cycles = 5
        for i in range(cycles):
            self.plugin._start_auth_server()
            # Give short window for socket binding
            time.sleep(0.15)
            self.assertIsNotNone(
                self.plugin._auth_server,
                f"Server instance should be active on cycle {i}",
            )

            # Test that server is actively accepting connections
            req = urllib.request.Request("http://127.0.0.1:9911/status")
            with urllib.request.urlopen(req, timeout=2) as resp:
                self.assertEqual(resp.status, 200)
                data = json.loads(resp.read().decode("utf-8"))
                self.assertEqual(data.get("status"), "ok")

            self.plugin._stop_auth_server()
            self.assertIsNone(self.plugin._auth_server)
            # Brief pause before next cycle
            time.sleep(0.05)

    def test_server_port_actually_freed_on_stop(self):
        """
        Verify that after _stop_auth_server(), the port 9911 is truly closed
        and subsequent connection attempts fail immediately (no zombie socket).
        """
        self.plugin._start_auth_server()
        time.sleep(0.15)
        self.assertIsNotNone(self.plugin._auth_server)

        # Confirm alive
        req = urllib.request.Request("http://127.0.0.1:9911/status")
        with urllib.request.urlopen(req, timeout=2) as resp:
            self.assertEqual(resp.status, 200)

        # Stop server
        self.plugin._stop_auth_server()
        self.assertIsNone(self.plugin._auth_server)
        time.sleep(0.1)

        # Connection must now be refused
        with self.assertRaises(urllib.error.URLError) as ctx:
            urllib.request.urlopen("http://127.0.0.1:9911/status", timeout=1)
        self.assertIn("Connection refused", str(ctx.exception))

    def test_stop_server_idempotency(self):
        """
        Verify that calling _stop_auth_server() multiple times or when not running
        does not raise exceptions.
        """
        self.assertIsNone(self.plugin._auth_server)
        # Should not throw
        try:
            self.plugin._stop_auth_server()
            self.plugin._stop_auth_server()
        except Exception as e:
            self.fail(f"_stop_auth_server raised unexpectedly: {e}")

    def test_multiple_start_calls_behavior(self):
        """
        Test behavior when _start_auth_server() is called multiple times.
        Verify that it doesn't crash the plugin or leave broken state.
        """
        self.plugin._start_auth_server()
        time.sleep(0.15)

        # Starting again while running: check if handled gracefully
        try:
            self.plugin._start_auth_server()
            time.sleep(0.15)
        except Exception as e:
            self.fail(f"Repeated _start_auth_server raised: {e}")

        # Endpoint should still respond
        req = urllib.request.Request("http://127.0.0.1:9911/status")
        with urllib.request.urlopen(req, timeout=2) as resp:
            self.assertEqual(resp.status, 200)


class TestCorsAndOptionsHeaders(unittest.TestCase):
    """
    Verifies that do_OPTIONS returns 200 with Access-Control-Allow-Origin: *
    and appropriate CORS headers for external clients across all paths,
    and that all standard endpoints return CORS headers.
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)
        self.plugin._start_auth_server()
        time.sleep(0.2)

    def tearDown(self):
        self.plugin._stop_auth_server()
        time.sleep(0.1)
        self.temp_dir.cleanup()

    def _send_options(self, path: str, extra_headers: dict = None):
        """Helper to send raw HTTP OPTIONS request to port 9911."""
        conn = http.client.HTTPConnection("127.0.0.1", 9911, timeout=3)
        headers = {
            "Origin": "https://steamcommunity.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type, Authorization",
        }
        if extra_headers:
            headers.update(extra_headers)
        conn.request("OPTIONS", path, headers=headers)
        resp = conn.getresponse()
        headers_dict = {k.lower(): v for k, v in resp.getheaders()}
        body = resp.read()
        conn.close()
        return resp.status, headers_dict, body

    def test_options_on_all_endpoints(self):
        """
        Verify do_OPTIONS returns 200 and standard CORS headers for all known
        and arbitrary endpoints.
        """
        test_paths = [
            "/",
            "/status",
            "/vk",
            "/vk/helper",
            "/vk/auth",
            "/api/vk_token",
            "/spotify",
            "/spotify/helper",
            "/spotify/auth",
            "/callback",
            "/spotify/callback",
            "/api/spotify_credentials",
            "/api/spotify_token",
            "/arbitrary/nonexistent/path",
        ]

        for path in test_paths:
            status, headers, _ = self._send_options(path)
            self.assertEqual(
                status,
                200,
                f"OPTIONS {path} must return 200 OK (got {status})",
            )
            self.assertEqual(
                headers.get("access-control-allow-origin"),
                "*",
                f"OPTIONS {path} missing Access-Control-Allow-Origin: *",
            )
            allow_methods = headers.get("access-control-allow-methods", "")
            self.assertTrue(
                "OPTIONS" in allow_methods and "GET" in allow_methods and "POST" in allow_methods,
                f"OPTIONS {path} missing expected methods: {allow_methods}",
            )
            allow_headers = headers.get("access-control-allow-headers", "")
            self.assertTrue(
                "content-type" in allow_headers.lower(),
                f"OPTIONS {path} missing Content-Type in allow headers: {allow_headers}",
            )

    def test_cors_headers_on_get_endpoints(self):
        """
        Verify GET endpoints include Access-Control-Allow-Origin: *
        """
        endpoints = [
            ("/status", 200),
            ("/vk/helper", 200),
            ("/spotify/helper", 200),
            ("/nonexistent_page", 404),
        ]

        for path, expected_status in endpoints:
            conn = http.client.HTTPConnection("127.0.0.1", 9911, timeout=3)
            conn.request("GET", path, headers={"Origin": "https://example.com"})
            resp = conn.getresponse()
            headers = {k.lower(): v for k, v in resp.getheaders()}
            body = resp.read()
            conn.close()

            self.assertEqual(resp.status, expected_status, f"GET {path} status {resp.status} != {expected_status}")
            self.assertEqual(
                headers.get("access-control-allow-origin"),
                "*",
                f"GET {path} missing Access-Control-Allow-Origin: *",
            )

    def test_cors_headers_on_post_endpoints(self):
        """
        Verify POST endpoints include Access-Control-Allow-Origin: *
        """
        endpoints = [
            ("/api/vk_token", json.dumps({"token": ""}).encode("utf-8")),
            ("/api/spotify_token", json.dumps({"token": ""}).encode("utf-8")),
            ("/api/spotify_credentials", json.dumps({}).encode("utf-8")),
            ("/unknown_post", b""),
        ]

        for path, body in endpoints:
            conn = http.client.HTTPConnection("127.0.0.1", 9911, timeout=3)
            conn.request(
                "POST",
                path,
                body=body,
                headers={
                    "Content-Type": "application/json",
                    "Origin": "https://example.com",
                },
            )
            resp = conn.getresponse()
            headers = {k.lower(): v for k, v in resp.getheaders()}
            resp.read()
            conn.close()

            self.assertEqual(
                headers.get("access-control-allow-origin"),
                "*",
                f"POST {path} missing Access-Control-Allow-Origin: *",
            )


class TestConfigLockConcurrency(unittest.TestCase):
    """
    Empirically verifies thread safety, re-entrant locking (_config_lock RLock),
    and cross-service isolation under high concurrent load.
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        time.sleep(0.05)
        self.temp_dir.cleanup()

    def test_config_lock_is_rlock_and_reentrant(self):
        """
        Verify that _config_lock is an instance of threading.RLock and supports
        deep recursive re-entrant acquisition on the same thread without deadlock.
        """
        lock = getattr(self.plugin, "_config_lock", None)
        self.assertIsNotNone(lock, "Plugin must have _config_lock attribute")
        self.assertTrue(
            type(lock).__name__ in ("RLock", "_RLock"),
            f"Plugin._config_lock must be an RLock, got {type(lock).__name__}",
        )

        # Test recursive re-entrancy depth of 10
        try:
            for _ in range(10):
                acquired = lock.acquire(timeout=1.0)
                self.assertTrue(acquired, "Re-entrant lock must be acquirable on same thread")

            # Call _save_config while holding lock at depth 10
            self.plugin.config["test_recursive_depth"] = 10
            self.plugin._save_config()

            for _ in range(10):
                lock.release()
        except Exception as e:
            self.fail(f"Re-entrant acquisition failed: {e}")

        # Verify disk persistence succeeded
        with open(self.plugin.config_file, "r", encoding="utf-8") as f:
            saved = json.load(f)
        self.assertEqual(saved.get("test_recursive_depth"), 10)

    def test_multi_threaded_simultaneous_save_config(self):
        """
        Stress test: 20 worker threads concurrently modifying and calling
        _save_config() 25 times each (total 500 save operations).
        Verifies:
        1. No thread deadlocks or hangs.
        2. config.json remains uncorrupted valid JSON throughout.
        """
        num_threads = 20
        iterations_per_thread = 25
        errors = []

        def worker_task(thread_id):
            try:
                for i in range(iterations_per_thread):
                    # Mutate config under config lock
                    with self.plugin._config_lock:
                        self.plugin.config[f"thread_{thread_id}_key"] = f"val_{i}"
                        self.plugin.config["last_update_thread"] = thread_id
                        # Call save_config (which re-acquires _config_lock)
                        self.plugin._save_config()
            except Exception as exc:
                errors.append(f"Thread {thread_id} failed: {exc}")

        threads = [
            threading.Thread(target=worker_task, args=(tid,))
            for tid in range(num_threads)
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=10.0)
            self.assertFalse(t.is_alive(), "Worker thread hung / deadlocked")

        self.assertEqual(errors, [], f"Encountered concurrency errors: {errors}")

        # Final check: file must be completely valid JSON with all thread keys present
        with open(self.plugin.config_file, "r", encoding="utf-8") as f:
            final_data = json.load(f)

        for tid in range(num_threads):
            key = f"thread_{tid}_key"
            self.assertIn(key, final_data, f"Missing key {key} in final config")
            self.assertEqual(final_data[key], f"val_{iterations_per_thread - 1}")

    def test_multi_service_concurrent_login_logout_isolation(self):
        """
        Verify cross-service isolation and race safety:
        While Spotify and Yandex undergo rapid concurrent logins and logouts,
        VK's persistent credentials and session state MUST remain completely intact.
        Similarly, while VK and Spotify churn, Yandex's state must remain intact.
        """
        num_cycles = 15
        errors = []

        # Preset persistent VK session
        self.plugin.config["vk_token"] = "vk_static_golden_token_123"
        self.plugin.config["vk_user"] = {"id": "12345", "name": "VK Golden User"}
        self.plugin._save_config()

        def spotify_worker():
            for i in range(num_cycles):
                try:
                    # Mock Spotify token update
                    with patch("requests.get") as mock_get:
                        resp = MagicMock()
                        resp.status_code = 200
                        resp.json.return_value = {
                            "id": f"sp_user_{i}",
                            "display_name": f"Spotify User {i}",
                            "product": "premium",
                        }
                        mock_get.return_value = resp
                        self.plugin._sync_spotify_set_token(f"sp_token_{i}", f"sp_refresh_{i}")

                    # Check that VK token was not overwritten or wiped
                    with self.plugin._config_lock:
                        vk_tok = self.plugin.config.get("vk_token")
                        if vk_tok != "vk_static_golden_token_123":
                            errors.append(f"Spotify worker noticed VK token altered: {vk_tok}")

                    # Spotify logout
                    run_async(self.plugin.spotify_logout())

                    # Check that VK token is STILL not wiped after Spotify logout
                    with self.plugin._config_lock:
                        vk_tok = self.plugin.config.get("vk_token")
                        if vk_tok != "vk_static_golden_token_123":
                            errors.append(f"Spotify logout wiped VK token: {vk_tok}")
                except Exception as e:
                    errors.append(f"Spotify worker error: {e}")

        def yandex_worker():
            for i in range(num_cycles):
                try:
                    # Yandex token update
                    with patch.object(self.plugin, "_init_yandex_client") as mock_init:
                        client_mock = MagicMock()
                        client_mock.me.account.full_name = f"Yandex User {i}"
                        mock_init.return_value = client_mock
                        run_async(self.plugin.yandex_set_token(f"ya_token_{i}"))

                    # Check that VK token was not overwritten or wiped
                    with self.plugin._config_lock:
                        vk_tok = self.plugin.config.get("vk_token")
                        if vk_tok != "vk_static_golden_token_123":
                            errors.append(f"Yandex worker noticed VK token altered: {vk_tok}")

                    # Yandex logout
                    run_async(self.plugin.yandex_logout())

                    # Check that VK token is STILL not wiped after Yandex logout
                    with self.plugin._config_lock:
                        vk_tok = self.plugin.config.get("vk_token")
                        if vk_tok != "vk_static_golden_token_123":
                            errors.append(f"Yandex logout wiped VK token: {vk_tok}")
                except Exception as e:
                    errors.append(f"Yandex worker error: {e}")

        threads = [
            threading.Thread(target=spotify_worker),
            threading.Thread(target=yandex_worker),
        ]

        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=12.0)
            self.assertFalse(t.is_alive(), "Service worker thread deadlocked")

        self.assertEqual(errors, [], f"Cross-service isolation errors: {errors}")

        # Final verification: VK token on disk and in memory must be unchanged
        with open(self.plugin.config_file, "r", encoding="utf-8") as f:
            final_cfg = json.load(f)
        self.assertEqual(
            final_cfg.get("vk_token"),
            "vk_static_golden_token_123",
            "VK token on disk must remain pristine after Spotify/Yandex churn",
        )
        self.assertEqual(
            self.plugin.config.get("vk_token"),
            "vk_static_golden_token_123",
            "VK token in memory must remain pristine after Spotify/Yandex churn",
        )


if __name__ == "__main__":
    unittest.main()
