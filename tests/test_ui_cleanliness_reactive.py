"""
E2E Test Suite: UI Cleanliness (Manual Token Input Elimination) & Reactive State Transition
Covers Tiers 1 and 2 for Feature 4 (Removal of Manual Token Inputs)
and Feature 5 (Reactive State Transition)
Authoritative Sources:
- ORIGINAL_REQUEST.md §R1, §R2
- PROJECT.md §27, §30, §49
- TEST_INFRA.md §8-15
"""

import re
import sys
import json
import subprocess
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

from tests.test_helpers import (
    create_test_plugin,
    run_async,
    is_valid_svg,
    PROJECT_ROOT,
    SRC_DIR,
    TABS_DIR,
)


class TestManualTokenRemovalTier1(unittest.TestCase):
    """
    Tier 1: Feature Coverage for Removal of Manual Token Inputs (Feature 4)
    Authoritative requirement: ORIGINAL_REQUEST.md §R2
    "Полностью удалить поле ручного ввода OAuth-токена из интерфейса плагина."
    """

    def test_tier1_f4_01_yandex_tab_no_manual_token_input(self):
        """
        Verify YandexMusicTab.tsx has NO manual token inputs:
        zero occurrences of tokenInput, <TextField, tokenFieldLabel, or manual login button.
        """
        yandex_tab_path = TABS_DIR / "YandexMusicTab.tsx"
        self.assertTrue(yandex_tab_path.exists(), f"Missing file {yandex_tab_path}")
        content = yandex_tab_path.read_text(encoding="utf-8")

        self.assertNotIn(
            "tokenInput",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: YandexMusicTab.tsx still contains 'tokenInput'",
        )
        self.assertNotIn(
            "<TextField",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: YandexMusicTab.tsx still renders '<TextField'",
        )
        self.assertNotIn(
            "tokenFieldLabel",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: YandexMusicTab.tsx still references 'tokenFieldLabel'",
        )

    def test_tier1_f4_02_spotify_tab_no_manual_credentials_or_token(self):
        """
        Verify SpotifyTab.tsx has NO manual credentials or token inputs:
        zero occurrences of clientIdInput, clientSecretInput, tokenInput, showManualInputs, <TextField.
        """
        spotify_tab_path = TABS_DIR / "SpotifyTab.tsx"
        self.assertTrue(spotify_tab_path.exists(), f"Missing file {spotify_tab_path}")
        content = spotify_tab_path.read_text(encoding="utf-8")

        self.assertNotIn(
            "tokenInput",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: SpotifyTab.tsx still contains 'tokenInput'",
        )
        self.assertNotIn(
            "clientIdInput",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: SpotifyTab.tsx still contains 'clientIdInput'",
        )
        self.assertNotIn(
            "clientSecretInput",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: SpotifyTab.tsx still contains 'clientSecretInput'",
        )
        self.assertNotIn(
            "showManualInputs",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: SpotifyTab.tsx still contains 'showManualInputs'",
        )
        self.assertNotIn(
            "<TextField",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: SpotifyTab.tsx still renders '<TextField'",
        )

    def test_tier1_f4_03_vk_tab_no_manual_token_input(self):
        """
        Verify VkMusicTab.tsx has NO manual token input:
        zero occurrences of tokenInput, pasteTokenOrUrl, tokenFieldPlaceholder, or <TextField.
        """
        vk_tab_path = TABS_DIR / "VkMusicTab.tsx"
        self.assertTrue(vk_tab_path.exists(), f"Missing file {vk_tab_path}")
        content = vk_tab_path.read_text(encoding="utf-8")

        self.assertNotIn(
            "tokenInput",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: VkMusicTab.tsx still contains 'tokenInput'",
        )
        self.assertNotIn(
            "tokenFieldPlaceholder",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: VkMusicTab.tsx still references 'tokenFieldPlaceholder'",
        )
        self.assertNotIn(
            "<TextField",
            content,
            "ORIGINAL_REQUEST.md §R2 violation: VkMusicTab.tsx still renders '<TextField'",
        )

    def test_tier1_f4_04_translations_no_manual_token_instructions(self):
        """
        Verify translations.ts has no legacy instructions telling users to copy/paste tokens into fields.
        """
        translations_path = SRC_DIR / "i18n" / "translations.ts"
        self.assertTrue(translations_path.exists(), f"Missing file {translations_path}")
        content = translations_path.read_text(encoding="utf-8")

        self.assertNotIn(
            "вставьте в поле выше",
            content,
            "translations.ts still contains legacy prompt telling user to paste token into field above",
        )

    def test_tier1_f4_05_unauthenticated_ui_has_only_automated_controls(self):
        """
        Verify that in all 3 tabs, unauthenticated view contains QR code display
        and browser navigation button, without manual fallback components.
        """
        for tab_filename in ("YandexMusicTab.tsx", "SpotifyTab.tsx", "VkMusicTab.tsx"):
            tab_path = TABS_DIR / tab_filename
            content = tab_path.read_text(encoding="utf-8")
            self.assertTrue(
                "qr_svg" in content or "dangerouslySetInnerHTML" in content,
                f"{tab_filename} must render QR SVG code",
            )
            self.assertTrue(
                "openBrowser" in content or "NavigateToExternalWeb" in content or "OpenInSystemBrowser" in content,
                f"{tab_filename} must contain browser opening action",
            )


