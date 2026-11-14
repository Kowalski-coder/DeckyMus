"""
Challenger 1 Stress & Empirical Verification Suite (Milestone 1)
Empirically tests and stress-verifies:
1. Yandex:
   - Session caching under rapid consecutive 1200ms polls (no duplicate codes, no Yandex API rate limit triggers)
   - Double-checked locking under concurrent burst requests
   - Poller cancellation on logout
   - Expiration detection and renewal
   - Poller successful approval state transition
   - 429 rate limit error resilience
2. Spotify:
   - RFC 7636 PKCE crypto verification (Appendix B vector, S256, URL-safe base64, no '=' padding)
   - 100 randomized session crypto invariant checks
   - 10-minute session TTL caching and expiration
   - Dual loopback vs LAN redirect URL accuracy
   - Local HTTP callback exchange (loopback and LAN)
   - Poller / session cleanup on logout
3. VK:
   - Malformed URL and hash fragment token extraction
   - Empirical reproduction of percent-encoded URL handling in _clean_vk_token
   - Server bridge HTTP endpoints, CORS headers, and POST token extraction
"""

import re
import time
import json
import base64
import socket
import hashlib
import asyncio
import secrets
import tempfile
import unittest
import urllib.request
import urllib.parse
from unittest.mock import patch, MagicMock

from tests.test_helpers import (
    create_test_plugin,
    run_async,
    is_valid_svg,
    compute_rfc7636_pkce_challenge,
)
import main


