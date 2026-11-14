"""
Empirical Challenger Test Suite: Milestone 1 Iteration 3
Socket Lifecycle, Concurrency & Adversarial Stress Testing

Focus:
1. ReusableHTTPServer exception handling during bind collisions (_NoThreads bug).
2. Verification of port 9911 retry loop resilience under [Errno 98] Address already in use.
3. Concurrent in-flight HTTP requests during server shutdown and verification of [Errno 104] Connection reset by peer.
4. Rapid start/stop restart cycles in tight loop.
5. Socket timeouts and thread reclamation on slow/idle clients.
"""

import sys
import time
import socket
import errno
import tempfile
import threading
import http.server
import urllib.request
import urllib.error
import unittest

from tests.test_helpers import create_test_plugin
from main import ReusableHTTPServer, Plugin


class TestSocketLifecycleAdversarial(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        self.temp_dir.cleanup()

    def test_reusable_http_server_bind_collision_nothreads_bug(self):
        """
        Adversarial Test: Verify if ReusableHTTPServer properly handles bind failure.
        When port is occupied, TCPServer.__init__ catches bind failure and calls server_close().
        If server_close() assumes self._threads is iterable or has pop_all(), it crashes
        with TypeError: '_NoThreads' object is not iterable, masking OSError [Errno 98].
        """
        # Occupy a test port
        dummy_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        dummy_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        dummy_sock.bind(("127.0.0.1", 9919))
        dummy_sock.listen(1)

        try:
            # Attempt to instantiate ReusableHTTPServer on the same port
            with self.assertRaises(OSError) as ctx:
                ReusableHTTPServer(("127.0.0.1", 9919), http.server.BaseHTTPRequestHandler)

            self.assertEqual(ctx.exception.errno, errno.EADDRINUSE,
                             f"Expected [Errno 98] EADDRINUSE, got {ctx.exception}")
        finally:
            dummy_sock.close()

    def test_start_auth_server_retry_resilience_when_port_busy(self):
        """
        Adversarial Test: Verify if _start_auth_server() retries and recovers
        when port 9911 is temporarily occupied for a short duration (< 0.2s).
        """
        dummy_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        dummy_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        dummy_sock.bind(("0.0.0.0", 9911))
        dummy_sock.listen(1)

        def delayed_release():
            time.sleep(0.08)
            dummy_sock.close()

        releaser = threading.Thread(target=delayed_release)
        releaser.start()

        try:
            # Start auth server while port 9911 is temporarily occupied
            self.plugin._start_auth_server()
            releaser.join()

            self.assertIsNotNone(
                self.plugin._auth_server,
                "Auth server failed to start despite retry loop because TypeError masked OSError [Errno 98]"
            )

            # Check that server responds
            with urllib.request.urlopen("http://127.0.0.1:9911/status", timeout=2) as resp:
                self.assertEqual(resp.status, 200)
        finally:
            try:
                dummy_sock.close()
            except Exception:
                pass

    def test_concurrent_in_flight_shutdown_zero_connection_reset(self):
        """
        Adversarial Test: Verify zero [Errno 104] Connection reset by peer
        when server shutdown occurs during concurrent in-flight requests.
        """
        self.plugin._start_auth_server()
        time.sleep(0.05)
        self.assertIsNotNone(self.plugin._auth_server, "Server did not start")

        reset_errors = []
        stop_signal = threading.Event()

        def hammering_client(worker_id):
            while not stop_signal.is_set():
                try:
                    with urllib.request.urlopen("http://127.0.0.1:9911/status", timeout=2) as resp:
                        resp.read()
                except OSError as e:
                    if e.errno == errno.ECONNRESET or "104" in str(e):
                        reset_errors.append((worker_id, type(e).__name__, str(e)))
                except Exception as e:
                    if "Connection reset by peer" in str(e) or "104" in str(e):
                        reset_errors.append((worker_id, type(e).__name__, str(e)))
                time.sleep(0.001)

        workers = [threading.Thread(target=hammering_client, args=(i,)) for i in range(20)]
        for w in workers:
            w.start()

        # Let requests start flowing
        time.sleep(0.03)

        # Abruptly stop server while 20 threads are sending requests
        self.plugin._stop_auth_server()
        stop_signal.set()

        for w in workers:
            w.join(timeout=2.0)

        self.assertEqual(
            len(reset_errors), 0,
            f"Detected {len(reset_errors)} [Errno 104] Connection reset by peer errors during shutdown: {reset_errors[:5]}"
        )

    def test_slow_and_idle_client_timeout_and_thread_reclamation(self):
        """
        Adversarial Test: Verify socket timeouts prevent thread hangs on slow/idle clients.
        1. Idle client connection times out around 5.0s and server closes socket (EOF).
        2. Worker thread is reclaimed after timeout.
        3. Server stop during slow client does not hang indefinitely.
        """
        self.plugin._start_auth_server()
        time.sleep(0.05)
        base_threads = threading.active_count()

        # Connect idle socket
        s = socket.create_connection(("127.0.0.1", 9911))
        time.sleep(0.1)
        self.assertGreater(threading.active_count(), base_threads, "No worker thread spawned for client")

        # Measure timeout duration
        t0 = time.time()
        s.settimeout(10.0)
        data = s.recv(1024)
        elapsed = time.time() - t0

        # Connection should close cleanly with EOF
        self.assertEqual(data, b"", f"Expected EOF from server, got {data!r}")
        self.assertTrue(4.5 <= elapsed <= 6.5, f"Expected timeout ~5.0s, got {elapsed:.2f}s")

        # Verify thread reclamation
        time.sleep(0.2)
        self.assertEqual(threading.active_count(), base_threads, "Worker thread was not reclaimed")
        s.close()

    def test_rapid_restart_cycles_tight_loop(self):
        """
        Adversarial Test: Rapid restart cycles (bind/shutdown cycles on port 9911 in tight loops).
        Executes 25 tight start/stop cycles with zero sleep.
        """
        failures = []
        for i in range(25):
            try:
                self.plugin._start_auth_server()
                if self.plugin._auth_server is None:
                    failures.append((i, "Server is None"))
                    continue
                with urllib.request.urlopen("http://127.0.0.1:9911/status", timeout=2) as resp:
                    if resp.status != 200:
                        failures.append((i, f"Status {resp.status}"))
                self.plugin._stop_auth_server()
            except Exception as e:
                failures.append((i, type(e).__name__, str(e)))

        self.assertEqual(len(failures), 0, f"Rapid restart failures encountered: {failures}")


if __name__ == "__main__":
    unittest.main()
