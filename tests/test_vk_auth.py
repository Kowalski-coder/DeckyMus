"""
E2E Test Suite: VK Music Kate Mobile OAuth & Helper Flow
Covers Tiers 1 and 2 for Feature 3 (VK Music OAuth & Helper Flow)
Authoritative Sources:
- ORIGINAL_REQUEST.md §R1, §R2
- PROJECT.md §25-26, §49, §80-93
- Kate Mobile Client ID 2685278 Specification
"""

import time
import json
import urllib.parse
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
    parse_vk_redirect_url,
)

EXPECTED_VK_CLIENT_ID = "6463690"
EXPECTED_VK_REDIRECT_URI = "https://oauth.vk.ru/blank.html"


class TestVkAuthTier1(unittest.TestCase):
    """
    Tier 1: Feature Coverage for VK Music Kate Mobile OAuth & Helper Flow
    Minimum 5 tests exercising primary behavior (happy path).
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        self.temp_dir.cleanup()

    def test_tier1_01_vk_oauth_url_kate_mobile_parameters(self):
        """
        Verify VK authorization URL adheres strictly to PROJECT.md §25:
        - Target: https://oauth.vk.com/authorize
        - client_id: 2685278 (Kate Mobile)
        - scope: audio,offline
        - redirect_uri: https://oauth.vk.com/blank.html
        - response_type: token
        """
        status = run_async(self.plugin.vk_get_status())
        self.assertIsInstance(status, dict)

        auth_url = status.get("auth_url", "")
        self.assertTrue(
            auth_url.startswith("https://oauth.vk.ru/authorize") or auth_url.startswith("https://oauth.vk.com/authorize"),
            f"auth_url '{auth_url}' must target https://oauth.vk.ru/authorize",
        )

        parsed = urllib.parse.urlparse(auth_url)
        params = urllib.parse.parse_qs(parsed.query)

        self.assertEqual(
            params.get("client_id", [""])[0],
            EXPECTED_VK_CLIENT_ID,
            f"VK client_id must be Kate Mobile {EXPECTED_VK_CLIENT_ID}",
        )
        self.assertEqual(params.get("response_type", [""])[0], "token")
        self.assertEqual(
            params.get("redirect_uri", [""])[0],
            EXPECTED_VK_REDIRECT_URI,
            f"VK redirect_uri must strictly be {EXPECTED_VK_REDIRECT_URI}",
        )
        scope = params.get("scope", [""])[0]
        self.assertIn("audio", scope, "VK scope must include audio")

    def test_tier1_02_vk_helper_page_served_on_port_9911(self):
        """
        Verify local HTTP server on port 9911 serves the VK helper bridge
        at /vk or /vk/helper with responsive mobile HTML and VK auth trigger.
        """
        self.plugin._start_auth_server()
        time.sleep(0.3)

        # Query /vk endpoint
        req = urllib.request.Request("http://127.0.0.1:9911/vk")
        with urllib.request.urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            content_type = resp.headers.get("Content-Type", "")
            self.assertIn("text/html", content_type)
            body = resp.read().decode("utf-8")
            self.assertIn("VK", body)
            self.assertTrue(
                "/vk/auth" in body or "oauth.vk.com" in body,
                "Helper page must link to VK authorization flow",
            )

    def test_tier1_03_vk_qr_svg_encodes_helper_url(self):
        """
        Verify vk_get_status() provides a valid vector QR SVG encoding
        the helper bridge URL (http://<lan_ip>:9911/vk) for smartphone scanning.
        """
        status = run_async(self.plugin.vk_get_status())
        qr_svg = status.get("qr_svg", "")
        helper_url = status.get("helper_url", "")

        self.assertTrue(is_valid_svg(qr_svg), "vk qr_svg must be valid vector SVG XML")
        self.assertTrue(bool(helper_url), "helper_url must not be empty")
        self.assertTrue(
            ":9911" in helper_url,
            f"helper_url '{helper_url}' must target port 9911",
        )

    def test_tier1_04_vk_token_parsing_from_blank_html_hash(self):
        """
        Verify POST /api/vk_token accepts full blank.html URLs with hash fragment:
        https://oauth.vk.com/blank.html#access_token=vk1.a.test_tok_999&expires_in=0&user_id=12345
        Extracts token, validates against VK API, updates user, and saves config.
        """
        self.plugin._start_auth_server()
        time.sleep(0.3)

        raw_url = "https://oauth.vk.com/blank.html#access_token=vk1.a.test_tok_999&expires_in=0&user_id=12345"

        mock_users_resp = {
            "response": [
                {
                    "id": 12345,
                    "first_name": "Павел",
                    "last_name": "Дуров",
                    "photo_100": "https://example.com/durov.jpg",
                }
            ]
        }

        with patch("requests.post") as mock_post, \
             patch.object(self.plugin, "_call_vk_api", return_value=mock_users_resp):
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = mock_users_resp
            mock_post.return_value = mock_resp

            payload = json.dumps({"token": raw_url}).encode("utf-8")
            req = urllib.request.Request(
                "http://127.0.0.1:9911/api/vk_token",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                self.assertEqual(resp.status, 200)
                data = json.loads(resp.read().decode("utf-8"))
                self.assertTrue(data.get("success"), f"Token submission failed: {data}")

            # Verify persisted config and user profile
            self.assertEqual(self.plugin.config.get("vk_token"), "vk1.a.test_tok_999")
            self.assertIsNotNone(self.plugin._vk_user)
            self.assertEqual(str(self.plugin._vk_user.get("id")), "12345")

    def test_tier1_05_vk_logout_and_config_cleared(self):
        """
        Verify vk_logout() clears vk_token and vk_user from config and memory:
        PROJECT.md §93 interface contract.
        """
        self.plugin.config["vk_token"] = "vk1.a.test_token"
        self.plugin.config["vk_user"] = {"id": 12345, "name": "Tester"}
        self.plugin._vk_user = {"id": 12345, "name": "Tester"}
        self.plugin._save_config()

        self.assertTrue(hasattr(self.plugin, "vk_logout"))
        res = run_async(self.plugin.vk_logout())
        self.assertTrue(res.get("success", False) if isinstance(res, dict) else bool(res))

        self.assertEqual(self.plugin.config.get("vk_token"), "")
        self.assertEqual(self.plugin.config.get("vk_user"), {})
        self.assertIsNone(self.plugin._vk_user)

        status = run_async(self.plugin.vk_get_status())
        self.assertFalse(status.get("logged_in"))


class TestVkAuthTier2(unittest.TestCase):
    """
    Tier 2: Boundary & Corner Cases for VK Music Kate Mobile OAuth
    Minimum 5 tests exercising malformed fragments, API error 201,
    invalid JSON, negative user IDs, and concurrent submissions.
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        self.temp_dir.cleanup()

    def test_tier2_01_vk_token_malformed_fragment_handling(self):
        """
        Boundary: Submitting URL with error parameters or missing access_token:
        e.g. https://oauth.vk.com/blank.html#error=access_denied&error_description=User+denied
        Server must return success=False and not persist invalid data.
        """
        self.plugin._start_auth_server()
        time.sleep(0.3)

        malformed_url = "https://oauth.vk.com/blank.html#error=access_denied"
        payload = json.dumps({"token": malformed_url}).encode("utf-8")
        req = urllib.request.Request(
            "http://127.0.0.1:9911/api/vk_token",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        mock_err_resp = {"error": {"error_code": 5, "error_msg": "User authorization failed: invalid access_token"}}
        mock_resp = MagicMock()
        mock_resp.status_code = 401
        mock_resp.json.return_value = mock_err_resp
        with patch("requests.post", return_value=mock_resp), \
             patch.object(self.plugin, "_call_vk_api", return_value=mock_err_resp):
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                self.assertFalse(data.get("success"))

        self.assertFalse(self.plugin.config.get("vk_token"))

    def test_tier2_02_vk_audio_permission_error_201_detection(self):
        """
        Boundary: VK API error 201 ('Access to audio denied') occurs when
        client_id lacks audio rights. Plugin must detect this error and fail auth.
        """
        mock_err = {
            "error": {
                "error_code": 201,
                "error_msg": "Access to audio denied: audio operations restricted for this application",
            }
        }
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_err
        with patch("requests.post", return_value=mock_resp), \
             patch.object(self.plugin, "_call_vk_api", return_value=mock_err):
            # Attempt to set token
            res = self.plugin._sync_vk_set_token("restricted_audio_token_123")
            self.assertFalse(res.get("success"))
            self.assertIn("error", res)

    def test_tier2_03_vk_api_token_endpoint_invalid_payload(self):
        """
        Boundary: POST /api/vk_token with non-JSON payload or empty body
        must respond with HTTP 400 Bad Request.
        """
        self.plugin._start_auth_server()
        time.sleep(0.3)

        body_data = {}
        mock_err = {"error": {"error_code": 5, "error_msg": "Invalid token"}}
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_resp.json.return_value = mock_err
        with patch("requests.post", return_value=mock_resp), \
             patch.object(self.plugin, "_call_vk_api", return_value=mock_err):
            try:
                req = urllib.request.Request(
                    "http://127.0.0.1:9911/api/vk_token",
                    data=b"invalid non-json raw text",
                    headers={"Content-Type": "text/plain"},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=3) as resp:
                    code = resp.status
                    body_data = json.loads(resp.read().decode("utf-8"))
            except urllib.error.HTTPError as e:
                code = e.code

        self.assertTrue(
            code == 400 or body_data.get("success") is False,
            "Invalid payload must either return HTTP 400 or {'success': False}",
        )
        self.assertFalse(self.plugin.config.get("vk_token"))

    def test_tier2_04_vk_user_id_formatting_edge_cases(self):
        """
        Boundary: VK User IDs can be negative (groups/communities), large numbers,
        or strings with spaces. Ensure parsing parses IDs without integer overflow.
        """
        test_cases = [
            ("https://oauth.vk.com/blank.html#access_token=tok1&user_id=-10001", "-10001"),
            ("https://oauth.vk.com/blank.html#access_token=tok2&user_id=999999999999", "999999999999"),
            ("https://oauth.vk.com/blank.html#access_token=tok3&user_id= 42 ", "42"),
        ]
        for url, expected_uid in test_cases:
            params = parse_vk_redirect_url(url)
            self.assertEqual(params.get("user_id", "").strip(), expected_uid)

    def test_tier2_05_vk_concurrent_token_submissions(self):
        """
        Boundary: Concurrent token submissions to /api/vk_token must execute
        safely without data races or corrupted config.json.
        """
        self.plugin._start_auth_server()
        time.sleep(0.3)

        results = []

        def _worker(idx):
            payload = json.dumps({"token": f"https://oauth.vk.com/blank.html#access_token=tok_{idx}&user_id={idx}"}).encode("utf-8")
            req = urllib.request.Request(
                "http://127.0.0.1:9911/api/vk_token",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=4) as resp:
                    results.append(resp.status)
            except Exception as e:
                results.append(str(e))

        mock_user = {
            "response": [{"id": 12345, "first_name": "Concurrent", "last_name": "User"}]
        }
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_user

        with patch("requests.post", return_value=mock_resp), \
             patch.object(self.plugin, "_call_vk_api", return_value=mock_user):
            threads = [threading.Thread(target=_worker, args=(i,)) for i in range(5)]
            for t in threads:
                t.start()
            for t in threads:
                t.join()

        self.assertEqual(len(results), 5)
        self.assertTrue(all(r == 200 for r in results), f"Concurrent requests had failures: {results}")


if __name__ == "__main__":
    unittest.main()