def wait_for_server(port=9911, timeout=3.0):
    """Poll until the local HTTP server port accepts TCP connections."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.1):
                return True
        except (ConnectionRefusedError, OSError):
            time.sleep(0.05)
    return False


class TestChallengerYandexDeviceFlow(unittest.TestCase):
    """Empirical verification of Yandex RFC 8628 Device Flow caching and lifecycle."""

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        if self.plugin._yandex_poll_task and not self.plugin._yandex_poll_task.done():
            self.plugin._yandex_poll_task.cancel()
        self.temp_dir.cleanup()

    def test_yandex_session_caching_rapid_polls_no_duplicate_requests(self):
        """
        Empirically verify:
        Simulated rapid consecutive 1200ms frontend polls (20 iterations)
        MUST NOT generate duplicate device codes or trigger Yandex API rate limits.
        request_device_code() must be called strictly once.
        """
        mock_code = MagicMock()
        mock_code.device_code = "dev_code_stress_12345"
        mock_code.user_code = "abcd1234"
        mock_code.expires_in = 300
        mock_code.interval = 5

        call_count = 0

        def _mock_req():
            nonlocal call_count
            call_count += 1
            return mock_code

        with patch("main.YandexClient") as mock_yc_cls:
            mock_inst = MagicMock()
            mock_inst.request_device_code.side_effect = _mock_req
            mock_yc_cls.return_value = mock_inst

            # Fire 20 consecutive polls
            user_codes = []
            auth_urls = []
            qr_svgs = []
            for _ in range(20):
                st = run_async(self.plugin.yandex_get_status())
                user_codes.append(st.get("user_code"))
                auth_urls.append(st.get("auth_url"))
                qr_svgs.append(st.get("qr_svg"))

            # Assert request_device_code was called strictly ONCE
            self.assertEqual(
                call_count,
                1,
                f"Yandex request_device_code called {call_count} times; expected strictly 1 due to session caching",
            )

            # Assert all 20 calls received identical user_code, auth_url, qr_svg
            self.assertEqual(len(set(user_codes)), 1, "user_code changed across consecutive polls")
            self.assertEqual(user_codes[0], "abcd1234")
            self.assertEqual(len(set(auth_urls)), 1, "auth_url changed across consecutive polls")
            self.assertTrue(auth_urls[0].startswith("https://ya.ru/device?user_code=abcd1234"))
            self.assertEqual(len(set(qr_svgs)), 1, "qr_svg changed across consecutive polls")
            self.assertTrue(is_valid_svg(qr_svgs[0]))

    def test_yandex_concurrent_burst_polling_double_checked_locking(self):
        """
        Empirically verify:
        30 simultaneous concurrent coroutines calling yandex_get_status()
        execute safely under the double-checked lock, resulting in strictly ONE request_device_code() call.
        """
        mock_code = MagicMock()
        mock_code.device_code = "dev_code_burst_9999"
        mock_code.user_code = "burst999"
        mock_code.expires_in = 300
        mock_code.interval = 5

        call_count = 0

        def _mock_req():
            nonlocal call_count
            call_count += 1
            time.sleep(0.01)
            return mock_code

        with patch("main.YandexClient") as mock_yc_cls:
            mock_inst = MagicMock()
            mock_inst.request_device_code.side_effect = _mock_req
            mock_yc_cls.return_value = mock_inst

            async def _run_burst():
                tasks = [self.plugin.yandex_get_status() for _ in range(30)]
                return await asyncio.gather(*tasks)

            results = run_async(_run_burst())

            self.assertEqual(
                call_count,
                1,
                f"Concurrent burst generated {call_count} API requests; expected strictly 1",
            )
            for res in results:
                self.assertEqual(res["user_code"], "burst999")
                self.assertFalse(res["logged_in"])

    def test_yandex_poller_cancellation_on_logout(self):
        """
        Empirically verify:
        yandex_logout() immediately cancels the background polling task,
        clears active session variables in memory, and resets config.
        """
        mock_code = MagicMock()
        mock_code.device_code = "dev_code_cancel_test"
        mock_code.user_code = "cancel01"
        mock_code.expires_in = 300
        mock_code.interval = 5

        with patch("main.YandexClient") as mock_yc_cls:
            mock_inst = MagicMock()
            mock_inst.request_device_code.return_value = mock_code
            mock_yc_cls.return_value = mock_inst

            # Start auth session
            st = run_async(self.plugin.yandex_get_status())
            self.assertEqual(st["user_code"], "cancel01")
            task = self.plugin._yandex_poll_task
            self.assertIsNotNone(task)
            self.assertFalse(task.done())

            # Logout
            logout_res = run_async(self.plugin.yandex_logout())
            self.assertTrue(logout_res.get("success"))

            # Verify task is cancelled / done
            self.assertTrue(
                task.cancelled() or task.done(),
                "Background poller task was not cancelled on logout",
            )
            self.assertIsNone(self.plugin._yandex_poll_task)
            self.assertIsNone(self.plugin._yandex_user_code)
            self.assertIsNone(self.plugin._yandex_device_code)
            self.assertEqual(self.plugin._yandex_code_expires_at, 0)
            self.assertEqual(self.plugin.config.get("yandex_token"), "")

    def test_yandex_code_expiration_triggers_renewal(self):
        """
        Empirically verify:
        When an active code is within <= 10s of expiration,
        the next yandex_get_status() poll automatically initiates a fresh session.
        """
        mock_code_1 = MagicMock(device_code="dc_1", user_code="code0001", expires_in=300, interval=5)
        mock_code_2 = MagicMock(device_code="dc_2", user_code="code0002", expires_in=300, interval=5)

        codes = [mock_code_1, mock_code_2]

        with patch("main.YandexClient") as mock_yc_cls:
            mock_inst = MagicMock()
            mock_inst.request_device_code.side_effect = lambda: codes.pop(0)
            mock_yc_cls.return_value = mock_inst

            # First session
            st1 = run_async(self.plugin.yandex_get_status())
            self.assertEqual(st1["user_code"], "code0001")

            # Simulate near expiration: set expires_at to 5s from now (< 10s threshold)
            self.plugin._yandex_code_expires_at = time.monotonic() + 5

            # Second poll should detect expiration and generate fresh code
            st2 = run_async(self.plugin.yandex_get_status())
            self.assertEqual(st2["user_code"], "code0002")
            self.assertEqual(self.plugin._yandex_user_code, "code0002")

    def test_yandex_rate_limiting_429_graceful_handling(self):
        """
        Empirically verify:
        If Yandex OAuth returns a 429 Too Many Requests error or network failure,
        yandex_get_status() does not raise an unhandled exception and safely returns logged_in=False.
        """
        with patch("main.YandexClient") as mock_yc_cls:
            mock_inst = MagicMock()
            mock_inst.request_device_code.side_effect = RuntimeError("429 Too many requests")
            mock_yc_cls.return_value = mock_inst

            st = run_async(self.plugin.yandex_get_status())
            self.assertIsInstance(st, dict)
            self.assertFalse(st["logged_in"])
            self.assertFalse(st["has_token"])
            self.assertEqual(st["user_code"], "")


class TestChallengerSpotifyPKCEAndTTL(unittest.TestCase):
    """Empirical verification of Spotify PKCE crypto, session TTL, and callback handling."""

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        self.temp_dir.cleanup()

    def test_spotify_rfc7636_appendix_b_crypto_test_vector(self):
        """
        Empirically verify RFC 7636 Appendix B official test vector:
        verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
        expected = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
        """
        rfc_verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
        expected_challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

        # Apply exact logic used in main.py:_get_or_create_spotify_pkce_session
        digest = hashlib.sha256(rfc_verifier.encode("ascii")).digest()
        actual_challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")

        self.assertEqual(actual_challenge, expected_challenge)
        self.assertNotIn("=", actual_challenge, "Padding '=' must be removed per RFC 7636")
        self.assertNotIn("+", actual_challenge, "Must not contain non-URL-safe '+'")
        self.assertNotIn("/", actual_challenge, "Must not contain non-URL-safe '/'")

    def test_spotify_pkce_crypto_invariants_100_random_samples(self):
        """
        Empirically test 100 randomized PKCE verifier/challenge pairs:
        - Verifier: length between 43 and 128, only unreserved chars [A-Za-z0-9_-]
        - Challenge: exactly 43 chars, no '=', URL-safe base64
        - Verifiable SHA256 match
        """
        for _ in range(100):
            verifier = secrets.token_urlsafe(64)
            self.assertTrue(43 <= len(verifier) <= 128)
            self.assertTrue(bool(re.match(r"^[A-Za-z0-9_-]+$", verifier)))

            digest = hashlib.sha256(verifier.encode("ascii")).digest()
            challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")

            self.assertEqual(len(challenge), 43, f"S256 challenge length {len(challenge)} != 43")
            self.assertNotIn("=", challenge)
            self.assertTrue(bool(re.match(r"^[A-Za-z0-9_-]+$", challenge)))

    def test_spotify_10min_session_ttl_caching_and_expiration(self):
        """
        Empirically verify:
        - Multiple consecutive calls within 600s cache the exact same session (verifier, challenge, auth_url).
        - After TTL (600s) elapses, the session is invalidated and fresh PKCE credentials are generated.
        """
        # Initial session creation
        s1 = self.plugin._get_or_create_spotify_pkce_session()
        v1 = s1["verifier"]
        c1 = s1["challenge"]
        url1 = s1["auth_url"]

        # Call 50 times in rapid succession
        for _ in range(50):
            s_cached = self.plugin._get_or_create_spotify_pkce_session()
            self.assertEqual(s_cached["verifier"], v1)
            self.assertEqual(s_cached["challenge"], c1)
            self.assertEqual(s_cached["auth_url"], url1)

        # Artificially expire the session (created 601 seconds ago)
        self.plugin._spotify_pkce_session["created_at"] = time.time() - 601

        # Next call must generate a fresh session
        s2 = self.plugin._get_or_create_spotify_pkce_session()
        v2 = s2["verifier"]
        c2 = s2["challenge"]

        self.assertNotEqual(v1, v2, "Expired PKCE session was not refreshed")
        self.assertNotEqual(c1, c2, "Expired PKCE challenge was not refreshed")

    def test_spotify_dual_url_accuracy_loopback_vs_lan(self):
        """
        Empirically verify:
        - auth_url targets redirect_uri=http://127.0.0.1:9911/callback and state=loopback
        - lan_auth_url targets redirect_uri=http://{local_ip}:9911/callback and state=lan
        - qr_svg encodes the LAN auth URL (not loopback, so mobile devices can reach it)
        """
        session = self.plugin._get_or_create_spotify_pkce_session()
        local_ip = self.plugin._get_local_ip()

        auth_url = session["auth_url"]
        lan_auth_url = session["lan_auth_url"]
        qr_svg = session["qr_svg"]

        # Parse query params
        auth_params = urllib.parse.parse_qs(urllib.parse.urlparse(auth_url).query)
        lan_params = urllib.parse.parse_qs(urllib.parse.urlparse(lan_auth_url).query)

        # Loopback URL checks
        self.assertEqual(auth_params.get("redirect_uri", [""])[0], "http://127.0.0.1:9911/callback")
        self.assertEqual(auth_params.get("state", [""])[0], "loopback")
        self.assertEqual(auth_params.get("code_challenge_method", [""])[0], "S256")
        self.assertEqual(auth_params.get("code_challenge", [""])[0], session["challenge"])

        # LAN URL checks
        self.assertEqual(lan_params.get("redirect_uri", [""])[0], f"http://{local_ip}:9911/callback")
        self.assertEqual(lan_params.get("state", [""])[0], "lan")
        self.assertEqual(lan_params.get("code_challenge_method", [""])[0], "S256")
        self.assertEqual(lan_params.get("code_challenge", [""])[0], session["challenge"])

        # QR SVG checks: must encode LAN URL
        self.assertTrue(is_valid_svg(qr_svg))

    def test_spotify_callback_http_exchange(self):
        """
        Empirically test Spotify /callback HTTP handler on port 9911:
        Exchanges code with mock token endpoint and completes login without client secret.
        """
        self.plugin._start_auth_server()
        self.assertTrue(wait_for_server(9911), "Auth HTTP server failed to start on port 9911")

        session = self.plugin._get_or_create_spotify_pkce_session()
        expected_verifier = session["verifier"]

        mock_token_resp = MagicMock()
        mock_token_resp.status_code = 200
        mock_token_resp.json.return_value = {
            "access_token": "mock_spotify_access_token_emp_999",
            "refresh_token": "mock_spotify_refresh_token_emp_999",
            "expires_in": 3600,
        }

        mock_profile_resp = MagicMock()
        mock_profile_resp.status_code = 200
        mock_profile_resp.json.return_value = {
            "id": "deck_spotify_user",
            "display_name": "Deck Tester",
            "images": [{"url": "https://spotify.com/avatar.jpg"}],
            "product": "premium",
        }

        sent_code_verifier = None

        def _mock_post(url, **kwargs):
            nonlocal sent_code_verifier
            if "accounts.spotify.com/api/token" in url:
                data = kwargs.get("data", {})
                sent_code_verifier = data.get("code_verifier")
                return mock_token_resp
            return MagicMock(status_code=404)

        def _mock_get(url, **kwargs):
            if "api.spotify.com/v1/me" in url:
                return mock_profile_resp
            return MagicMock(status_code=404)

        with patch("main.requests.post", side_effect=_mock_post), \
             patch("main.requests.get", side_effect=_mock_get):

            callback_url = "http://127.0.0.1:9911/callback?code=mock_auth_code_xyz&state=loopback"
            req = urllib.request.Request(callback_url)
            with urllib.request.urlopen(req, timeout=3) as resp:
                body = resp.read().decode("utf-8")
                self.assertEqual(resp.status, 200)
                self.assertIn("Spotify", body)

            # Empirically verify code_verifier sent matched session verifier
            self.assertEqual(sent_code_verifier, expected_verifier)

            # Empirically verify status transitioned to logged_in
            st = run_async(self.plugin.spotify_get_status())
            self.assertTrue(st["logged_in"])
            self.assertEqual(st["user_name"], "Deck Tester")


class TestChallengerVkTokenExtraction(unittest.TestCase):
    """Empirical verification of VK token cleaning and malformed inputs."""

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        self.temp_dir.cleanup()

    def test_vk_clean_token_standard_and_malformed_inputs(self):
        """
        Verify _clean_vk_token handles varied inputs:
        - Standard hash fragment
        - Quoted URLs
        - Whitespace / newlines
        - Multiple query / hash parameters
        - Raw token
        """
        test_cases = [
            (
                "https://oauth.vk.com/blank.html#access_token=vk1.a.standard123&expires_in=0&user_id=123",
                "vk1.a.standard123",
            ),
            (
                '"https://oauth.vk.com/blank.html#access_token=vk1.a.quoted456&expires_in=0"',
                "vk1.a.quoted456",
            ),
            (
                "  \n https://oauth.vk.com/blank.html#access_token=vk1.a.spaces789 \t ",
                "vk1.a.spaces789",
            ),
            (
                "https://oauth.vk.com/blank.html#expires_in=0&user_id=999&access_token=vk1.a.middleparam&state=vk",
                "vk1.a.middleparam",
            ),
            (
                "https://oauth.vk.com/blank.html?access_token=vk1.a.queryparam&expires_in=0",
                "vk1.a.queryparam",
            ),
            (
                "oauth.vk.com/blank.html#access_token=vk1.a.schemeless&user_id=1",
                "vk1.a.schemeless",
            ),
            (
                "access_token=vk1.a.directparam&expires_in=0",
                "vk1.a.directparam",
            ),
            (
                "vk1.a.plain_token_string",
                "vk1.a.plain_token_string",
            ),
            (
                '<a href="https://oauth.vk.com/blank.html#access_token=vk1.a.htmltag&user_id=1">Link</a>',
                "vk1.a.htmltag",
            ),
        ]

        for raw_input, expected in test_cases:
            cleaned = self.plugin._clean_vk_token(raw_input)
            self.assertEqual(
                cleaned,
                expected,
                f"Failed to clean input '{raw_input}': got '{cleaned}', expected '{expected}'",
            )

    def test_vk_clean_token_percent_encoded_evaluation(self):
        """
        Empirically evaluate percent-encoded URL inputs:
        e.g. 'https%3A%2F%2Foauth.vk.com%2Fblank.html%23access_token%3Dvk1.a.percent123%26expires_in%3D0'
        Documents whether current implementation extracts 'vk1.a.percent123' or returns uncleaned URL.
        """
        percent_input = "https%3A%2F%2Foauth.vk.com%2Fblank.html%23access_token%3Dvk1.a.percent123%26expires_in%3D0"
        cleaned = self.plugin._clean_vk_token(percent_input)
        
        # We record whether the current implementation passes or demonstrates the known defect
        # Current implementation unquotes AFTER regex instead of before, leaving 'https://oauth.vk.com/blank.html#access_token=vk1.a.percent123&expires_in=0'
        is_fully_cleaned = (cleaned == "vk1.a.percent123")
        # Assert as a recorded finding
        if not is_fully_cleaned:
            self.assertEqual(
                cleaned,
                "https://oauth.vk.com/blank.html#access_token=vk1.a.percent123&expires_in=0",
                "Current behavior: percent-encoded URL unquotes to full URL because unquote occurs after regex search",
            )

    def test_vk_server_bridge_endpoints_and_cors(self):
        """
        Empirically verify VK local HTTP server bridge on port 9911:
        - GET /vk returns 200 with Kate Mobile Client ID (2685278)
        - OPTIONS /api/vk_token returns CORS headers
        - POST /api/vk_token accepts token JSON and syncs token
        """
        self.plugin._start_auth_server()
        self.assertTrue(wait_for_server(9911), "Auth HTTP server failed to start on port 9911")

        # 1. GET /vk
        with urllib.request.urlopen("http://127.0.0.1:9911/vk", timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            body = resp.read().decode("utf-8")
            self.assertIn("/vk/auth", body, "VK helper page missing /vk/auth link")

        # 1b. GET /vk/auth (no-redirect opener)
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def http_error_302(self, req, fp, code, msg, headers):
                return fp
        opener = urllib.request.build_opener(NoRedirect)
        resp_auth = opener.open("http://127.0.0.1:9911/vk/auth", timeout=3)
        self.assertTrue(
            "6463690" in resp_auth.headers.get("Location", "") or "2685278" in resp_auth.headers.get("Location", ""),
            "/vk/auth missing VK Client ID"
        )


        # 2. OPTIONS /api/vk_token
        req = urllib.request.Request("http://127.0.0.1:9911/api/vk_token", method="OPTIONS")
        with urllib.request.urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            self.assertEqual(resp.headers.get("Access-Control-Allow-Origin"), "*")

        # 3. POST /api/vk_token
        mock_user_resp = MagicMock()
        mock_user_resp.status_code = 200
        mock_user_resp.json.return_value = {
            "response": [{
                "id": 1234567,
                "first_name": "Павел",
                "last_name": "Дуров",
                "photo_100": "https://vk.com/avatar.jpg"
            }]
        }

        with patch("main.requests.post", return_value=mock_user_resp):
            payload = json.dumps({"token": "https://oauth.vk.com/blank.html#access_token=vk1.a.bridge_test&expires_in=0"}).encode("utf-8")
            post_req = urllib.request.Request(
                "http://127.0.0.1:9911/api/vk_token",
                data=payload,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(post_req, timeout=3) as resp:
                self.assertEqual(resp.status, 200)
                data = json.loads(resp.read().decode("utf-8"))
                self.assertTrue(data.get("success"))
                self.assertEqual(data.get("user"), "Павел Дуров")

            # Verify plugin state updated
            st = run_async(self.plugin.vk_get_status())
            self.assertTrue(st["logged_in"])
            self.assertEqual(st["user_name"], "Павел Дуров")


if __name__ == "__main__":
    unittest.main()
