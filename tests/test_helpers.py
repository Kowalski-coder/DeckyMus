"""
Test Helpers and Fixtures for DeckyMus E2E Test Suite.
Provides isolated plugin instantiation, XML/SVG validation,
PKCE cryptographic verification, and asynchronous test runner utilities.
"""

import sys
import os
import json
import base64
import hashlib
import asyncio
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, Any, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PY_MODULES = PROJECT_ROOT / "py_modules"
SRC_DIR = PROJECT_ROOT / "src"
TABS_DIR = SRC_DIR / "components" / "tabs"

# Ensure vendored modules and plugin root are on sys.path
if str(PY_MODULES) not in sys.path:
    sys.path.insert(0, str(PY_MODULES))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import main


def create_test_plugin(temp_dir: str) -> main.Plugin:
    """
    Creates an isolated Plugin instance whose config is stored strictly inside temp_dir.
    Guarantees no modifications occur to the user's actual ~/.config/deckymus/config.json.
    """
    td = Path(temp_dir)
    cfg_dir = td / ".config" / "deckymus"
    cfg_dir.mkdir(parents=True, exist_ok=True)

    plugin = main.Plugin()
    plugin.home = td
    plugin.config_dir = cfg_dir
    plugin.config_file = cfg_dir / "config.json"
    plugin.downloads_meta_file = cfg_dir / "downloaded.json"
    plugin.socket_path = str(td / "test-deckymus-mpv.sock")

    # Re-initialize clean config in isolated temp directory
    plugin.config = plugin._load_config()
    plugin._save_config()

    # Reset cached user session state to guarantee complete host isolation
    plugin._vk_user = None
    plugin._vk_logged_in = False
    plugin._spotify_user = None
    plugin._spotify_access_token = ""
    plugin._spotify_token_expires = 0
    plugin._spotify_pkce_session = None
    plugin._spotify_auth_state = None
    plugin._yandex_client = None
    plugin._yandex_user_code = None
    plugin._yandex_device_code = None
    plugin._yandex_auth_url = None
    plugin._yandex_qr_svg = None
    plugin._yandex_code_expires_at = 0
    plugin._yandex_poll_task = None
    plugin._yandex_auth_cooldown_until = 0.0
    return plugin


def run_async(coro):
    """Executes an async coroutine synchronously inside standard unittest."""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(coro)


def is_valid_svg(svg_data: Optional[str]) -> bool:
    """
    Validates that svg_data is a non-empty, well-formed vector SVG document.
    Checks XML parsing and basic SVG namespace semantics.
    """
    if not svg_data or not isinstance(svg_data, str):
        return False
    stripped = svg_data.strip()
    if not stripped.startswith("<svg") and not stripped.startswith("<?xml"):
        return False
    if "</svg>" not in stripped:
        return False
    try:
        root = ET.fromstring(stripped)
        return "svg" in root.tag.lower()
    except ET.ParseError:
        return False


def compute_rfc7636_pkce_challenge(verifier: str) -> str:
    """
    Computes RFC 7636 S256 code challenge from code_verifier:
    code_challenge = BASE64URL-ENCODE(SHA256(ASCII(code_verifier))) without padding.
    """
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    return challenge


def parse_vk_redirect_url(url_or_fragment: str) -> Dict[str, str]:
    """
    Parses token and parameters from VK redirect URL or URL hash fragment.
    Authoritative format: https://oauth.vk.com/blank.html#access_token=...&expires_in=0&user_id=...
    """
    if not url_or_fragment:
        return {}

    target = url_or_fragment.strip()
    if "#" in target:
        fragment = target.split("#", 1)[1]
    elif "?" in target:
        fragment = target.split("?", 1)[1]
    else:
        fragment = target

    params = urllib.parse.parse_qs(fragment)
    result = {}
    for k, v in params.items():
        if v:
            result[k] = v[0]
    return result