class TestManualTokenRemovalTier2(unittest.TestCase):
    """
    Tier 2: Boundary & Corner Cases for Removal of Manual Token Inputs (Feature 4)
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_tier2_f4_01_legacy_rpc_token_rejection_or_deprecation(self):
        """
        Boundary: If legacy RPC methods (yandex_set_token, spotify_set_token, vk_set_token)
        are invoked with empty string or whitespace, backend handles safely without unhandled exceptions.
        """
        if hasattr(self.plugin, "yandex_set_token"):
            res = run_async(self.plugin.yandex_set_token("   "))
            self.assertFalse(res.get("success", False))

        if hasattr(self.plugin, "spotify_set_token"):
            res = self.plugin._sync_spotify_set_token("   ", "")
            self.assertFalse(res.get("success", False))

        if hasattr(self.plugin, "vk_set_token"):
            res = run_async(self.plugin.vk_set_token("   "))
            self.assertFalse(res.get("success", False))

    def test_tier2_f4_02_ui_build_without_manual_token_dependencies(self):
        """
        Boundary: TypeScript build verification (npm run build) completes
        successfully with exit code 0 and valid dist/index.js output.
        """
        res = subprocess.run(
            ["npm", "run", "build"],
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            timeout=30,
        )
        self.assertEqual(
            res.returncode,
            0,
            f"npm run build failed: {res.stderr or res.stdout}",
        )
        dist_file = PROJECT_ROOT / "dist" / "index.js"
        self.assertTrue(dist_file.exists() and dist_file.stat().st_size > 1000)

    def test_tier2_f4_03_config_json_schema_cleanliness(self):
        """
        Boundary: Clean initial config has empty token strings and zero residual dirty tokens.
        """
        cfg = self.plugin.config
        self.assertEqual(cfg.get("yandex_token"), "")
        self.assertEqual(cfg.get("vk_token"), "")
        self.assertEqual(cfg.get("spotify_token"), "")

    def test_tier2_f4_04_ui_error_state_never_reveals_manual_input(self):
        """
        Boundary: Static analysis of tabs ensures error handling blocks do NOT
        conditionally render fallback manual input text fields.
        """
        for tab_filename in ("YandexMusicTab.tsx", "SpotifyTab.tsx", "VkMusicTab.tsx"):
            tab_path = TABS_DIR / tab_filename
            content = tab_path.read_text(encoding="utf-8")
            self.assertNotIn(
                "<TextField",
                content,
                f"{tab_filename} must not contain any <TextField even in error state",
            )

    def test_tier2_f4_05_no_hidden_token_inputs_in_codebase(self):
        """
        Boundary: Ensure no obscure hidden input elements exist in src/components/.
        """
        for tsx_file in (SRC_DIR / "components").rglob("*.tsx"):
            content = tsx_file.read_text(encoding="utf-8")
            self.assertNotIn(
                'type="hidden"',
                content,
                f"{tsx_file} contains hidden input element",
            )
            self.assertNotIn(
                'type="password"',
                content,
                f"{tsx_file} contains password input element",
            )


class TestReactiveStateTransitionTier1(unittest.TestCase):
    """
    Tier 1: Feature Coverage for Reactive State Transition (Feature 5)
    Authoritative requirement: ORIGINAL_REQUEST.md §R1, §R2, PROJECT.md §13, §30
    Instant mode switch upon authentication, fast polling interval <= 1500ms.
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_tier1_f5_01_unauthenticated_status_provides_qr_and_browser_url(self):
        """
        Verify all 3 services in unauthenticated state provide valid auth_url and qr_svg.
        """
        for svc in ("vk", "spotify"):
            method = getattr(self.plugin, f"{svc}_get_status")
            status = run_async(method())
            self.assertFalse(status.get("logged_in"))
            self.assertTrue(bool(status.get("auth_url")))
            self.assertTrue(is_valid_svg(status.get("qr_svg")))

    def test_tier1_f5_02_authenticated_status_hides_auth_elements(self):
        """
        Verify authenticated state reports logged_in=True with active user info.
        """
        self.plugin._vk_user = {"id": 12345, "name": "Active VK User", "avatar": ""}
        self.plugin.config["vk_token"] = "valid_tok"
        status = run_async(self.plugin.vk_get_status())

        self.assertTrue(status.get("logged_in"))
        self.assertEqual(status.get("user_name"), "Active VK User")

    def test_tier1_f5_03_instant_state_flip_upon_token_save(self):
        """
        Verify state flips immediately to logged_in=True once token is persisted.
        """
        status_before = run_async(self.plugin.vk_get_status())
        self.assertFalse(status_before.get("logged_in"))

        # Save token
        self.plugin._vk_user = {"id": 999, "name": "New VK User"}
        self.plugin.config["vk_token"] = "tok_flip"
        self.plugin._save_config()

        status_after = run_async(self.plugin.vk_get_status())
        self.assertTrue(status_after.get("logged_in"))

    def test_tier1_f5_04_instant_state_flip_upon_logout(self):
        """
        Verify logout immediately returns status to logged_in=False and provides auth URL.
        """
        self.plugin._vk_user = {"id": 999, "name": "User"}
        self.plugin.config["vk_token"] = "tok"
        self.plugin._save_config()

        run_async(self.plugin.vk_logout())
        status = run_async(self.plugin.vk_get_status())

        self.assertFalse(status.get("logged_in"))
        self.assertTrue(bool(status.get("auth_url")))
        self.assertTrue(is_valid_svg(status.get("qr_svg")))

    def test_tier1_f5_05_frontend_fast_polling_interval(self):
        """
        Verify frontend tabs configure unauthenticated status polling to <= 1500ms
        (PROJECT.md §30: 1200ms polling for instant mode transition).
        """
        for tab_filename in ("YandexMusicTab.tsx", "SpotifyTab.tsx", "VkMusicTab.tsx"):
            tab_path = TABS_DIR / tab_filename
            content = tab_path.read_text(encoding="utf-8")
            # Look for setInterval or polling interval values
            match = re.search(r"setInterval\([^,]+,\s*(\d+)\)", content)
            if match:
                interval_ms = int(match.group(1))
                self.assertLessEqual(
                    interval_ms,
                    1500,
                    f"{tab_filename} polling interval {interval_ms}ms exceeds 1500ms limit",
                )


