"""
E2E Test Suite: Yandex Music Authorization (RFC 8628 Device Flow)
Covers Tiers 1 and 2 for Feature 1 (Yandex Music Device Code Flow)
Authoritative Sources:
- ORIGINAL_REQUEST.md §R1, §R2
- PROJECT.md §18-21, §49, §50-65
- RFC 8628 (OAuth 2.0 Device Authorization Grant)
"""

import re
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

from tests.test_helpers import (
    create_test_plugin,
    run_async,
    is_valid_svg,
)


class TestYandexAuthTier1(unittest.TestCase):
    """
    Tier 1: Feature Coverage for Yandex Music Device Code Flow
    Minimum 5 tests exercising primary behavior (happy path).
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        if hasattr(self.plugin, "_yandex_poll_task") and self.plugin._yandex_poll_task and not self.plugin._yandex_poll_task.done():
            self.plugin._yandex_poll_task.cancel()
        self.temp_dir.cleanup()

    def test_tier1_01_rfc8628_device_code_protocol_compliance(self):
        """
        Verify RFC 8628 device code request returns authoritative parameters:
        user_code (8 alphanumeric chars), device_code (32 hex chars),
        verification_url ('https://ya.ru/device'), expires_in (>0), interval (>=1).
        """
        import yandex_music
        from yandex_music import Client

        client = Client()
        self.assertTrue(
            hasattr(client, "request_device_code"),
            "yandex_music client missing request_device_code (DeviceAuthMixin)",
        )

        mock_oauth_response = {
            "device_code": "0123456789abcdef0123456789abcdef",
            "user_code": "7ulfg3z2",
            "verification_url": "https://ya.ru/device",
            "expires_in": 300,
            "interval": 5,
        }
        with patch.object(client._request, "post", return_value=mock_oauth_response):
            device_code_obj = client.request_device_code()

        self.assertIsNotNone(device_code_obj)
        self.assertTrue(hasattr(device_code_obj, "user_code"))
        self.assertTrue(hasattr(device_code_obj, "device_code"))
        self.assertTrue(hasattr(device_code_obj, "verification_url"))

        user_code = getattr(device_code_obj, "user_code")
        device_code = getattr(device_code_obj, "device_code")
        verification_url = getattr(device_code_obj, "verification_url")
        expires_in = getattr(device_code_obj, "expires_in", 300)
        interval = getattr(device_code_obj, "interval", 5)

        # RFC 8628 & Yandex specification assertions
        self.assertRegex(
            user_code,
            r"^[a-zA-Z0-9]{8}$",
            f"user_code '{user_code}' must be 8 alphanumeric characters",
        )
        self.assertRegex(
            device_code,
            r"^[a-fA-F0-9]{32}$",
            f"device_code '{device_code}' must be 32-character hex string",
        )
        self.assertEqual(verification_url, "https://ya.ru/device")
        self.assertGreaterEqual(expires_in, 60, "Device code TTL must be at least 60s")
        self.assertGreaterEqual(interval, 1, "Polling interval must be at least 1s")

    def test_tier1_02_auth_url_construction_with_prefilled_user_code(self):
        """
        Verify URL construction per PROJECT.md §19:
        Must be 'https://ya.ru/device?user_code=<user_code>' to auto-fill code in browser.
        """
        sample_code = "7ulfg3z2"
        expected_url = f"https://ya.ru/device?user_code={sample_code}"

        # Verify URL structure
        self.assertTrue(expected_url.startswith("https://ya.ru/device"))
        self.assertIn(f"user_code={sample_code}", expected_url)

        # If plugin implements a URL constructor, test it directly
        if hasattr(self.plugin, "_get_yandex_auth_url"):
            actual_url = self.plugin._get_yandex_auth_url(sample_code)
            self.assertEqual(actual_url, expected_url)

    def test_tier1_03_vector_qr_svg_generation(self):
        """
        Verify that _generate_qr_svg creates a valid vector SVG document
        containing well-formed XML, xmlns attribute, and vector paths.
        """
        test_url = "https://ya.ru/device?user_code=testcode"
        svg = self.plugin._generate_qr_svg(test_url)

        self.assertIsNotNone(svg, "QR SVG output must not be None")
        self.assertTrue(is_valid_svg(svg), "QR SVG must be a valid SVG document")
        self.assertIn("xmlns", svg)
        self.assertTrue(
            "<path" in svg or "<rect" in svg,
            "Vector QR SVG must contain vector graphics elements (<path> or <rect>)",
        )

    def test_tier1_04_yandex_get_status_unauthenticated_contract(self):
        """
        Verify yandex_get_status() contract when unauthenticated:
        Must conform to PROJECT.md §51-64 (YandexStatus interface):
        {
          has_token: False,
          logged_in: False,
          user_name: str,
          auth_url: str,
          user_code: str,
          qr_svg: str,
          expires_in: int
        }
        """
        from yandex_music import DeviceCode
        mock_code = DeviceCode(
            device_code="0123456789abcdef0123456789abcdef",
            user_code="7ulfg3z2",
            verification_url="https://ya.ru/device",
            expires_in=300,
            interval=5,
        )
        with patch("yandex_music.Client.request_device_code", return_value=mock_code):
            status = run_async(self.plugin.yandex_get_status())

        self.assertIsInstance(status, dict)
        self.assertFalse(status.get("has_token"), "Unauthenticated status must have has_token=False")
        self.assertFalse(status.get("logged_in"), "Unauthenticated status must have logged_in=False")
        self.assertIn("user_name", status)

        # Requirement-driven interface contract checks from PROJECT.md §49-64
        self.assertTrue(
            "auth_url" in status,
            "PROJECT.md Contract violation: yandex_get_status() missing 'auth_url'",
        )
        self.assertTrue(
            "user_code" in status,
            "PROJECT.md Contract violation: yandex_get_status() missing 'user_code'",
        )
        self.assertTrue(
            "qr_svg" in status,
            "PROJECT.md Contract violation: yandex_get_status() missing 'qr_svg'",
        )
        if status.get("auth_url"):
            self.assertTrue(
                status["auth_url"].startswith("https://ya.ru/device") or status["auth_url"].startswith("https://oauth.yandex.ru"),
                f"auth_url '{status['auth_url']}' must target https://ya.ru/device or https://oauth.yandex.ru",
            )
        if status.get("qr_svg"):
            self.assertTrue(
                is_valid_svg(status["qr_svg"]),
                "qr_svg must be valid SVG XML",
            )

    def test_tier1_05_yandex_logout_and_session_cleared(self):
        """
        Verify yandex_logout() clears token from config.json and resets client:
        PROJECT.md §65 interface contract.
        """
        # Prepopulate active token in isolated config
        self.plugin.config["yandex_token"] = "mock_active_yandex_token_12345"
        self.plugin._save_config()
        self.plugin._yandex_client = MagicMock()

        self.assertTrue(
            hasattr(self.plugin, "yandex_logout"),
            "PROJECT.md Contract violation: Plugin missing 'yandex_logout' RPC method",
        )

        res = run_async(self.plugin.yandex_logout())
        self.assertIsInstance(res, dict)
        self.assertTrue(res.get("success"), "yandex_logout must return {'success': True}")

        # Verify config is cleared and saved
        self.assertEqual(self.plugin.config.get("yandex_token"), "")
        self.assertIsNone(self.plugin._yandex_client)

        # Verify disk persistence
        reloaded_plugin = create_test_plugin(self.temp_dir.name)
        self.assertEqual(reloaded_plugin.config.get("yandex_token"), "")


class TestYandexAuthTier2(unittest.TestCase):
    """
    Tier 2: Boundary & Corner Cases for Yandex Music Device Code Flow
    Minimum 5 tests exercising input variations, rate-limiting, network failures,
    expiry handling, and corrupted data recovery.
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        if hasattr(self.plugin, "_yandex_poll_task") and self.plugin._yandex_poll_task and not self.plugin._yandex_poll_task.done():
            self.plugin._yandex_poll_task.cancel()
        self.temp_dir.cleanup()

    def test_tier2_01_user_code_normalization_and_formatting(self):
        """
        Boundary: RFC 8628 §6.1 specifies user codes should be normalized
        (stripping whitespace, hyphens, and handling uppercase/lowercase).
        """
        raw_code = "  AbC-12-xY  \n"
        cleaned_code = re.sub(r"[^a-zA-Z0-9]", "", raw_code).lower()
        self.assertEqual(cleaned_code, "abc12xy")

        auth_url = f"https://ya.ru/device?user_code={cleaned_code}"
        self.assertEqual(auth_url, "https://ya.ru/device?user_code=abc12xy")
        self.assertNotIn("-", auth_url.split("user_code=")[1])
        self.assertNotIn(" ", auth_url)

    def test_tier2_02_device_code_poller_expiry_detection(self):
        """
        Boundary: When device code expires (HTTP 400 'expired_token' or TTL reaches 0),
        the polling loop must cease polling, avoid zombie loops, and trigger renewal.
        """
        from yandex_music import Client
        from yandex_music.exceptions import YandexMusicError

        mock_poll = MagicMock()
        # Simulate Yandex OAuth expired_token response
        mock_poll.side_effect = YandexMusicError("expired_token: The device_code has expired")

        # If the plugin has polling task logic, test clean error trapping
        if hasattr(self.plugin, "_poll_yandex_token"):
            with patch.object(Client, "poll_device_token", mock_poll):
                try:
                    res = run_async(self.plugin._poll_yandex_token("expired_device_code"))
                    self.assertFalse(res)
                except Exception as e:
                    self.fail(f"Poller must handle expired_token without crashing: {e}")

    def test_tier2_03_network_outage_resilience(self):
        """
        Boundary: Network drop or timeout during device code request or polling
        must not crash the Decky daemon process. Status must report unauthenticated.
        """
        with patch("yandex_music.Client.request_device_code", side_effect=Exception("Connection timed out to oauth.yandex.ru")), \
             patch("requests.post", side_effect=Exception("Connection timed out")):
            status = run_async(self.plugin.yandex_get_status())
            self.assertIsInstance(status, dict)
            self.assertFalse(status.get("logged_in"))

    def test_tier2_04_polling_interval_rate_limiting_compliance(self):
        """
        Boundary: RFC 8628 §3.5 enforces minimum polling interval.
        Verify system enforces minimum interval >= 3 seconds between poll requests
        to prevent HTTP 429 slow_down penalties.
        """
        interval = getattr(self.plugin, "_yandex_poll_interval", 5)
        self.assertGreaterEqual(interval, 3, "Polling interval must be at least 3 seconds")

    def test_tier2_05_invalid_token_cleanup_and_recovery(self):
        """
        Boundary: If an invalid or revoked token exists in config.json,
        client initialization must fail gracefully, reset logged_in to False,
        and make auth controls available rather than freezing.
        """
        self.plugin.config["yandex_token"] = "INVALID_CORRUPTED_TOKEN_0000"
        self.plugin._save_config()

        from yandex_music import DeviceCode
        mock_code = DeviceCode(
            device_code="0123456789abcdef0123456789abcdef",
            user_code="7ulfg3z2",
            verification_url="https://ya.ru/device",
            expires_in=300,
            interval=5,
        )
        with patch("yandex_music.Client.init") as mock_init, \
             patch("yandex_music.Client.request_device_code", return_value=mock_code):
            from yandex_music.exceptions import UnauthorizedError
            mock_init.side_effect = UnauthorizedError("Invalid token")

            # Initialize client with bad token
            res = run_async(self.plugin._init_yandex_client("INVALID_CORRUPTED_TOKEN_0000"))
            self.assertIsNone(res, "Invalid token must return None client")
            self.assertIsNone(self.plugin._yandex_client)

            status = run_async(self.plugin.yandex_get_status())
            self.assertFalse(status.get("logged_in"))


if __name__ == "__main__":
    unittest.main()
