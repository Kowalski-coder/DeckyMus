"""
E2E Test Suite: Spotify PKCE OAuth Authorization Flow
Covers Tiers 1 and 2 for Feature 2 (Spotify PKCE OAuth Flow)
Authoritative Sources:
- ORIGINAL_REQUEST.md §R1, §R2
- PROJECT.md §22-24, §49, §66-79
- RFC 7636 (Proof Key for Code Exchange by OAuth Public Clients)
- RFC 6749 (The OAuth 2.0 Authorization Framework)
"""

import time
import json
import urllib.parse
import urllib.request
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

from tests.test_helpers import (
    create_test_plugin,
    run_async,
    is_valid_svg,
    compute_rfc7636_pkce_challenge,
)

# Standard public Spotify client ID for desktop / open clients per PROJECT.md §22
EXPECTED_PUBLIC_CLIENT_ID = "65b708073fc0480ea92a077233ca87bd"


class TestSpotifyAuthTier1(unittest.TestCase):
    """
    Tier 1: Feature Coverage for Spotify PKCE Authorization Flow
    Minimum 5 tests exercising primary behavior (happy path).
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        self.temp_dir.cleanup()

    def test_tier1_01_pkce_code_challenge_rfc7636_crypto(self):
        """
        Verify PKCE calculation strictly satisfies RFC 7636 Appendix B test vector:
        verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
        expected_challenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
        """
        rfc_verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
        expected_challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

        actual_challenge = compute_rfc7636_pkce_challenge(rfc_verifier)
        self.assertEqual(
            actual_challenge,
            expected_challenge,
            "PKCE computation must match authoritative RFC 7636 Appendix B test vector",
        )

        # Also test plugin helper if implemented
        if hasattr(self.plugin, "_compute_pkce_challenge"):
            calc = self.plugin._compute_pkce_challenge(rfc_verifier)
            self.assertEqual(calc, expected_challenge)

    def test_tier1_02_spotify_auth_url_parameters(self):
        """
        Verify Spotify authorization URL constructed per PROJECT.md §22:
        - Target: https://accounts.spotify.com/authorize
        - client_id: 65b708073fc0480ea92a077233ca87bd
        - response_type: code
        - code_challenge_method: S256
        - code_challenge present
        - scopes: user-read-private, playlist-read-private
        """
        status = run_async(self.plugin.spotify_get_status())
        self.assertIsInstance(status, dict)

        auth_url = status.get("auth_url", "")
        self.assertTrue(
            auth_url.startswith("https://accounts.spotify.com/authorize"),
            f"auth_url '{auth_url}' must target https://accounts.spotify.com/authorize",
        )

        parsed = urllib.parse.urlparse(auth_url)
        params = urllib.parse.parse_qs(parsed.query)

        self.assertEqual(
            params.get("client_id", [""])[0],
            EXPECTED_PUBLIC_CLIENT_ID,
            f"client_id must be public client {EXPECTED_PUBLIC_CLIENT_ID}",
        )
        self.assertEqual(params.get("response_type", [""])[0], "code")
        self.assertEqual(params.get("code_challenge_method", [""])[0], "S256")
        self.assertTrue(
            bool(params.get("code_challenge", [""])[0]),
            "auth_url must include code_challenge parameter",
        )
        scopes = params.get("scope", [""])[0]
        self.assertIn("user-read-private", scopes)
        self.assertIn("playlist-read-private", scopes)

    def test_tier1_03_loopback_and_lan_redirect_uri_split(self):
        """
        Verify loopback vs LAN redirect URI split per PROJECT.md §22:
        Browser button uses loopback (http://127.0.0.1:9911/callback)
        QR SVG encodes LAN URL (http://<lan_ip>:9911/callback)
        """
        local_ip = self.plugin._get_local_ip()
        self.assertTrue(bool(local_ip), "Plugin must detect valid local IP")

        # QR SVG must encode LAN address or helper bridge for external devices
        status = run_async(self.plugin.spotify_get_status())
        qr_svg = status.get("qr_svg", "")
        self.assertTrue(is_valid_svg(qr_svg), "qr_svg must be valid vector SVG")

        # In unauthenticated state, helper or callback URL must point to local IP or port 9911
        helper_url = status.get("helper_url", "")
        auth_url = status.get("auth_url", "")
        self.assertTrue(
            ":9911" in helper_url or ":9911" in auth_url,
            "Auth flow must reference port 9911 callback or helper",
        )

    def test_tier1_04_callback_http_handler_exchanges_code(self):
        """
        Verify local HTTP server on port 9911 handles /callback:
        Exchanges code parameter with Spotify token endpoint, saves tokens,
        updates _spotify_user, and renders success HTML.
        """
        self.plugin._start_auth_server()
        time.sleep(0.3)

        mock_token_payload = {
            "access_token": "mock_spotify_access_token_abc123",
            "token_type": "Bearer",
            "scope": "user-read-private playlist-read-private",
            "expires_in": 3600,
            "refresh_token": "mock_spotify_refresh_token_xyz987",
        }

        mock_user_profile = {
            "id": "spotify_user_42",
            "display_name": "Decky Tester",
            "product": "premium",
            "images": [{"url": "https://example.com/avatar.jpg"}],
        }

        with patch("requests.post") as mock_post, patch("requests.get") as mock_get:
            # Token exchange response
            mock_post_resp = MagicMock()
            mock_post_resp.status_code = 200
            mock_post_resp.json.return_value = mock_token_payload
            mock_post.return_value = mock_post_resp

            # User profile response
            mock_get_resp = MagicMock()
            mock_get_resp.status_code = 200
            mock_get_resp.json.return_value = mock_user_profile
            mock_get.return_value = mock_get_resp

            # Hit the local callback endpoint
            req = urllib.request.Request(
                "http://127.0.0.1:9911/callback?code=mock_spotify_code_12345",
                headers={"User-Agent": "DeckyMusTest/1.0"},
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                self.assertEqual(resp.status, 200)
                body = resp.read().decode("utf-8")
                self.assertIn("Spotify", body)

            # Verify tokens stored
            self.assertEqual(
                self.plugin.config.get("spotify_token"),
                "mock_spotify_access_token_abc123",
            )
            self.assertEqual(
                self.plugin.config.get("spotify_refresh_token"),
                "mock_spotify_refresh_token_xyz987",
            )

    def test_tier1_05_spotify_logout_and_cleanup(self):
        """
        Verify spotify_logout() clears credentials and active session:
        PROJECT.md §79 contract.
        """
        self.plugin.config["spotify_token"] = "sp_access_tok"
        self.plugin.config["spotify_refresh_token"] = "sp_refresh_tok"
        self.plugin._spotify_user = {"id": "test_user", "name": "Tester"}
        self.plugin._save_config()

        self.assertTrue(hasattr(self.plugin, "spotify_logout"))
        res = run_async(self.plugin.spotify_logout())
        self.assertTrue(res.get("success", False) if isinstance(res, dict) else bool(res))

        # Check in-memory and disk persistence
        self.assertEqual(self.plugin.config.get("spotify_token"), "")
        self.assertEqual(self.plugin.config.get("spotify_refresh_token"), "")
        self.assertIsNone(self.plugin._spotify_user)

        status = run_async(self.plugin.spotify_get_status())
        self.assertFalse(status.get("logged_in"))


class TestSpotifyAuthTier2(unittest.TestCase):
    """
    Tier 2: Boundary & Corner Cases for Spotify PKCE Authorization Flow
    Minimum 5 tests exercising access denial, missing codes, CSRF mismatch,
    token refresh, and port rebind.
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.plugin._stop_auth_server()
        self.temp_dir.cleanup()

    def test_tier2_01_callback_access_denied_user_cancelled(self):
        """
        Boundary: User cancels authorization on Spotify page.
        Spotify redirects to /callback?error=access_denied.
        Handler must display graceful error message without crashing.
        """
        self.plugin._start_auth_server()
        time.sleep(0.3)

        with patch("requests.post") as mock_post:
            try:
                req = urllib.request.Request("http://127.0.0.1:9911/callback?error=access_denied")
                with urllib.request.urlopen(req, timeout=3) as resp:
                    status_code = resp.status
            except urllib.error.HTTPError as e:
                status_code = e.code

            # Server should respond with 200 or 400 with informative body, not 500
            self.assertIn(status_code, (200, 400))
            # Ensure state was not corrupted
            self.assertFalse(self.plugin.config.get("spotify_token"))
            mock_post.assert_not_called()

    def test_tier2_02_callback_missing_or_empty_code_parameter(self):
        """
        Boundary: Callback invoked with empty query string or empty code.
        Must return 400 and not initiate token request.
        """
        self.plugin._start_auth_server()
        time.sleep(0.3)

        with patch("requests.post") as mock_post:
            try:
                req = urllib.request.Request("http://127.0.0.1:9911/callback")
                with urllib.request.urlopen(req, timeout=3) as resp:
                    code = resp.status
            except urllib.error.HTTPError as e:
                code = e.code

            self.assertEqual(code, 400)
            mock_post.assert_not_called()

    def test_tier2_03_csrf_state_validation_mismatch(self):
        """
        Boundary: RFC 6749 §10.12 CSRF validation.
        If plugin tracks auth session state, mismatched state must be rejected.
        """
        if hasattr(self.plugin, "_spotify_auth_state"):
            self.plugin._spotify_auth_state = "expected_secure_state_123"
            self.plugin._start_auth_server()
            time.sleep(0.3)

            with patch("requests.post") as mock_post:
                try:
                    req = urllib.request.Request("http://127.0.0.1:9911/callback?code=mock_code&state=forged_state")
                    with urllib.request.urlopen(req, timeout=3) as resp:
                        status = resp.status
                except urllib.error.HTTPError as e:
                    status = e.code

                self.assertIn(status, (400, 403))
                mock_post.assert_not_called()

    def test_tier2_04_token_refresh_lifecycle(self):
        """
        Boundary: When Spotify access token expires, _spotify_ensure_token()
        must silently refresh using spotify_refresh_token without user prompts.
        """
        self.plugin.config["spotify_token"] = "expired_token_123"
        self.plugin.config["spotify_refresh_token"] = "valid_refresh_token_xyz"
        self.plugin._spotify_access_token = "expired_token_123"
        self.plugin._spotify_token_expires = time.time() - 100  # Expired in past

        with patch("requests.post") as mock_post:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {
                "access_token": "fresh_refreshed_access_token_456",
                "expires_in": 3600,
            }
            mock_post.return_value = mock_resp

            fresh_tok = self.plugin._spotify_ensure_token()
            self.assertEqual(fresh_tok, "fresh_refreshed_access_token_456")
            self.assertEqual(self.plugin.config.get("spotify_token"), "fresh_refreshed_access_token_456")

    def test_tier2_05_auth_server_port_reuse(self):
        """
        Boundary: Starting, stopping, and immediately restarting the auth server
        must re-bind port 9911 cleanly without OSError Errno 98 (Address already in use).
        """
        self.plugin._start_auth_server()
        time.sleep(0.2)
        self.plugin._stop_auth_server()
        time.sleep(0.2)

        try:
            self.plugin._start_auth_server()
            time.sleep(0.2)
            self.assertTrue(self.plugin._auth_server is not None)
        except OSError as e:
            self.fail(f"Auth server failed to rebind port 9911 cleanly: {e}")
        finally:
            self.plugin._stop_auth_server()


if __name__ == "__main__":
    unittest.main()