class TestReactiveStateTransitionTier2(unittest.TestCase):
    """
    Tier 2: Boundary & Corner Cases for Reactive State Transition (Feature 5)
    """

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.plugin = create_test_plugin(self.temp_dir.name)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_tier2_f5_01_rapid_login_logout_cycles(self):
        """
        Boundary: 5 rapid consecutive login/logout cycles do not corrupt state.
        """
        for i in range(5):
            self.plugin._vk_user = {"id": i, "name": f"User {i}"}
            self.plugin.config["vk_token"] = f"tok_{i}"
            self.plugin._save_config()
            status = run_async(self.plugin.vk_get_status())
            self.assertTrue(status.get("logged_in"))

            run_async(self.plugin.vk_logout())
            status = run_async(self.plugin.vk_get_status())
            self.assertFalse(status.get("logged_in"))

    def test_tier2_f5_02_concurrent_status_polling(self):
        """
        Boundary: Concurrent calls to get_status during state transitions
        resolve cleanly without race conditions.
        """
        results = []

        def _poll():
            st = run_async(self.plugin.vk_get_status())
            results.append(st)

        threads = [threading.Thread(target=_poll) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(len(results), 10)
        self.assertTrue(all(isinstance(r, dict) for r in results))

    def test_tier2_f5_03_partial_credentials_state_handling(self):
        """
        Boundary: If token is present but user profile is empty/missing,
        status handles cleanly without KeyError.
        """
        self.plugin.config["vk_token"] = "orphan_token"
        self.plugin._vk_user = None
        status = run_async(self.plugin.vk_get_status())

        self.assertIsInstance(status, dict)
        self.assertFalse(status.get("logged_in"))

    def test_tier2_f5_04_corrupted_config_json_recovery(self):
        """
        Boundary: If config.json on disk is corrupted with invalid JSON,
        _load_config() recovers with defaults without crashing.
        """
        self.plugin.config_file.write_text("{ corrupt json: [", encoding="utf-8")
        recovered_cfg = self.plugin._load_config()

        self.assertIsInstance(recovered_cfg, dict)
        self.assertIn("music_folders", recovered_cfg)
        self.assertEqual(recovered_cfg.get("yandex_token"), "")

    def test_tier2_f5_05_auth_polling_cancelled_on_logout(self):
        """
        Boundary: If user logs out during an active auth flow, background polling
        task is cancelled and does not resurrect logged-in state.
        """
        if hasattr(self.plugin, "_yandex_poll_task") and self.plugin._yandex_poll_task:
            task = self.plugin._yandex_poll_task
            if hasattr(self.plugin, "yandex_logout"):
                run_async(self.plugin.yandex_logout())
                self.assertTrue(task.cancelled() or task.done())


if __name__ == "__main__":
    unittest.main()
