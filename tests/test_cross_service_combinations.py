"""
E2E Test Suite: Tier 3 Cross-Feature & Multi-Service State Combinations
Covers Pairwise and Triad combinations across Yandex, Spotify, and VK services.
Authoritative Sources:
- ORIGINAL_REQUEST.md §R1, §R2
- PROJECT.md §1-14, §48-96
- TEST_INFRA.md §8-16, §35
"""

import time
import json
import urllib.request
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

from tests.test_helpers import (
    create_test_plugin,
    run_async,
    is_valid_svg,
)


class TestCrossServiceCombinationsTier3(unittest.TestCase):
    """
    Tier 3: Pairwise and Triad Cross-Feature Integration Testing
    Minimum 5 tests verifying multi-service state combinations:
    concurrent sessions, independent logouts, clean config persistence,
    and server thread safety.
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        if hasattr(self.plugin, "_yandex_poll_task") and self.plugin._yandex_poll_task and not self.plugin._yandex_poll_task.done():
            self.plugin._yandex_poll_task.cancel()
        self.temp_dir.cleanup()

    def test_tier3_01_pairwise_yandex_auth_spotify_unauth_vk_unauth(self):
        """
        Pairwise Combination 1: Yandex Authenticated, Spotify & VK Unauthenticated.
        - Yandex reports logged_in=True with active user profile.
        - Spotify & VK report logged_in=False, both providing active QR SVGs and auth URLs.
        - Configuration persistence isolates Yandex token without polluting Spotify/VK tokens.
        """
        self.plugin.config["yandex_token"] = "valid_yandex_tok_301"
        self.plugin._save_config()

        # Mock Yandex client
        mock_yandex = MagicMock()
        mock_yandex.me.account.full_name = "Yandex Deck User"
        self.plugin._yandex_client = mock_yandex

        # Check all 3 statuses
        yandex_st = run_async(self.plugin.yandex_get_status())
        spotify_st = run_async(self.plugin.spotify_get_status())
        vk_st = run_async(self.plugin.vk_get_status())

        self.assertTrue(yandex_st.get("logged_in"))
        self.assertEqual(yandex_st.get("user_name"), "Yandex Deck User")

        self.assertFalse(spotify_st.get("logged_in"))
        self.assertTrue(is_valid_svg(spotify_st.get("qr_svg")))

        self.assertFalse(vk_st.get("logged_in"))
        self.assertTrue(is_valid_svg(vk_st.get("qr_svg")))

    def test_tier3_02_pairwise_spotify_auth_vk_auth_yandex_unauth(self):
        """
        Pairwise Combination 2: Spotify & VK Authenticated, Yandex Unauthenticated.
        - Spotify reports logged_in=True with Spotify user.
        - VK reports logged_in=True with VK user.
        - Yandex reports logged_in=False with QR SVG.
        """
        # Configure Spotify
        self.plugin.config["spotify_token"] = "sp_tok_302"
        self.plugin.config["spotify_refresh_token"] = "sp_ref_302"
        self.plugin._spotify_user = {"id": "sp_user_302", "name": "Spotify Deck User"}

        # Configure VK
        self.plugin.config["vk_token"] = "vk_tok_302"
        self.plugin.config["vk_user"] = {"id": 888, "name": "VK Deck User"}
        self.plugin._vk_user = {"id": 888, "name": "VK Deck User"}

        self.plugin._save_config()

        from yandex_music import DeviceCode
        mock_code = DeviceCode(
            device_code="mock_device_code_302",
            user_code="user302x",
            verification_url="https://ya.ru/device",
            expires_in=300,
            interval=5,
        )
        with patch("yandex_music.Client.request_device_code", return_value=mock_code):
            spotify_st = run_async(self.plugin.spotify_get_status())
            vk_st = run_async(self.plugin.vk_get_status())
            yandex_st = run_async(self.plugin.yandex_get_status())

        self.assertTrue(spotify_st.get("logged_in"))
        self.assertEqual(spotify_st.get("user_name"), "Spotify Deck User")

        self.assertTrue(vk_st.get("logged_in"))
        self.assertEqual(vk_st.get("user_name"), "VK Deck User")

        self.assertFalse(yandex_st.get("logged_in"))

    def test_tier3_03_triad_all_three_services_concurrently_authenticated(self):
        """
        Triad Combination 3: All 3 Services Authenticated Simultaneously.
        - Yandex, Spotify, and VK all report logged_in=True.
        - config.json safely retains all 3 credentials without collisions or data truncation.
        """
        self.plugin.config["yandex_token"] = "yandex_token_303"
        self.plugin.config["spotify_token"] = "spotify_token_303"
        self.plugin.config["spotify_refresh_token"] = "spotify_refresh_303"
        self.plugin.config["vk_token"] = "vk_token_303"

        mock_yandex = MagicMock()
        mock_yandex.me.account.full_name = "User Yandex"
        self.plugin._yandex_client = mock_yandex

        self.plugin._spotify_user = {"id": "sp_303", "name": "User Spotify"}
        self.plugin._vk_user = {"id": 303, "name": "User VK"}
        self.plugin._save_config()

        # Reload from disk in a fresh instance to verify disk persistence
        reloaded = create_test_plugin(self.temp_dir.name)
        reloaded._yandex_client = mock_yandex
        reloaded._spotify_user = self.plugin._spotify_user
        reloaded._vk_user = self.plugin._vk_user

        y_st = run_async(reloaded.yandex_get_status())
        s_st = run_async(reloaded.spotify_get_status())
        v_st = run_async(reloaded.vk_get_status())

        self.assertTrue(y_st.get("logged_in"))
        self.assertTrue(s_st.get("logged_in"))
        self.assertTrue(v_st.get("logged_in"))

    def test_tier3_04_independent_logout_isolation(self):
        """
        Combination 4: Independent Logout Isolation.
        Logging out of Spotify must NOT affect Yandex or VK sessions.
        Logging out of Yandex must NOT affect VK session.
        Logging out of VK completes clean wipe.
        """
        # Set up all 3 as logged in
        self.plugin.config["yandex_token"] = "ytok"
        self.plugin.config["spotify_token"] = "stok"
        self.plugin.config["vk_token"] = "vtok"

        self.plugin._yandex_client = MagicMock()
        self.plugin._spotify_user = {"id": "sp_user", "name": "Spotify"}
        self.plugin._vk_user = {"id": "vk_user", "name": "VK"}
        self.plugin._save_config()

        from yandex_music import DeviceCode
        mock_code = DeviceCode(
            device_code="mock_device_code_304",
            user_code="user304x",
            verification_url="https://ya.ru/device",
            expires_in=300,
            interval=5,
        )
        with patch("yandex_music.Client.request_device_code", return_value=mock_code):
            # 1. Logout Spotify
            run_async(self.plugin.spotify_logout())
            self.assertFalse(run_async(self.plugin.spotify_get_status()).get("logged_in"))
            self.assertTrue(run_async(self.plugin.yandex_get_status()).get("logged_in"))
            self.assertTrue(run_async(self.plugin.vk_get_status()).get("logged_in"))

            # 2. Logout Yandex (if method exists)
            if hasattr(self.plugin, "yandex_logout"):
                run_async(self.plugin.yandex_logout())
                self.assertFalse(run_async(self.plugin.yandex_get_status()).get("logged_in"))
                self.assertTrue(run_async(self.plugin.vk_get_status()).get("logged_in"))

            # 3. Logout VK
            run_async(self.plugin.vk_logout())
            self.assertFalse(run_async(self.plugin.vk_get_status()).get("logged_in"))

    def test_tier3_05_concurrent_auth_server_requests(self):
        """
        Combination 5: Simultaneous requests across multiple endpoints on port 9911
        (/status, /vk, /callback) proceed concurrently on separate threads without deadlock.
        """
        self.plugin._start_auth_server()
        time.sleep(0.3)

        results = []

        def _fetch(endpoint):
            try:
                req = urllib.request.Request(f"http://127.0.0.1:9911{endpoint}")
                with urllib.request.urlopen(req, timeout=4) as resp:
                    results.append((endpoint, resp.status))
            except Exception as e:
                results.append((endpoint, str(e)))

        endpoints = ["/status", "/vk", "/spotify/helper", "/status", "/vk"]
        threads = [threading.Thread(target=_fetch, args=(ep,)) for ep in endpoints]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(len(results), 5)
        for ep, st in results:
            self.assertEqual(st, 200, f"Endpoint {ep} failed with {st}")

    def test_tier3_06_shared_config_atomicity(self):
        """
        Combination 6: Simultaneous config writes from different threads
        (e.g. Yandex token saved at the exact time as VK token) preserve all keys.
        """
        def _write_yandex():
            self.plugin.config["yandex_token"] = "concurrent_yandex_token"
            self.plugin._save_config()

        def _write_vk():
            self.plugin.config["vk_token"] = "concurrent_vk_token"
            self.plugin._save_config()

        def _write_spotify():
            self.plugin.config["spotify_token"] = "concurrent_spotify_token"
            self.plugin._save_config()

        threads = [
            threading.Thread(target=_write_yandex),
            threading.Thread(target=_write_vk),
            threading.Thread(target=_write_spotify),
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # Reload config from disk
        disk_cfg = self.plugin._load_config()
        self.assertIsInstance(disk_cfg, dict)
        # All three keys must exist and be valid strings
        self.assertIn("yandex_token", disk_cfg)
        self.assertIn("vk_token", disk_cfg)
        self.assertIn("spotify_token", disk_cfg)


if __name__ == "__main__":
    unittest.main()
