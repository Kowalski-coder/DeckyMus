#!/usr/bin/env python3
"""
DeckyMus - Native Music Player for Steam Deck (Decky Loader).
Provides background playback, local library scanner, Yandex Music, and YouTube Music
integrated seamlessly into SteamOS via MPV IPC.
"""

import os
import sys
import re
import pwd
import json
import socket
import asyncio
import logging
import subprocess
import base64
import urllib.parse
import time
import secrets
import hashlib
from pathlib import Path
import threading
from http.server import HTTPServer, ThreadingHTTPServer, BaseHTTPRequestHandler
from concurrent.futures import ThreadPoolExecutor

import importlib.util

# Inject bundled pure-python modules
PLUGIN_DIR = Path(__file__).resolve().parent
PY_MODULES = PLUGIN_DIR / "py_modules"
BIN_DIR = PLUGIN_DIR / "bin"
if str(PY_MODULES) not in sys.path:
    sys.path.insert(0, str(PY_MODULES))

def _get_bin(name: str) -> str:
    """Returns path to bundled binary in bin/ if present, falling back to system binary."""
    bundled = BIN_DIR / name
    if bundled.is_file():
        try:
            bundled.chmod(0o755)
        except Exception:
            pass
        return str(bundled)
    return name

# Force preload standard XML and HTML modules so that PyInstaller's stripped/frozen runtime
# cannot block submodules like xml.etree, xml.dom, and html.parser
def _preload_xml_tree():
    xml_dir = PY_MODULES / "xml"
    html_dir = PY_MODULES / "html"
    modules_to_preload = [
        # XML
        ("xml", xml_dir / "__init__.py"),
        ("xml.parsers", xml_dir / "parsers" / "__init__.py"),
        ("xml.parsers.expat", xml_dir / "parsers" / "expat.py"),
        ("xml.sax", xml_dir / "sax" / "__init__.py"),
        ("xml.sax._exceptions", xml_dir / "sax" / "_exceptions.py"),
        ("xml.sax.handler", xml_dir / "sax" / "handler.py"),
        ("xml.sax.xmlreader", xml_dir / "sax" / "xmlreader.py"),
        ("xml.sax.saxutils", xml_dir / "sax" / "saxutils.py"),
        ("xml.sax.expatreader", xml_dir / "sax" / "expatreader.py"),
        ("xml.dom", xml_dir / "dom" / "__init__.py"),
        ("xml.dom.domreg", xml_dir / "dom" / "domreg.py"),
        ("xml.dom.minicompat", xml_dir / "dom" / "minicompat.py"),
        ("xml.dom.xmlbuilder", xml_dir / "dom" / "xmlbuilder.py"),
        ("xml.dom.expatbuilder", xml_dir / "dom" / "expatbuilder.py"),
        ("xml.dom.pulldom", xml_dir / "dom" / "pulldom.py"),
        ("xml.dom.minidom", xml_dir / "dom" / "minidom.py"),
        ("xml.etree", xml_dir / "etree" / "__init__.py"),
        ("xml.etree.ElementPath", xml_dir / "etree" / "ElementPath.py"),
        ("xml.etree.ElementInclude", xml_dir / "etree" / "ElementInclude.py"),
        ("xml.etree.ElementTree", xml_dir / "etree" / "ElementTree.py"),
        ("xml.etree.cElementTree", xml_dir / "etree" / "cElementTree.py"),
        # HTML
        ("html", html_dir / "__init__.py"),
        ("html.entities", html_dir / "entities.py"),
        ("html.parser", html_dir / "parser.py"),
    ]
    for name, filepath in modules_to_preload:
        if filepath.exists():
            try:
                spec = importlib.util.spec_from_file_location(name, str(filepath))
                if spec and spec.loader:
                    mod = importlib.util.module_from_spec(spec)
                    sys.modules[name] = mod
                    parts = name.split(".")
                    if len(parts) > 1:
                        parent_name = ".".join(parts[:-1])
                        if parent_name in sys.modules:
                            setattr(sys.modules[parent_name], parts[-1], mod)
                    spec.loader.exec_module(mod)
            except Exception:
                pass

_preload_xml_tree()

try:
    import requests
except ImportError:
    requests = None

try:
    import decky
    logger = decky.logger
except ImportError:
    decky = None
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("DeckyMus")

try:
    import qrcode
    import qrcode.image.svg
except Exception:
    qrcode = None

try:
    import mutagen
    from mutagen.id3 import ID3
    from mutagen.mp3 import MP3
    from mutagen.flac import FLAC
    from mutagen.oggvorbis import OggVorbis
    from mutagen.mp4 import MP4
except Exception as e:
    mutagen = None
    logger.warning(f"Mutagen import note: {e}")

try:
    from yandex_music import Client as YandexClient
    from yandex_music.exceptions import DeviceAuthError
except Exception as e:
    YandexClient = None
    DeviceAuthError = Exception
    logger.warning(f"Yandex Music import note: {e}")

try:
    from ytmusicapi import YTMusic
except Exception as e:
    YTMusic = None
    logger.warning(f"ytmusicapi import note: {e}")

try:
    import yt_dlp
except Exception as e:
    yt_dlp = None
    logger.warning(f"yt_dlp import note: {e}")

SPOTIFY_PUBLIC_CLIENT_ID = "65b708073fc0480ea92a077233ca87bd"
SPOTIFY_AUTH_SCOPE = "user-read-private user-read-email user-library-read playlist-read-private playlist-read-collaborative"
SPOTIFY_PKCE_TTL = 600  # 10 minutes session cache validity before regenerating verifier

KATE_USER_AGENT = "KateMobileAndroid/56 lite-443 (Android 10; SDK 29; arm64-v8a; samsung SM-G973F; Pixel 4; ru)"
VK_CLIENT_ID = "6463690"
VK_API_VERSION = "5.131"
VK_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Yandex Music OAuth Credentials (matching Cassette desktop app)
YANDEX_CLIENT_ID = "23cabbbdc6cd418abb4b39c32c41195d"
YANDEX_AUTH_URL = f"https://oauth.yandex.ru/authorize?response_type=token&client_id={YANDEX_CLIENT_ID}"

def get_user_info():
    """Detects target Steam Deck unprivileged user (deck or current user) and paths."""
    username = None
    if decky and hasattr(decky, "DECKY_USER") and decky.DECKY_USER:
        username = decky.DECKY_USER
    if not username:
        username = os.environ.get("DECKY_USER")
    if not username and decky and hasattr(decky, "DECKY_USER_HOME") and decky.DECKY_USER_HOME:
        username = Path(decky.DECKY_USER_HOME).name
    if not username:
        try:
            username = pwd.getpwuid(1000).pw_name
        except Exception:
            if os.path.isdir("/home/deck"):
                username = "deck"
            else:
                username = os.environ.get("USER", "deck")

    try:
        pw = pwd.getpwnam(username)
    except KeyError:
        pw = pwd.getpwuid(1000)
        username = pw.pw_name

    return {
        "username": username,
        "home": pw.pw_dir,
        "uid": pw.pw_uid,
        "gid": pw.pw_gid
    }


class ReusableHTTPServer(ThreadingHTTPServer):
    """
    Multi-threaded HTTP server enabling immediate socket address reuse (SO_REUSEADDR)
    to eliminate port collision errors upon fast reload.
    Strictly avoids kernel port reuse hashing to prevent TCP RST / [Errno 104] connection reset races
    in the Linux kernel when sockets are closed during tests or reloads.
    Tracks active worker threads and gracefully drains them upon server_close().
    """
    allow_reuse_address = True
    daemon_threads = False
    block_on_close = True

    def server_bind(self):
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        super().server_bind()

    def server_close(self):
        """
        Gracefully close listening socket and drain active worker threads with bounded timeout.
        """
        try:
            if self.socket:
                self.socket.close()
        except Exception:
            pass

        if hasattr(self, "_threads"):
            if hasattr(self._threads, "pop_all"):
                threads = self._threads.pop_all()
            elif isinstance(self._threads, (list, tuple, set)):
                threads = list(self._threads)
            else:
                threads = []
            deadline = time.time() + 3.0
            current = threading.current_thread()
            for t in threads:
                if t is not current and t.is_alive():
                    remaining = max(0.01, deadline - time.time())
                    t.join(timeout=remaining)


class Plugin:
    def __init__(self):
        self.user_info = get_user_info()
        self.home = Path(self.user_info["home"])
        self.uid = self.user_info["uid"]
        self.gid = self.user_info["gid"]

        self.config_dir = self.home / ".config" / "deckymus"
        self.config_dir.mkdir(parents=True, exist_ok=True)
        try:
            os.chown(self.config_dir, self.uid, self.gid)
        except Exception:
            pass
        self.config_file = self.config_dir / "config.json"
        self.downloads_meta_file = self.config_dir / "downloaded.json"

        self.socket_path = f"/run/user/{self.uid}/deckymus-mpv.sock"
        self.mpv_process = None
        self.executor = ThreadPoolExecutor(max_workers=4)

        # Config state
        self.config = self._load_config()

        # Playback queue
        self.queue = []
        self.queue_index = -1
        self.current_track = {
            "id": "",
            "title": "",
            "artist": "",
            "album": "",
            "art_url": "",
            "duration": 0,
            "source": "none"
        }
        self.playback_status = "Stopped"
        self.shuffle = False
        self.repeat_mode = "off"  # "off", "all", "one"
        self._cover_cache = {}
        self._yt_search_cache = {}
        self._monitor_task = None
        self._yandex_client = None
        self._yandex_device_code = None
        self._yandex_user_code = None
        self._yandex_auth_url = None
        self._yandex_qr_svg = None
        self._yandex_code_expires_at = 0
        self._yandex_poll_task = None
        self._yandex_auth_lock = None
        self._yandex_auth_cooldown_until = 0.0
        self._yandex_poll_interval = 5
        self._req_counter = 0
        self._vk_user = self.config.get("vk_user") or None
        self._vk_logged_in = bool(self._vk_user)
        self._vk_browser_auth_task = None
        self._spotify_user = self.config.get("spotify_user") or None
        self._spotify_access_token = self.config.get("spotify_token") or ""
        self._spotify_token_expires = 0
        self._spotify_pkce_session = None
        self._spotify_auth_state = None
        self._spotify_lock = threading.RLock()
        self._config_lock = threading.RLock()
        self._auth_server_lock = threading.RLock()
        self._auth_server = None
        self._auth_server_thread = None

    def _demote(self):
        uid = self.uid
        gid = self.gid
        username = self.user_info["username"]
        def set_ids():
            try:
                os.initgroups(username, gid)
            except Exception:
                pass
            try:
                os.setgid(gid)
                os.setuid(uid)
            except Exception:
                pass
        return set_ids

    def _load_downloads_meta(self):
        if hasattr(self, "downloads_meta_file") and self.downloads_meta_file.is_file():
            try:
                with open(self.downloads_meta_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    def _save_downloads_meta(self, meta):
        try:
            with open(self.downloads_meta_file, "w", encoding="utf-8") as f:
                json.dump(meta, f, indent=2, ensure_ascii=False)
            os.chown(self.downloads_meta_file, self.uid, self.gid)
        except Exception:
            pass

    def _load_config(self):
        default_dl = str(self.home / "Музыка" if (self.home / "Музыка").is_dir() else self.home / "Music")
        default_cfg = {
            "music_folders": [
                str(self.home / "Music"),
                str(self.home / "Downloads"),
                str(self.home / "Музыка")
            ],
            "download_folder": default_dl,
            "yandex_token": "",
            "vk_token": "",
            "vk_user": {},
            "spotify_client_id": "",
            "spotify_client_secret": "",
            "spotify_token": "",
            "spotify_refresh_token": "",
            "spotify_user": {},
            "volume": 85,
            "repeat": "off",
            "shuffle": False
        }
        if self.config_file.is_file():
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    default_cfg.update(data)
            except Exception as e:
                logger.warning(f"Failed to read config: {e}")
        if not default_cfg.get("download_folder"):
            default_cfg["download_folder"] = default_dl
        return default_cfg

    def _save_config(self):
        lock = getattr(self, "_config_lock", None)
        if lock:
            with lock:
                try:
                    with open(self.config_file, "w", encoding="utf-8") as f:
                        json.dump(self.config, f, indent=2, ensure_ascii=False)
                    os.chown(self.config_file, self.uid, self.gid)
                except Exception as e:
                    logger.warning(f"Failed to save config: {e}")
        else:
            try:
                with open(self.config_file, "w", encoding="utf-8") as f:
                    json.dump(self.config, f, indent=2, ensure_ascii=False)
                os.chown(self.config_file, self.uid, self.gid)
            except Exception as e:
                logger.warning(f"Failed to save config: {e}")

    # ==================== MPV Engine ====================

    def _ensure_mpv(self):
        """Ensures the background headless MPV process is alive and responding."""
        if os.path.exists(self.socket_path):
            try:
                res = self._send_mpv_cmd(["get_property", "idle-active"], timeout=0.8)
                if res and res.get("error") == "success":
                    return True
            except Exception:
                pass
            try:
                os.unlink(self.socket_path)
            except Exception:
                pass

        if self.mpv_process and self.mpv_process.poll() is None:
            import time
            for _ in range(12):
                if os.path.exists(self.socket_path):
                    return True
                time.sleep(0.06)

        env = os.environ.copy()
        # PyInstaller bundles an older libstdc++.so.6 in LD_LIBRARY_PATH which causes
        # "GLIBCXX_3.4.36 not found (required by libopenal.so.1)" when launching system mpv.
        # We must completely purge LD_LIBRARY_PATH, LD_PRELOAD and PyInstaller env vars.
        env.pop("LD_LIBRARY_PATH", None)
        env.pop("LD_PRELOAD", None)
        for k in list(env.keys()):
            if "MEI" in str(env[k]) or k.startswith("PYINSTALLER"):
                env.pop(k, None)

        bin_dir = str(BIN_DIR)
        env["PATH"] = f"{bin_dir}:/usr/local/bin:/usr/bin:/bin"
        env["HOME"] = str(self.home)
        env["USER"] = self.user_info["username"]
        env["XDG_RUNTIME_DIR"] = f"/run/user/{self.uid}"
        env["PULSE_SERVER"] = f"unix:/run/user/{self.uid}/pulse/native"
        env["PIPEWIRE_RUNTIME_DIR"] = f"/run/user/{self.uid}"

        mpv_bin = _get_bin("mpv")
        cmd = [
            mpv_bin,
            "--idle=yes",
            "--no-video",
            "--no-terminal",
            f"--input-ipc-server={self.socket_path}",
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
            "--ytdl=no",
            "--cache=yes",
            "--cache-secs=30",
            f"--volume={self.config.get('volume', 85)}"
        ]

        try:
            log_f = open("/tmp/deckymus-mpv.log", "a")
            self.mpv_process = subprocess.Popen(
                cmd,
                env=env,
                preexec_fn=self._demote() if os.geteuid() == 0 else None,
                start_new_session=True,
                stdout=log_f,
                stderr=log_f
            )
            import time
            for _ in range(35):
                if os.path.exists(self.socket_path):
                    break
                time.sleep(0.06)
            return os.path.exists(self.socket_path)
        except Exception as e:
            logger.error(f"Failed to spawn MPV: {e}")
            return False

    def _send_mpv_cmd(self, command: list, timeout: float = 2.0):
        """Sends command to MPV over Unix Domain Socket with request_id matching."""
        if not os.path.exists(self.socket_path):
            if not self._ensure_mpv():
                return {"error": "mpv_unavailable"}

        self._req_counter += 1
        req_id = self._req_counter

        s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        s.settimeout(timeout)
        try:
            s.connect(self.socket_path)
            payload = json.dumps({"command": command, "request_id": req_id}) + "\n"
            s.sendall(payload.encode("utf-8"))

            buf = ""
            while True:
                chunk = s.recv(4096).decode("utf-8", "replace")
                if not chunk:
                    break
                buf += chunk
                while "\n" in buf:
                    line, buf = buf.split("\n", 1)
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                    except Exception:
                        continue
                    if data.get("request_id") == req_id or ("error" in data and "event" not in data):
                        return data
            return {"error": "no_response"}
        except Exception as e:
            logger.debug(f"MPV command error {command}: {e}")
            return {"error": str(e)}
        finally:
            try:
                s.close()
            except Exception:
                pass

    # ==================== Lifecycle ====================

    async def _main(self):
        logger.info(f"DeckyMus plugin loaded for user {self.user_info['username']}")
        # Ensure bundled binaries are executable
        if BIN_DIR.is_dir():
            for b in BIN_DIR.iterdir():
                if b.is_file():
                    try:
                        b.chmod(0o755)
                    except Exception as e:
                        logger.warning(f"Failed to chmod 755 on {b}: {e}")

        await asyncio.to_thread(self._ensure_mpv)

        # Initialize Yandex Music client if token exists
        if self.config.get("yandex_token"):
            asyncio.create_task(self._init_yandex_client(self.config["yandex_token"]))

        # Initialize VK Music client if token exists
        if self.config.get("vk_token"):
            asyncio.create_task(self._init_vk_client(self.config["vk_token"]))

        # Initialize Spotify client if token or credentials exist
        if self.config.get("spotify_token") or self.config.get("spotify_refresh_token") or (self.config.get("spotify_client_id") and self.config.get("spotify_client_secret")):
            asyncio.create_task(self._init_spotify_client())

        # Start local background auth helper server
        self._start_auth_server()

        # Start background monitor for track finish / queue progression
        self._monitor_task = asyncio.create_task(self._playback_monitor_loop())

        # Start background monitor for VK OAuth browser redirect in Steam CEF
        self._vk_browser_auth_task = asyncio.create_task(self._vk_browser_monitor_loop())

    async def _unload(self):
        logger.info("DeckyMus plugin unloading")
        self._stop_auth_server()
        if hasattr(self, "_vk_browser_auth_task") and self._vk_browser_auth_task and not self._vk_browser_auth_task.done():
            self._vk_browser_auth_task.cancel()
        if self._yandex_poll_task and not self._yandex_poll_task.done():
            self._yandex_poll_task.cancel()
        if self._monitor_task:
            self._monitor_task.cancel()
        if self.mpv_process:
            try:
                self._send_mpv_cmd(["quit"])
                self.mpv_process.terminate()
            except Exception:
                pass
        try:
            if os.path.exists(self.socket_path):
                os.unlink(self.socket_path)
        except Exception:
            pass

    async def _playback_monitor_loop(self):
        """Monitors MPV state and advances queue when a track finishes."""
        was_playing = False
        consecutive_idle = 0
        while True:
            try:
                await asyncio.sleep(1.0)
                if getattr(self, "_is_loading", False):
                    consecutive_idle = 0
                    continue

                status = await self.get_status()
                is_idle = status.get("is_idle", False)
                p_status = status.get("playback_status", "Stopped")
                pos = status.get("position", 0)

                if getattr(self, "_manual_stopped", False):
                    was_playing = False
                    consecutive_idle = 0
                    self._manual_stopped = False
                    continue

                if p_status == "Playing" and pos > 0.5:
                    was_playing = True
                    consecutive_idle = 0
                elif was_playing and is_idle and p_status != "Paused":
                    consecutive_idle += 1
                    if consecutive_idle >= 2:
                        was_playing = False
                        consecutive_idle = 0
                        if self.repeat_mode == "one":
                            await self.play_index(self.queue_index)
                        elif self.queue and self.queue_index < len(self.queue) - 1:
                            await self.next_track()
                        elif self.repeat_mode == "all" and self.queue:
                            await self.play_index(0)
                        else:
                            self.playback_status = "Stopped"
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.debug(f"Monitor error: {e}")

    # ==================== Player RPC Methods ====================

    async def get_status(self):
        """Returns player status, active track, progress and queue metadata."""
        alive = await asyncio.to_thread(self._ensure_mpv)
        if not alive:
            return {
                "playback_status": "Stopped",
                "position": 0,
                "duration": 0,
                "volume": self.config.get("volume", 85),
                "is_idle": True,
                "track": self.current_track,
                "queue_length": len(self.queue),
                "queue_index": self.queue_index,
                "repeat": self.repeat_mode,
                "shuffle": self.shuffle
            }

        def query_mpv():
            pause_res = self._send_mpv_cmd(["get_property", "pause"])
            time_res = self._send_mpv_cmd(["get_property", "playback-time"])
            dur_res = self._send_mpv_cmd(["get_property", "duration"])
            idle_res = self._send_mpv_cmd(["get_property", "idle-active"])
            vol_res = self._send_mpv_cmd(["get_property", "volume"])
            return pause_res, time_res, dur_res, idle_res, vol_res

        pause_res, time_res, dur_res, idle_res, vol_res = await asyncio.to_thread(query_mpv)

        is_idle = bool(idle_res.get("data", True))
        is_paused = bool(pause_res.get("data", False))

        if is_idle:
            status = "Stopped"
        elif is_paused:
            status = "Paused"
        else:
            status = "Playing"

        self.playback_status = status
        pos = float(time_res.get("data", 0) or 0)
        dur = float(dur_res.get("data", 0) or self.current_track.get("duration", 0) or 0)
        vol = float(vol_res.get("data", self.config.get("volume", 85)) or 85)

        return {
            "playback_status": status,
            "position": pos,
            "duration": dur,
            "volume": vol,
            "is_idle": is_idle,
            "track": self.current_track,
            "queue_length": len(self.queue),
            "queue_index": self.queue_index,
            "repeat": self.repeat_mode,
            "shuffle": self.shuffle
        }

    async def play_pause(self):
        """Toggles playback."""
        st = await self.get_status()
        if st["playback_status"] == "Stopped":
            if self.queue:
                idx = max(0, self.queue_index)
                return await self.play_index(idx)
            return False

        res = await asyncio.to_thread(self._send_mpv_cmd, ["cycle", "pause"])
        return res.get("error") == "success"

    async def play(self):
        res = await asyncio.to_thread(self._send_mpv_cmd, ["set_property", "pause", False])
        return res.get("error") == "success"

    async def pause(self):
        res = await asyncio.to_thread(self._send_mpv_cmd, ["set_property", "pause", True])
        return res.get("error") == "success"

    async def stop(self):
        self._manual_stopped = True
        res = await asyncio.to_thread(self._send_mpv_cmd, ["stop"])
        self.playback_status = "Stopped"
        return res.get("error") == "success"

    async def seek(self, seconds: float):
        res = await asyncio.to_thread(self._send_mpv_cmd, ["set_property", "playback-time", max(0.0, float(seconds))])
        return res.get("error") == "success"

    async def set_volume(self, volume: float):
        vol = max(0.0, min(100.0, float(volume)))
        self.config["volume"] = vol
        self._save_config()
        res = await asyncio.to_thread(self._send_mpv_cmd, ["set_property", "volume", vol])
        return res.get("error") == "success"

    async def set_repeat(self, mode: str):
        if mode in ("off", "all", "one"):
            self.repeat_mode = mode
            self.config["repeat"] = mode
            self._save_config()
            return True
        return False

    async def toggle_shuffle(self):
        self.shuffle = not self.shuffle
        self.config["shuffle"] = self.shuffle
        self._save_config()
        if self.shuffle and len(self.queue) > 1:
            import random
            curr = self.queue[self.queue_index] if 0 <= self.queue_index < len(self.queue) else None
            rest = [t for i, t in enumerate(self.queue) if i != self.queue_index]
            random.shuffle(rest)
            if curr:
                self.queue = [curr] + rest
                self.queue_index = 0
            else:
                self.queue = rest
        return self.shuffle

    async def play_track(self, track: dict):
        """Plays an individual track object immediately."""
        self.queue = [track]
        self.queue_index = 0
        return await self._play_current()

    async def play_queue(self, tracks: list, start_index: int = 0):
        """Replaces queue with tracks list and plays from start_index."""
        self.queue = list(tracks)
        self.queue_index = max(0, min(start_index, len(self.queue) - 1)) if self.queue else -1
        return await self._play_current()

    async def play_index(self, index: int):
        if 0 <= index < len(self.queue):
            self.queue_index = index
            return await self._play_current()
        return False

    async def next_track(self):
        if not self.queue:
            return False
        if self.queue_index < len(self.queue) - 1:
            self.queue_index += 1
            return await self._play_current()
        elif self.repeat_mode == "all":
            self.queue_index = 0
            return await self._play_current()
        return False

    async def previous_track(self):
        if not self.queue:
            return False
        # If played > 3 seconds, seek back to beginning of current track
        st = await self.get_status()
        if st.get("position", 0) > 3.0:
            return await self.seek(0)

        if self.queue_index > 0:
            self.queue_index -= 1
            return await self._play_current()
        elif self.repeat_mode == "all":
            self.queue_index = len(self.queue) - 1
            return await self._play_current()
        return False

    async def get_queue(self):
        return {
            "queue": self.queue,
            "index": self.queue_index
        }

    async def clear_queue(self):
        self.queue = []
        self.queue_index = -1
        await self.stop()
        return True

    def _find_local_download(self, track: dict) -> str:
        """Checks if a track has already been downloaded locally, and returns its file path if so."""
        try:
            dl_dir_str = self.config.get("download_folder")
            if not dl_dir_str:
                dl_dir_str = str(self.home / "Музыка" if (self.home / "Музыка").is_dir() else self.home / "Music")

            search_dirs = [Path(dl_dir_str)]
            for mf in self.config.get("music_folders", []):
                try:
                    p = Path(mf)
                    if p not in search_dirs:
                        search_dirs.append(p)
                except Exception:
                    pass

            meta = self._load_downloads_meta()
            track_id = str(track.get("id", ""))

            # 1. Match by track_id from downloads metadata
            if track_id and track_id in meta:
                fn = meta[track_id]
                for d in search_dirs:
                    if d.is_dir():
                        p = d / fn
                        if p.is_file():
                            logger.info(f"Using local downloaded file by ID: {p}")
                            return str(p)

            # 2. Match by clean title & artist filename
            title = track.get("title", "")
            artist = track.get("artist", "")
            clean_t = self._clean_filename(title).lower() if title else ""
            clean_a = self._clean_filename(artist).lower() if artist else ""

            cand_stems = []
            if clean_a and clean_t:
                cand_stems.append(f"{clean_a} - {clean_t}")
            if clean_t:
                cand_stems.append(clean_t)

            for d in search_dirs:
                if not d.is_dir():
                    continue
                for f in d.iterdir():
                    if f.is_file() and f.suffix.lower() in (".mp3", ".m4a", ".flac", ".ogg", ".opus", ".wav"):
                        f_stem = f.stem.strip().lower()
                        for cand in cand_stems:
                            if f_stem == cand:
                                logger.info(f"Using local downloaded file by name match: {f}")
                                return str(f)
        except Exception as e:
            logger.warning(f"Error checking local download: {e}")
        return ""

    async def _play_current(self):
        """Resolves stream URL or path and commands MPV to play."""
        if not (0 <= self.queue_index < len(self.queue)):
            return False

        self._is_loading = True
        self._manual_stopped = True
        try:
            track = self.queue[self.queue_index]
            source = track.get("source", "local")
            play_url = track.get("path") or track.get("url")

            # If track is from an online service, check if local copy is already downloaded
            if source in ("ytmusic", "yandex", "vk", "spotify") or not play_url:
                local_file = self._find_local_download(track)
                if local_file:
                    play_url = local_file
                    track["path"] = local_file
                    logger.info(f"Loaded local copy for track '{track.get('title')}': {local_file}")

            # Resolve streaming URL if needed
            if source == "ytmusic" and not play_url:
                play_url = await self._resolve_youtube_url(track.get("id"))
                if not play_url and track.get("id"):
                    play_url = f"https://www.youtube.com/watch?v={track.get('id')}"
            elif source == "yandex" and not play_url:
                play_url = await self._resolve_yandex_url(track.get("id"))
            elif source == "vk":
                play_url = await self._resolve_vk_url(track)
            elif source == "spotify":
                play_url = await self._resolve_spotify_url(track)

            if not play_url:
                logger.error(f"Could not resolve play URL for track {track.get('title')}")
                return False

            self.current_track = track

            def exec_load():
                self._ensure_mpv()
                res = self._send_mpv_cmd(["loadfile", play_url, "replace"])
                if res.get("error") == "success":
                    self._send_mpv_cmd(["set_property", "pause", False])
                return res

            res = await asyncio.to_thread(exec_load)
            if res.get("error") == "success":
                self.playback_status = "Playing"
                return True
            return False
        finally:
            await asyncio.sleep(0.5)
            self._is_loading = False

    # ==================== Local Music Library ====================

    async def get_local_folders(self):
        return self.config.get("music_folders", [])

    async def set_local_folders(self, folders: list):
        self.config["music_folders"] = folders
        self._save_config()
        return True

    async def browse_directory(self, path: str = ""):
        """Lists subdirectories for the folder picker modal/browser."""
        def _browse():
            target = Path(path).expanduser().resolve() if path else self.home
            if not target.is_dir():
                target = self.home

            subdirs = []
            try:
                for entry in target.iterdir():
                    if entry.is_dir() and not entry.name.startswith("."):
                        subdirs.append({
                            "name": entry.name,
                            "path": str(entry.resolve())
                        })
            except (PermissionError, OSError):
                pass
            except Exception as e:
                logger.debug(f"Browse error: {e}")

            subdirs.sort(key=lambda d: d["name"].lower())

            presets = [
                {"name": "Музыка (~/Music)", "path": str(self.home / "Music")},
                {"name": "Загрузки (~/Downloads)", "path": str(self.home / "Downloads")},
                {"name": "Домашняя папка (~)", "path": str(self.home)},
            ]
            try:
                for sd in Path("/run/media").glob("*/*"):
                    if sd.is_dir():
                        presets.append({"name": f"Карта памяти ({sd.name})", "path": str(sd)})
            except Exception:
                pass

            parent = str(target.parent) if target != target.parent else ""
            return {
                "current": str(target),
                "parent": parent,
                "subdirs": subdirs,
                "presets": presets
            }
        return await asyncio.to_thread(_browse)

    def _clean_filename(self, text: str) -> str:
        cleaned = re.sub(r'[\\/*?:"<>|]', '', text).strip()
        return cleaned or "track"

    async def get_download_folder(self):
        folder = self.config.get("download_folder")
        if not folder:
            folder = str(self.home / "Музыка" if (self.home / "Музыка").is_dir() else self.home / "Music")
            self.config["download_folder"] = folder
            self._save_config()
        return folder

    async def set_download_folder(self, folder: str):
        if not folder:
            return False
        p = Path(folder).expanduser().resolve()
        p.mkdir(parents=True, exist_ok=True)
        try:
            os.chown(p, self.uid, self.gid)
        except Exception:
            pass
        self.config["download_folder"] = str(p)
        # Also ensure it's in music_folders so the local library scanner includes it
        mf = self.config.get("music_folders", [])
        if str(p) not in mf:
            mf.append(str(p))
            self.config["music_folders"] = mf
        self._save_config()
        return True

    async def get_downloaded_info(self):
        dl_dir_str = await self.get_download_folder()
        dl_dir = Path(dl_dir_str)
        if not dl_dir.is_dir():
            return {"ids": [], "filenames": []}

        meta = self._load_downloads_meta()
        existing_files = {f.name.lower(): f for f in dl_dir.glob("*.mp3")}
        for ext in ["*.m4a", "*.flac", "*.ogg", "*.opus", "*.wav"]:
            for f in dl_dir.glob(ext):
                existing_files[f.name.lower()] = f

        valid_ids = []
        for tid, fn in meta.items():
            if fn.lower() in existing_files:
                valid_ids.append(str(tid))

        base_names = [f.stem.strip().lower() for f in existing_files.values()]

        return {
            "ids": valid_ids,
            "filenames": base_names
        }

    async def download_track(self, track: dict):
        dl_dir_str = await self.get_download_folder()
        dl_dir = Path(dl_dir_str)
        dl_dir.mkdir(parents=True, exist_ok=True)
        try:
            os.chown(dl_dir, self.uid, self.gid)
        except Exception:
            pass

        track_id = str(track.get("id", ""))
        title = track.get("title", "Unknown Title")
        artist = track.get("artist", "")
        album = track.get("album", "")
        art_url = track.get("art_url", "")
        source = track.get("source", "")

        clean_t = self._clean_filename(title)
        clean_a = self._clean_filename(artist) if artist else ""
        final_filename = f"{clean_a} - {clean_t}.mp3" if clean_a else f"{clean_t}.mp3"

        final_path = dl_dir / final_filename
        tmp_path = dl_dir / f".{final_filename}.tmp.mp3"

        def _do_download():
            nonlocal final_path, tmp_path
            env = os.environ.copy()
            env.pop("LD_LIBRARY_PATH", None)
            env.pop("LD_PRELOAD", None)
            for k in list(env.keys()):
                if "MEI" in str(env[k]) or k.startswith("PYINSTALLER"):
                    env.pop(k, None)
            bin_dir = str(BIN_DIR)
            env["PATH"] = f"{bin_dir}:/usr/local/bin:/usr/bin:/bin"

            logger.info(f"Downloading track '{title}' ({track_id}) from {source}...")

            if tmp_path.exists():
                try:
                    tmp_path.unlink()
                except Exception:
                    pass

            if source == "yandex":
                if not self._yandex_client:
                    return {"success": False, "error": "Яндекс Музыка не подключена"}
                try:
                    track_obj = self._yandex_client.tracks([track_id])[0]
                    info = track_obj.get_download_info()
                    best = [i for i in info if i.codec == "mp3"] or info
                    if not best:
                        return {"success": False, "error": "Не удалось получить аудиопоток трека"}
                    direct_url = best[0].get_direct_link()
                except Exception as e:
                    logger.error(f"Yandex stream URL error: {e}")
                    return {"success": False, "error": f"Ошибка получения ссылки: {e}"}

                if not requests:
                    return {"success": False, "error": "requests недоступен"}
                try:
                    resp = requests.get(direct_url, stream=True, timeout=35)
                    resp.raise_for_status()
                    with open(tmp_path, "wb") as f:
                        for chunk in resp.iter_content(chunk_size=65536):
                            if chunk:
                                f.write(chunk)
                except Exception as de:
                    logger.error(f"Yandex download error: {de}")
                    return {"success": False, "error": f"Ошибка скачивания: {de}"}

            elif source == "vk":
                stream_url = self._sync_resolve_vk_url(track)
                if not stream_url:
                    return {"success": False, "error": "Не удалось получить аудиопоток VK"}

                if "index.m3u8" in stream_url or ".m3u8" in stream_url:
                    ffmpeg_bin = _get_bin("ffmpeg")
                    cmd = [
                        ffmpeg_bin, "-y",
                        "-headers", f"User-Agent: {KATE_USER_AGENT}\r\n",
                        "-i", stream_url,
                        "-c:a", "libmp3lame",
                        "-q:a", "2",
                        str(tmp_path)
                    ]
                    ret = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    if ret.returncode != 0 or not tmp_path.is_file():
                        cmd2 = [ffmpeg_bin, "-y", "-i", stream_url, "-c:a", "libmp3lame", "-q:a", "2", str(tmp_path)]
                        ret2 = subprocess.run(cmd2, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        if ret2.returncode != 0 or not tmp_path.is_file():
                            return {"success": False, "error": "Ошибка конвертации потока VK"}
                else:
                    if not requests:
                        return {"success": False, "error": "requests недоступен"}
                    headers = {"User-Agent": VK_USER_AGENT}
                    resp = requests.get(stream_url, headers=headers, stream=True, timeout=35)
                    resp.raise_for_status()
                    with open(tmp_path, "wb") as f:
                        for chunk in resp.iter_content(chunk_size=65536):
                            if chunk:
                                f.write(chunk)

            elif source == "spotify":
                if not yt_dlp:
                    return {"success": False, "error": "yt-dlp недоступен"}

                search_q = f"ytsearch1:{clean_a} - {clean_t} audio" if clean_a else f"ytsearch1:{clean_t} audio"
                tmp_out = str(dl_dir / f".{final_filename}.tmp.%(ext)s")
                ydl_opts = {
                    "ffmpeg_location": _get_bin("ffmpeg"),
                    "format": "bestaudio/best",
                    "quiet": True,
                    "no_warnings": True,
                    "extract_flat": False,
                    "outtmpl": tmp_out,
                    "postprocessors": [{
                        "key": "FFmpegExtractAudio",
                        "preferredcodec": "mp3",
                        "preferredquality": "320",
                    }],
                }
                try:
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([search_q])
                except Exception as se:
                    logger.error(f"Spotify yt-dlp download error: {se}")
                    return {"success": False, "error": f"Ошибка скачивания Spotify: {se}"}

            elif source == "ytmusic":
                if not yt_dlp:
                    logger.error("Download failed: yt-dlp is not available")
                    return {"success": False, "error": "yt-dlp недоступен"}

                target_url = f"https://www.youtube.com/watch?v={track_id}"
                if not re.match(r"^[a-zA-Z0-9_-]{11}$", track_id):
                    search_q = f"{clean_a} - {clean_t} audio" if clean_a else f"{clean_t} audio"
                    target_url = f"ytsearch1:{search_q}"

                tmp_out = str(dl_dir / f".{final_filename}.tmp.%(ext)s")
                ydl_opts = {
                    "ffmpeg_location": _get_bin("ffmpeg"),
                    "format": "bestaudio/best",
                    "quiet": True,
                    "no_warnings": True,
                    "extract_flat": False,
                    "outtmpl": tmp_out,
                    "postprocessors": [{
                        "key": "FFmpegExtractAudio",
                        "preferredcodec": "mp3",
                        "preferredquality": "320",
                    }],
                }
                try:
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([target_url])
                except Exception as ye:
                    logger.error(f"YTMusic yt-dlp download error: {ye}")
                    return {"success": False, "error": f"Ошибка скачивания: {ye}"}
            else:
                return {"success": False, "error": f"Неизвестный источник {source}"}

            # Embed cover art and tags via mutagen if available
            if mutagen and tmp_path.is_file():
                try:
                    from mutagen.id3 import ID3, TIT2, TPE1, TALB, APIC, ID3NoHeaderError
                    try:
                        audio = ID3(str(tmp_path))
                    except ID3NoHeaderError:
                        audio = ID3()
                    if title:
                        audio["TIT2"] = TIT2(encoding=3, text=title)
                    if artist:
                        audio["TPE1"] = TPE1(encoding=3, text=artist)
                    if album:
                        audio["TALB"] = TALB(encoding=3, text=album)
                    if art_url and requests:
                        try:
                            cover_resp = requests.get(art_url, timeout=10)
                            if cover_resp.status_code == 200:
                                audio["APIC"] = APIC(
                                    encoding=3,
                                    mime="image/jpeg",
                                    type=3,
                                    desc="Cover",
                                    data=cover_resp.content
                                )
                        except Exception as ce:
                            logger.debug(f"Cover download note: {ce}")
                    audio.save(str(tmp_path))
                except Exception as me:
                    logger.debug(f"Mutagen tag note: {me}")

            # Atomically move temp file to final destination
            if tmp_path.is_file():
                os.replace(str(tmp_path), str(final_path))
                try:
                    os.chown(final_path, self.uid, self.gid)
                except Exception:
                    pass

                meta = self._load_downloads_meta()
                meta[track_id] = final_path.name
                self._save_downloads_meta(meta)

                return {"success": True, "path": str(final_path)}
            return {"success": False, "error": "Файл не был сохранен"}

        return await asyncio.to_thread(_do_download)

    async def scan_local_music(self):
        """Scans configured local directories and SD card for music files."""
        folders = self.config.get("music_folders", [])
        # Also auto-discover mounted SD cards
        sd_roots = list(Path("/run/media").glob("*/*/Music")) + list(Path("/run/media").glob("*/*"))
        for s in sd_roots:
            if s.is_dir() and str(s) not in folders:
                folders.append(str(s))

        def _scan():
            tracks = []
            extensions = {".mp3", ".flac", ".ogg", ".m4a", ".wav", ".opus", ".aac"}
            seen_paths = set()

            for folder_str in folders:
                folder = Path(folder_str).expanduser()
                if not folder.is_dir():
                    continue

                for root, _, files in os.walk(folder):
                    for f in files:
                        p = Path(root) / f
                        if p.suffix.lower() in extensions:
                            real_p = str(p.resolve())
                            if real_p in seen_paths:
                                continue
                            seen_paths.add(real_p)

                            track_info = self._extract_track_metadata(real_p)
                            tracks.append(track_info)

            tracks.sort(key=lambda t: (t.get("artist") or "").lower() + (t.get("title") or "").lower())
            return tracks

        return await asyncio.to_thread(_scan)

    def _extract_track_metadata(self, file_path: str) -> dict:
        p = Path(file_path)
        title = p.stem
        artist = "Неизвестный исполнитель"
        album = "Неизвестный альбом"
        duration = 0
        art_url = ""

        if mutagen:
            try:
                audio = mutagen.File(file_path)
                if audio is not None:
                    if hasattr(audio.info, "length"):
                        duration = int(audio.info.length)

                    tags = audio.tags
                    if tags:
                        # Title
                        for k in ("TIT2", "title", "\xa9nam"):
                            if k in tags:
                                val = tags[k]
                                title = str(val[0] if isinstance(val, (list, tuple)) else val)
                                break
                        # Artist
                        for k in ("TPE1", "artist", "\xa9ART"):
                            if k in tags:
                                val = tags[k]
                                artist = str(val[0] if isinstance(val, (list, tuple)) else val)
                                break
                        # Album
                        for k in ("TALB", "album", "\xa9alb"):
                            if k in tags:
                                val = tags[k]
                                album = str(val[0] if isinstance(val, (list, tuple)) else val)
                                break

                    # Artwork
                    art_url = self._extract_artwork_data_uri(audio, file_path)
            except Exception as e:
                logger.debug(f"Mutagen read error {file_path}: {e}")

        return {
            "id": file_path,
            "path": file_path,
            "title": title,
            "artist": artist,
            "album": album,
            "duration": duration,
            "art_url": art_url,
            "source": "local"
        }

    def _extract_artwork_data_uri(self, audio, file_path: str) -> str:
        if file_path in self._cover_cache:
            return self._cover_cache[file_path]

        art_data = None
        mime = "image/jpeg"

        try:
            if isinstance(audio, MP3) and audio.tags:
                for k in audio.tags.keys():
                    if k.startswith("APIC"):
                        apic = audio.tags[k]
                        art_data = apic.data
                        mime = apic.mime or "image/jpeg"
                        break
            elif isinstance(audio, FLAC) and audio.pictures:
                art_data = audio.pictures[0].data
                mime = audio.pictures[0].mime or "image/jpeg"
            elif isinstance(audio, MP4) and audio.tags and "covr" in audio.tags:
                covr = audio.tags["covr"]
                if covr:
                    art_data = bytes(covr[0])
                    mime = "image/jpeg"
        except Exception:
            pass

        # Also check folder for cover.jpg / folder.jpg
        if not art_data:
            parent = Path(file_path).parent
            for name in ("cover.jpg", "cover.png", "folder.jpg", "front.jpg"):
                img_path = parent / name
                if img_path.is_file():
                    try:
                        with open(img_path, "rb") as f:
                            art_data = f.read()
                        mime = "image/png" if name.endswith(".png") else "image/jpeg"
                        break
                    except Exception:
                        pass

        res = ""
        if art_data:
            b64 = base64.b64encode(art_data).decode("ascii")
            res = f"data:{mime};base64,{b64}"

        if len(self._cover_cache) > 200:
            self._cover_cache.clear()
        self._cover_cache[file_path] = res
        return res

    # ==================== Yandex Music ====================

    async def _init_yandex_client(self, token: str):
        if not YandexClient or not token:
            self._yandex_client = None
            return None
        try:
            def _create():
                c = YandexClient(token).init()
                return c
            self._yandex_client = await asyncio.to_thread(_create)
            logger.info("Yandex Music client initialized successfully")

            # Cache user info
            try:
                account = getattr(self._yandex_client.me, "account", None)
                if account:
                    user_name = ""
                    for attr in ("display_name", "full_name", "login"):
                        val = getattr(account, attr, None)
                        if isinstance(val, str) and val.strip():
                            user_name = val.strip()
                            break
                    uid = getattr(account, "uid", None)
                    user_id = str(uid) if (isinstance(uid, (str, int)) and str(uid).strip()) else ""
                    avatar = f"https://avatars.yandex.net/get-yapic/{user_id}/islands-200" if user_id else ""
                    self.config["yandex_user"] = {
                        "name": user_name,
                        "id": user_id,
                        "avatar": avatar,
                    }
                    self._save_config()
            except Exception as e:
                logger.debug(f"Could not extract Yandex user metadata: {e}")

            return self._yandex_client
        except Exception as e:
            logger.warning(f"Yandex Music init error: {e}")
            self._yandex_client = None
            return None

    def _get_yandex_auth_lock(self):
        if self._yandex_auth_lock is None:
            self._yandex_auth_lock = asyncio.Lock()
        return self._yandex_auth_lock

    def _get_yandex_auth_url(self, user_code: str = "") -> str:
        if user_code:
            code = (user_code or "").strip()
            return f"https://ya.ru/device?user_code={urllib.parse.quote(code)}"
        return YANDEX_AUTH_URL

    async def _poll_yandex_token(self, device_code: str):
        def _poll():
            if not YandexClient:
                return None
            try:
                c = YandexClient()
                return c.poll_device_token(device_code)
            except Exception as e:
                logger.debug(f"Yandex poll_device_token note: {e}")
                return None
        try:
            res = await asyncio.to_thread(_poll)
            if res:
                return getattr(res, "access_token", None) or str(res)
            return None
        except Exception:
            return None

    def _sync_yandex_set_token(self, token: str):
        token = (token or "").strip()
        m = re.search(r"access_token[=:]+([^&\s#\"']+)", token)
        if m:
            token = m.group(1)
        if not token:
            return {"success": False, "error": "Empty token"}
        self.config["yandex_token"] = token
        self._save_config()
        if self._loop and self._loop.is_running():
            asyncio.run_coroutine_threadsafe(self._init_yandex_client(token), self._loop)
        return {"success": True}

    async def yandex_start_auth(self, force: bool = False):
        """
        Initiates or returns an active Yandex Music authorization session.
        Uses Cassette desktop client OAuth direct authorization with QR helper fallback.
        """
        if self._yandex_client is not None:
            user_info = self.config.get("yandex_user") or {}
            return {
                "success": True,
                "already_logged_in": True,
                "user_name": user_info.get("name", ""),
                "user_id": user_info.get("id", ""),
                "avatar": user_info.get("avatar", ""),
            }

        local_ip = self._get_local_ip()
        helper_url = f"http://{local_ip}:9911/yandex"
        qr_svg = self._generate_qr_svg(helper_url)

        self._yandex_auth_url = YANDEX_AUTH_URL
        self._yandex_qr_svg = qr_svg

        return {
            "success": True,
            "auth_url": YANDEX_AUTH_URL,
            "qr_svg": qr_svg,
            "helper_url": helper_url,
            "user_code": self._yandex_user_code or "",
            "expires_in": 300,
        }

    async def _yandex_device_poll_loop(self, device_code: str, interval: int, expires_at: float):
        return

    async def yandex_set_token(self, token: str):
        token = (token or "").strip()
        m = re.search(r"access_token[=:]+([^&\s#\"']+)", token)
        if m:
            token = m.group(1)
        self.config["yandex_token"] = token
        self._save_config()
        client = await self._init_yandex_client(self.config["yandex_token"])
        if client and hasattr(client, "me"):
            user_info = self.config.get("yandex_user") or {}
            return {
                "success": True,
                "user": user_info.get("name", "") or getattr(client.me.account, "full_name", "") or getattr(client.me.account, "login", "")
            }
        return {"success": False, "error": "Не удалось авторизоваться по токену"}

    async def yandex_get_status(self):
        has_token = bool(self.config.get("yandex_token"))
        logged_in = self._yandex_client is not None
        user_info = self.config.get("yandex_user") or {}
        user_name = user_info.get("name", "")
        user_id = user_info.get("id", "")
        avatar = user_info.get("avatar", "")

        local_ip = self._get_local_ip()
        helper_url = f"http://{local_ip}:9911/yandex"
        qr_svg = self._generate_qr_svg(helper_url)

        if logged_in:
            if not user_name and self._yandex_client:
                try:
                    account = getattr(self._yandex_client.me, "account", None)
                    if account:
                        for attr in ("display_name", "full_name", "login"):
                            val = getattr(account, attr, None)
                            if isinstance(val, str) and val.strip():
                                user_name = val.strip()
                                break
                        uid = getattr(account, "uid", None)
                        if isinstance(uid, (str, int)) and str(uid).strip():
                            user_id = str(uid).strip()
                            avatar = f"https://avatars.yandex.net/get-yapic/{user_id}/islands-200"
                except Exception:
                    pass

            return {
                "has_token": has_token,
                "logged_in": True,
                "user_name": user_name,
                "user_id": user_id,
                "avatar": avatar,
                "auth_url": YANDEX_AUTH_URL,
                "helper_url": helper_url,
                "qr_svg": qr_svg,
            }

        return {
            "has_token": has_token,
            "logged_in": False,
            "user_name": "",
            "user_id": "",
            "avatar": "",
            "auth_url": YANDEX_AUTH_URL,
            "helper_url": helper_url,
            "qr_svg": qr_svg,
            "user_code": self._yandex_user_code or "",
            "expires_in": 300,
        }

    async def yandex_logout(self):
        logger.info("Yandex Music logging out")
        if self._yandex_poll_task and not self._yandex_poll_task.done():
            self._yandex_poll_task.cancel()
            self._yandex_poll_task = None

        self._yandex_device_code = None
        self._yandex_user_code = None
        self._yandex_auth_url = None
        self._yandex_qr_svg = None
        self._yandex_code_expires_at = 0
        self._yandex_auth_cooldown_until = 0.0
        self._yandex_client = None

        self.config["yandex_token"] = ""
        self.config["yandex_user"] = {}
        self._save_config()
        return {"success": True}

        self.config["yandex_token"] = ""
        self.config["yandex_user"] = {}
        self._save_config()
        return {"success": True}

    async def yandex_get_playlists(self):
        if not self._yandex_client:
            return []
        def _get():
            try:
                res = []
                # Favorites playlist (Мне нравится)
                likes = self._yandex_client.users_likes_tracks()
                if likes:
                    res.append({
                        "id": "likes",
                        "title": "Мне нравится",
                        "track_count": len(likes),
                        "cover": ""
                    })
                # Custom playlists
                playlists = self._yandex_client.users_playlists_list()
                for p in playlists:
                    cover = ""
                    if hasattr(p, "cover") and p.cover and hasattr(p.cover, "uri") and p.cover.uri:
                        cover = "https://" + p.cover.uri.replace("%%", "200x200")
                    res.append({
                        "id": str(p.kind),
                        "owner_id": str(p.uid),
                        "title": p.title,
                        "track_count": p.track_count,
                        "cover": cover
                    })
                return res
            except Exception as e:
                logger.error(f"Yandex playlists error: {e}")
                return []
        return await asyncio.to_thread(_get)

    async def yandex_get_playlist_tracks(self, playlist_id: str, owner_id: str = ""):
        if not self._yandex_client:
            return []
        def _get():
            try:
                tracks = []
                raw_tracks = []
                if playlist_id == "likes":
                    likes = self._yandex_client.users_likes_tracks()
                    if likes:
                        likes_slice = likes[:2000]
                        track_ids = [str(getattr(l, "id", "") or getattr(l, "track_id", "") or "") for l in likes_slice]
                        track_ids = [tid for tid in track_ids if tid]
                        chunk_size = 100
                        for i in range(0, len(track_ids), chunk_size):
                            chunk = track_ids[i:i + chunk_size]
                            try:
                                fetched = self._yandex_client.tracks(chunk)
                                if fetched:
                                    raw_tracks.extend(fetched)
                            except Exception as e:
                                logger.error(f"Error batch fetching Yandex tracks chunk: {e}")
                else:
                    uid = owner_id or getattr(getattr(self._yandex_client, "me", None), "account", None)
                    uid_val = getattr(uid, "uid", None) if uid else None
                    pl = self._yandex_client.users_playlists(kind=int(playlist_id), user_id=uid_val)
                    if hasattr(pl, "fetch_tracks"):
                        try:
                            pl = pl.fetch_tracks()
                        except Exception:
                            pass
                    pl_tracks = getattr(pl, "tracks", []) or []
                    pl_slice = pl_tracks[:2000]
                    raw_tracks = [t.track if hasattr(t, "track") and t.track else t for t in pl_slice if t]

                for t in raw_tracks:
                    if not t:
                        continue
                    cover = ""
                    if hasattr(t, "cover_uri") and t.cover_uri:
                        cover = "https://" + t.cover_uri.replace("%%", "200x200")
                    artists_str = ", ".join(a.name for a in t.artists) if hasattr(t, "artists") and t.artists else "Исполнитель"
                    duration_s = int(t.duration_ms / 1000) if hasattr(t, "duration_ms") and t.duration_ms else 0
                    tracks.append({
                        "id": str(getattr(t, "id", "")),
                        "title": getattr(t, "title", "Трек"),
                        "artist": artists_str,
                        "album": t.albums[0].title if hasattr(t, "albums") and t.albums and hasattr(t.albums[0], "title") else "",
                        "duration": duration_s,
                        "art_url": cover,
                        "source": "yandex"
                    })
                return tracks
            except Exception as e:
                logger.error(f"Yandex playlist tracks error: {e}")
                return []
        return await asyncio.to_thread(_get)

    async def yandex_get_chart(self):
        def _chart():
            try:
                c = self._yandex_client or YandexClient().init()
                chart_data = c.chart("russia")
                res = []
                for entry in chart_data.chart.tracks[:50]:
                    t = entry.track
                    cover = ""
                    if hasattr(t, "cover_uri") and t.cover_uri:
                        cover = "https://" + t.cover_uri.replace("%%", "200x200")
                    artists_str = ", ".join(a.name for a in t.artists) if t.artists else "Исполнитель"
                    duration_s = int(t.duration_ms / 1000) if t.duration_ms else 0
                    res.append({
                        "id": str(t.id),
                        "title": t.title or "Трек",
                        "artist": artists_str,
                        "album": t.albums[0].title if t.albums else "",
                        "duration": duration_s,
                        "art_url": cover,
                        "source": "yandex"
                    })
                return res
            except Exception as e:
                logger.error(f"Yandex chart error: {e}")
                return []
        return await asyncio.to_thread(_chart)

    async def _resolve_yandex_url(self, track_id: str) -> str:
        if not self._yandex_client:
            return ""
        def _resolve():
            try:
                track = self._yandex_client.tracks([track_id])[0]
                info = track.get_download_info()
                best = [i for i in info if i.codec == "mp3"] or info
                if best:
                    return best[0].get_direct_link()
            except Exception as e:
                logger.error(f"Failed to resolve Yandex stream URL {track_id}: {e}")
            return ""
        return await asyncio.to_thread(_resolve)

    # ==================== YouTube Music ====================

    async def yt_search(self, query: str):
        if not query or not query.strip():
            return []
        def _search():
            q = query.strip()
            q_key = q.lower()
            if hasattr(self, "_yt_search_cache") and q_key in self._yt_search_cache:
                return self._yt_search_cache[q_key]

            try:
                yt = YTMusic()
                # Request up to 1000 tracks for deep search
                results = yt.search(q, filter="songs", limit=1000)
                res = []
                seen_ids = set()
                seen_keys = set()
                for item in results:
                    vid = item.get("videoId")
                    if not vid or vid in seen_ids:
                        continue
                    title = (item.get("title") or "").strip()
                    artists = ", ".join(a.get("name", "") for a in item.get("artists", [])).strip()
                    item_key = (title.lower(), artists.lower())
                    if item_key in seen_keys:
                        continue
                    seen_ids.add(vid)
                    seen_keys.add(item_key)

                    album = item.get("album", {}).get("name", "") if item.get("album") else ""
                    dur_str = item.get("duration", "0:00")
                    sec = 0
                    try:
                        parts = [int(p) for p in dur_str.split(":")]
                        sec = parts[0] * 60 + parts[1] if len(parts) == 2 else parts[0]
                    except Exception:
                        pass
                    cover = ""
                    thumbs = item.get("thumbnails", [])
                    if thumbs:
                        cover = thumbs[-1].get("url", "")
                    res.append({
                        "id": vid,
                        "title": title,
                        "artist": artists or "YouTube Music",
                        "album": album,
                        "duration": sec,
                        "art_url": cover,
                        "source": "ytmusic"
                    })

                if not hasattr(self, "_yt_search_cache"):
                    self._yt_search_cache = {}
                self._yt_search_cache[q_key] = res
                return res
            except Exception as e:
                logger.error(f"YTMusic search error: {e}")
                return []
        return await asyncio.to_thread(_search)

    async def _resolve_youtube_url(self, video_id: str) -> str:
        if not yt_dlp:
            return ""
        def _resolve():
            try:
                ydl_opts = {
                    "format": "bestaudio/best",
                    "quiet": True,
                    "no_warnings": True,
                    "extract_flat": False
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
                    return info.get("url", "")
            except Exception as e:
                logger.error(f"Failed to extract YouTube audio URL for {video_id}: {e}")
            return ""
        return await asyncio.to_thread(_resolve)


    # ==================== Utilities: Local IP, QR & Browser ====================

    def _get_local_ip(self) -> str:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
        except Exception:
            return "127.0.0.1"
        finally:
            s.close()

    def _generate_qr_svg(self, data: str) -> str:
        if not qrcode:
            return ""
        try:
            qr = qrcode.QRCode(
                version=None,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=10,
                border=1,
                image_factory=qrcode.image.svg.SvgPathImage
            )
            qr.add_data(data)
            qr.make(fit=True)
            img = qr.make_image()
            svg_str = img.to_string(encoding="unicode")
            svg_str = re.sub(r'width="[^"]*"', 'width="100%"', svg_str, count=1)
            svg_str = re.sub(r'height="[^"]*"', 'height="100%"', svg_str, count=1)
            return svg_str
        except Exception as e:
            logger.warning(f"QR generation error: {e}")
            return ""

    async def open_browser(self, url: str):
        try:
            req = urllib.request.Request("http://127.0.0.1:8080/json")
            with urllib.request.urlopen(req, timeout=0.8) as resp:
                targets = json.loads(resp.read().decode("utf-8"))
                for t in targets:
                    ws_url = t.get("webSocketDebuggerUrl")
                    title = t.get("title", "")
                    if not ws_url:
                        continue
                    if "SharedJSContext" in title:
                        expr = (
                            f"try {{"
                            f" const s = window.SteamUIStore;"
                            f" const w = s?.WindowStore?.m_mapDesiredWindowInstances?.get?.(1) || s?.GetFocusedWindowInstance?.();"
                            f" if (w?.m_Navigator?.ExternalWeb) {{"
                            f"   w.m_Navigator.ExternalWeb({json.dumps(url)});"
                            f" }} else if (window.DFL?.Navigation?.NavigateToExternalWeb) {{"
                            f"   window.DFL.Navigation.NavigateToExternalWeb({json.dumps(url)});"
                            f" }}"
                            f"}} catch(e) {{}}"
                        )
                        self._evaluate_cef_js(ws_url, expr)
                    elif "Big Picture" in title:
                        expr = (
                            f"try {{"
                            f" const el = document.querySelector('._3-G5o_dy0uF5Q1xHJSCajl, [class*=\"BrowserContainer\"]');"
                            f" if (el) {{"
                            f"   const k = Object.keys(el).find(x => x.startsWith('__reactFiber'));"
                            f"   let f = el[k];"
                            f"   while (f) {{"
                            f"     if (f.memoizedProps?.browser) {{"
                            f"       f.memoizedProps.browser.LoadURL({json.dumps(url)});"
                            f"       break;"
                            f"     }}"
                            f"     f = f.return;"
                            f"   }}"
                            f" }}"
                            f"}} catch(e) {{}}"
                        )
                        self._evaluate_cef_js(ws_url, expr)
                return {"success": True}
        except Exception as e:
            logger.warning(f"Failed to open browser via CEF: {e}")
        return {"success": False}

    # ==================== Local Auth HTTP Server ====================

    def _start_auth_server(self):
        with self._auth_server_lock:
            if self._auth_server is not None:
                return
            self._start_auth_server_unlocked()

    def _start_auth_server_unlocked(self):
        if self._auth_server is not None:
            return

        plugin_self = self

        class AuthHandler(BaseHTTPRequestHandler):
            timeout = 5.0

            def log_message(self, format, *args):
                return

            def do_OPTIONS(self):
                self.send_response(200)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
                self.end_headers()

            def _serve_success_page(self, service_name: str, user_name: str = ""):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                user_html = f'<div class="user">{user_name}</div>' if user_name else ""
                html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DeckyMus — {service_name} подключен</title>
<style>
* {{ box-sizing: border-box; }}
body {{
  margin: 0; padding: 20px; background: #0f172a; color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex; align-items: center; justify-content: center; min-height: 95vh;
}}
.card {{
  background: #1e293b; border: 1px solid rgba(30, 215, 96, 0.4);
  border-radius: 20px; padding: 32px 24px; max-width: 440px; width: 100%;
  text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}}
.icon {{
  width: 64px; height: 64px; background: rgba(30, 215, 96, 0.15);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: #1ed760; font-size: 32px;
}}
h2 {{ margin: 0 0 8px; font-size: 22px; color: #ffffff; }}
.user {{ font-size: 16px; color: #1ed760; font-weight: 600; margin-bottom: 16px; }}
p {{ margin: 0 0 24px; font-size: 14px; color: #94a3b8; line-height: 1.5; }}
.btn {{
  display: inline-block; width: 100%; padding: 14px;
  background: #1ed760; color: #0f172a; font-size: 15px; font-weight: 700;
  border-radius: 12px; text-decoration: none; border: none; cursor: pointer;
}}
</style>
</head>
<body>
<div class="card">
  <div class="icon">✓</div>
  <h2>{service_name} успешно подключен!</h2>
  {user_html}
  <p>Авторизация успешно завершена.<br>Вы можете закрыть эту вкладку и вернуться к Steam Deck.</p>
  <button class="btn" onclick="window.close()">Закрыть вкладку</button>
</div>
<script>
setTimeout(function() {{
  try {{ window.close(); }} catch(e) {{}}
}}, 3000);
</script>
</body>
</html>"""
                self.wfile.write(html.encode("utf-8"))

            def _serve_error_page(self, service_name: str, message: str, status_code: int = 400):
                self.send_response(status_code)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DeckyMus — Ошибка авторизации</title>
<style>
* {{ box-sizing: border-box; }}
body {{
  margin: 0; padding: 20px; background: #0f172a; color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex; align-items: center; justify-content: center; min-height: 95vh;
}}
.card {{
  background: #1e293b; border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 20px; padding: 32px 24px; max-width: 440px; width: 100%;
  text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}}
.icon {{
  width: 64px; height: 64px; background: rgba(239, 68, 68, 0.15);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: #ef4444; font-size: 32px;
}}
h2 {{ margin: 0 0 8px; font-size: 22px; color: #ffffff; }}
p {{ margin: 0 0 24px; font-size: 14px; color: #f87171; line-height: 1.5; }}
.btn {{
  display: inline-block; width: 100%; padding: 14px;
  background: #334155; color: #ffffff; font-size: 15px; font-weight: 600;
  border-radius: 12px; text-decoration: none; border: none; cursor: pointer;
}}
</style>
</head>
<body>
<div class="card">
  <div class="icon">✕</div>
  <h2>Ошибка авторизации {service_name}</h2>
  <p>{message}</p>
  <button class="btn" onclick="window.close()">Закрыть окно</button>
</div>
</body>
</html>"""
                self.wfile.write(html.encode("utf-8"))

            def do_GET(self):
                parsed = urllib.parse.urlparse(self.path)
                path = parsed.path
                query = urllib.parse.parse_qs(parsed.query)

                if path in ("/", "/status"):
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    resp = {
                        "status": "ok",
                        "deckymus": True,
                        "yandex_logged_in": plugin_self._yandex_client is not None,
                        "vk_logged_in": plugin_self._vk_user is not None,
                        "spotify_logged_in": plugin_self._spotify_user is not None
                    }
                    self.wfile.write(json.dumps(resp).encode("utf-8"))
                    return

                elif path == "/yandex/auth":
                    self.send_response(302)
                    self.send_header("Location", YANDEX_AUTH_URL)
                    self.end_headers()
                    return

                elif path in ("/yandex/helper", "/yandex"):
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    html = f"""<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>DeckyMus — Яндекс Музыка</title>
<style>
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
body {{ background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; }}
.card {{ background: #1e293b; border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 20px; padding: 28px 24px; max-width: 440px; width: 100%; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5); text-align: center; }}
.icon {{ width: 56px; height: 56px; margin: 0 auto 16px; background: #facc15; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #000; font-size: 26px; font-weight: 700; }}
h2 {{ font-size: 20px; font-weight: 700; margin-bottom: 6px; }}
p.sub {{ font-size: 13px; color: #94a3b8; margin-bottom: 20px; }}
.btn {{ display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; font-size: 15px; font-weight: 700; border-radius: 12px; text-decoration: none; border: none; cursor: pointer; margin: 10px 0; transition: opacity 0.2s, transform 0.1s; }}
.btn:active {{ transform: scale(0.98); }}
.btn-yandex {{ background: #facc15; color: #000000; }}
.btn-paste {{ background: #22c55e; color: #ffffff; }}
.instructions {{ font-size: 12px; color: #cbd5e1; text-align: left; line-height: 1.5; background: rgba(0, 0, 0, 0.25); padding: 12px 14px; border-radius: 10px; margin: 14px 0; border: 1px solid rgba(255, 255, 255, 0.08); }}
.instructions ol {{ padding-left: 18px; }}
.instructions li {{ margin-bottom: 6px; }}
input {{ width: 100%; padding: 12px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 10px; color: #fff; font-size: 13px; outline: none; margin: 8px 0; }}
input:focus {{ border-color: #facc15; }}
.status {{ margin-top: 12px; font-size: 14px; font-weight: 600; display: none; }}
</style></head>
<body>
<div class="card">
  <div class="icon">Я</div>
  <h2>Яндекс Музыка</h2>
  <p class="sub">Авторизация для DeckyMus на Steam Deck</p>
  <a class="btn btn-yandex" href="{YANDEX_AUTH_URL}" target="_blank">1. Открыть вход в Яндекс ID</a>
  <div class="instructions">
    <ol>
      <li>Нажмите кнопку выше и подтвердите доступ к Яндекс ID.</li>
      <li>После входа откроется страница подтверждения — скопируйте токен из адресной строки (после <code>access_token=</code>) или всю ссылку целиком.</li>
      <li>Вставьте токен или ссылку в поле ниже и нажмите «Подключить к Steam Deck».</li>
    </ol>
  </div>
  <input type="text" id="token" placeholder="access_token или ссылка из адресной строки" />
  <button class="btn btn-paste" onclick="submitToken()">2. Подключить к Steam Deck</button>
  <div id="status" class="status"></div>
</div>
<script>
function submitToken() {{
  var val = document.getElementById('token').value.trim();
  var m = val.match(/access_token[=:]+([^&\\s#"']+)/);
  if (m) val = m[1];
  if (!val) {{ alert('Пожалуйста, введите токен или ссылку'); return; }}
  fetch('/yandex/token', {{
    method: 'POST',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify({{ token: val }})
  }}).then(r => r.json()).then(data => {{
    var el = document.getElementById('status');
    el.style.display = 'block';
    if (data.success) {{
      el.style.color = '#22c55e';
      el.innerText = '✓ Вход выполнен! Медиатека уже подключена на консоли.';
    }} else {{
      el.style.color = '#ef4444';
      el.innerText = 'Ошибка: ' + (data.error || 'Не удалось авторизоваться');
    }}
  }}).catch(e => {{
    var el = document.getElementById('status');
    el.style.display = 'block';
    el.style.color = '#ef4444';
    el.innerText = 'Ошибка связи: ' + e;
  }});
}}
</script>
</body></html>"""
                    self.wfile.write(html.encode("utf-8"))
                    return

                elif path == "/vk/auth":
                    auth_url = (
                        f"https://oauth.vk.ru/authorize?client_id={VK_CLIENT_ID}"
                        "&scope=audio&redirect_uri=https://oauth.vk.ru/blank.html"
                        "&display=page&response_type=token"
                    )
                    self.send_response(302)
                    self.send_header("Location", auth_url)
                    self.end_headers()
                    return

                elif path in ("/vk/helper", "/vk"):
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    html = """<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>DeckyMus — VK Музыка</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; }
.card { background: #1e293b; border: 1px solid rgba(0, 119, 255, 0.3); border-radius: 20px; padding: 28px 24px; max-width: 440px; width: 100%; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5); text-align: center; }
.icon { width: 56px; height: 56px; margin: 0 auto 16px; background: #0077ff; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 26px; font-weight: 700; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
p.sub { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
.btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; font-size: 15px; font-weight: 600; border-radius: 12px; text-decoration: none; border: none; cursor: pointer; margin: 10px 0; transition: opacity 0.2s, transform 0.1s; }
.btn:active { transform: scale(0.98); }
.btn-vk { background: #0077ff; color: #ffffff; }
.btn-paste { background: #22c55e; color: #ffffff; }
.instructions { font-size: 12px; color: #cbd5e1; text-align: left; line-height: 1.5; background: rgba(0, 0, 0, 0.25); padding: 12px 14px; border-radius: 10px; margin: 14px 0; border: 1px solid rgba(255, 255, 255, 0.08); }
.instructions ol { padding-left: 18px; }
.instructions li { margin-bottom: 6px; }
input { width: 100%; padding: 12px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 10px; color: #fff; font-size: 13px; outline: none; margin: 8px 0; }
input:focus { border-color: #0077ff; }
.status { margin-top: 14px; padding: 12px; border-radius: 10px; font-size: 14px; line-height: 1.4; display: none; }
.status.loading { display: block; background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
.status.ok { display: block; background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
.status.err { display: block; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
</style></head>
<body>
<div class="card" id="mainCard">
  <div class="icon">VK</div>
  <h2>DeckyMus — VK Музыка</h2>
  <p class="sub">Вход на Steam Deck через смартфон</p>
  <a class="btn btn-vk" id="vkAuthLink" href="/vk/auth" target="_blank" rel="noopener noreferrer">1. Войти через ВКонтакте</a>
  <div class="instructions">
    <div style="font-weight: 700; color: #facc15; margin-bottom: 6px;">⚠️ Важно:</div>
    <ol>
      <li>Нажмите синюю кнопку выше и подтвердите доступ к аудио.</li>
      <li>ВКонтакте откроет <b>пустую страницу blank.html</b> (это нормально для VK).</li>
      <li><b>Скопируйте адрес (URL)</b> этой страницы из адресной строки браузера.</li>
      <li>Вернитесь сюда и нажмите зелёную кнопку ниже (или вставьте адрес в поле).</li>
    </ol>
  </div>
  <button class="btn btn-paste" id="pasteBtn" onclick="handlePasteButton()">📋 2. Вставить ссылку и войти</button>
  <input id="tokenInput" type="text" placeholder="Или вставьте ссылку / токен сюда..." oninput="handleManualInput(this.value)" />
  <div id="statusBox" class="status"></div>
</div>
<script>
const sb = document.getElementById('statusBox');
let isSubmitting = false;

async function submitToken(val) {
  if (isSubmitting) return;
  val = (val || '').trim();
  if (!val) { setStatus('err', 'Пожалуйста, вставьте ссылку или токен.'); return; }
  isSubmitting = true;
  setStatus('loading', '⏳ Проверка токена на Steam Deck...');
  try {
    const resp = await fetch('/api/vk_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: val })
    });
    const data = await resp.json();
    if (data && data.success) {
      setStatus('ok', '🎉 <b>Успешно подключено!</b><br>Вы вошли как: ' + (data.user || 'VK User') + '<br><br>Steam Deck уже обновлен, можете закрыть эту страницу.');
      document.getElementById('vkAuthLink').style.display = 'none';
      document.getElementById('pasteBtn').style.display = 'none';
      document.getElementById('tokenInput').style.display = 'none';
      const ins = document.querySelector('.instructions');
      if (ins) ins.style.display = 'none';
    } else {
      setStatus('err', '❌ Ошибка: ' + (data?.error || 'Неверный токен. Попробуйте еще раз.'));
      isSubmitting = false;
    }
  } catch (err) {
    setStatus('err', '❌ Ошибка связи со Steam Deck: ' + err.message);
    isSubmitting = false;
  }
}

function setStatus(type, html) {
  sb.className = 'status ' + type;
  sb.innerHTML = html;
  sb.style.display = 'block';
}

async function handlePasteButton() {
  if (navigator.clipboard && navigator.clipboard.readText) {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        document.getElementById('tokenInput').value = text;
        await submitToken(text);
        return;
      }
    } catch (_) {}
  }
  const val = document.getElementById('tokenInput').value;
  if (val) {
    await submitToken(val);
  } else {
    setStatus('err', 'Буфер обмена пуст. Вставьте ссылку вручную в поле ввода.');
  }
}

async function tryAutoReadClipboard() {
  if (isSubmitting) return;
  if (!navigator.clipboard || !navigator.clipboard.readText) return;
  try {
    const text = await navigator.clipboard.readText();
    if (text && (text.includes('access_token=') || text.startsWith('vk1.a.') || text.includes('oauth.vk.ru') || text.includes('oauth.vk.com'))) {
      document.getElementById('tokenInput').value = text;
      await submitToken(text);
    }
  } catch (_) {}
}

let inputTimeout = null;
function handleManualInput(val) {
  clearTimeout(inputTimeout);
  if (val && (val.includes('access_token=') || val.startsWith('vk1.a.'))) {
    inputTimeout = setTimeout(() => submitToken(val), 300);
  }
}

window.addEventListener('focus', tryAutoReadClipboard);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { tryAutoReadClipboard(); }
});
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  if (hash.includes('access_token=')) { submitToken(hash); }
  else if (search.includes('access_token=')) { submitToken(search); }
});
</script></body></html>"""
                    self.wfile.write(html.encode("utf-8"))
                    return

                elif path == "/spotify/auth":
                    session = plugin_self._get_or_create_spotify_pkce_session()
                    host = self.headers.get("Host", "")
                    target_url = session["auth_url"] if ("127.0.0.1" in host or "localhost" in host) else session["lan_auth_url"]
                    self.send_response(302)
                    self.send_header("Location", target_url)
                    self.end_headers()
                    return

                elif path in ("/callback", "/spotify/callback"):
                    error = query.get("error", [""])[0]
                    if error:
                        desc = query.get("error_description", ["Авторизация отклонена пользователем"])[0]
                        self._serve_error_page("Spotify", f"Ошибка: {desc}")
                        return

                    code = query.get("code", [""])[0]
                    state = query.get("state", [""])[0]

                    if not code:
                        self._serve_error_page("Spotify", "Не получен код авторизации от Spotify.")
                        return

                    expected_state = getattr(plugin_self, "_spotify_auth_state", None)
                    if expected_state and state != expected_state:
                        self._serve_error_page("Spotify", "Несоответствие параметра state (CSRF защита)", status_code=403)
                        return

                    if not requests:
                        self._serve_error_page("Spotify", "Модуль requests недоступен на Steam Deck.")
                        return

                    session = plugin_self._spotify_pkce_session or {}
                    verifier = session.get("verifier", "")
                    client_id = session.get("client_id") or plugin_self.config.get("spotify_client_id") or SPOTIFY_PUBLIC_CLIENT_ID

                    host = self.headers.get("Host", "")
                    local_ip = plugin_self._get_local_ip()

                    if state == "loopback":
                        redirect_uri = "http://127.0.0.1:9911/callback"
                    elif state == "lan":
                        redirect_uri = f"http://{local_ip}:9911/callback"
                    elif "127.0.0.1" in host or "localhost" in host:
                        redirect_uri = "http://127.0.0.1:9911/callback"
                    else:
                        redirect_uri = f"http://{local_ip}:9911/callback"

                    candidates = [redirect_uri]
                    alt_uri = f"http://{local_ip}:9911/callback" if redirect_uri == "http://127.0.0.1:9911/callback" else "http://127.0.0.1:9911/callback"
                    if alt_uri not in candidates:
                        candidates.append(alt_uri)

                    token_data = None
                    exchange_error = None

                    for target_uri in candidates:
                        try:
                            payload = {
                                "grant_type": "authorization_code",
                                "client_id": client_id,
                                "code": code,
                                "redirect_uri": target_uri,
                            }
                            if verifier:
                                payload["code_verifier"] = verifier

                            resp = requests.post(
                                "https://accounts.spotify.com/api/token",
                                data=payload,
                                headers={
                                    "Content-Type": "application/x-www-form-urlencoded",
                                    "User-Agent": "DeckyMus/1.0"
                                },
                                timeout=15
                            )
                            tdata = resp.json()
                            if resp.status_code == 200 and "access_token" in tdata:
                                token_data = tdata
                                break
                            else:
                                exchange_error = tdata.get("error_description") or tdata.get("error") or f"HTTP {resp.status_code}"
                        except Exception as e:
                            exchange_error = str(e)

                    if token_data and "access_token" in token_data:
                        access_tok = token_data["access_token"]
                        refresh_tok = token_data.get("refresh_token", "")
                        sync_res = plugin_self._sync_spotify_set_token(access_tok, refresh_tok)
                        if sync_res.get("success"):
                            with plugin_self._spotify_lock:
                                plugin_self._spotify_pkce_session = None
                            user_name = sync_res.get("user") or "Spotify User"
                            self._serve_success_page("Spotify", user_name)
                            return
                        else:
                            self._serve_error_page("Spotify", f"Не удалось получить профиль пользователя: {sync_res.get('error')}")
                            return

                    self._serve_error_page("Spotify", f"Не удалось обменять код на токен: {exchange_error or 'Неизвестная ошибка'}")
                    return

                elif path in ("/spotify/helper", "/spotify"):
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    html = """<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>DeckyMus — Spotify</title>
<style>
body { background: #0f172a; color: #f8fafc; font-family: -apple-system, sans-serif; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; }
.card { background: #1e293b; border: 1px solid rgba(30, 215, 96, 0.3); border-radius: 16px; padding: 24px; max-width: 440px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
.btn { display: inline-block; width: 100%; padding: 14px; background: #1ed760; color: #000; font-size: 15px; font-weight: 700; border-radius: 10px; text-decoration: none; border: none; cursor: pointer; margin: 12px 0; box-sizing: border-box; }
</style></head>
<body>
<div class="card">
<h2 style="margin-top:0">DeckyMus — Spotify</h2>
<p style="color:#94a3b8; font-size:14px">Подключение Spotify к вашему Steam Deck</p>
<a class="btn" href="/spotify/auth">Войти через Spotify (OAuth)</a>
<p style="font-size:12px; color:#64748b; margin-top:16px">После подтверждения сессия будет автоматически активирована на консоли.</p>
</div>
</body></html>"""
                    self.wfile.write(html.encode("utf-8"))
                    return

                self.send_response(404)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()

            def do_POST(self):
                parsed = urllib.parse.urlparse(self.path)
                length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(length)
                try:
                    payload = json.loads(body.decode("utf-8"))
                except Exception:
                    payload = {}

                if parsed.path in ("/yandex/token", "/api/yandex_token"):
                    raw_token = payload.get("token", "")
                    if not raw_token:
                        for k in ("url", "access_token", "link"):
                            if k in payload and payload[k]:
                                raw_token = str(payload[k]).strip()
                                break
                    if not raw_token and body:
                        try:
                            qs = urllib.parse.parse_qs(body.decode("utf-8", errors="replace"))
                            for k in ("token", "url", "access_token", "link"):
                                if k in qs and qs[k]:
                                    raw_token = qs[k][0].strip()
                                    break
                        except Exception:
                            pass
                    if not raw_token and body:
                        raw_token = body.decode("utf-8", errors="replace").strip()

                    res = plugin_self._sync_yandex_set_token(raw_token)
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps(res).encode("utf-8"))
                    return

                elif parsed.path == "/api/vk_token":
                    token = payload.get("token", "")
                    if not token:
                        for k in ("url", "access_token", "link"):
                            if k in payload and payload[k]:
                                token = str(payload[k]).strip()
                                break
                    if not token and body:
                        try:
                            qs = urllib.parse.parse_qs(body.decode("utf-8", errors="replace"))
                            for k in ("token", "url", "access_token", "link"):
                                if k in qs and qs[k]:
                                    token = qs[k][0].strip()
                                    break
                        except Exception:
                            pass
                    if not token and body:
                        token = body.decode("utf-8", errors="replace").strip()

                    res = plugin_self._sync_vk_set_token(token)
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps(res).encode("utf-8"))
                    return

                elif parsed.path == "/api/spotify_credentials":
                    cid = payload.get("client_id", "")
                    sec = payload.get("client_secret", "")
                    res = plugin_self._sync_spotify_set_credentials(cid, sec)
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps(res).encode("utf-8"))
                    return

                elif parsed.path == "/api/spotify_token":
                    tok = payload.get("token", "")
                    refresh_token = payload.get("refresh_token", "")
                    res = plugin_self._sync_spotify_set_token(tok, refresh_token)
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps(res).encode("utf-8"))
                    return

                self.send_response(404)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()

        server = None
        for attempt in range(5):
            try:
                server = ReusableHTTPServer(("0.0.0.0", 9911), AuthHandler)
                break
            except (OSError, Exception) as e:
                if attempt < 4:
                    time.sleep(0.05 * (attempt + 1))
                    continue
                logger.warning(f"Failed to start Auth HTTP server on port 9911: {e}")
                return

        self._auth_server = server

        def _serve():
            try:
                server.serve_forever()
            except Exception as e:
                logger.warning(f"Auth HTTP server note: {e}")

        self._auth_server_thread = threading.Thread(target=_serve, daemon=True)
        self._auth_server_thread.start()
        logger.info(f"DeckyMus Auth HTTP Server started on http://{self._get_local_ip()}:9911")

    def _stop_auth_server(self):
        with self._auth_server_lock:
            server = self._auth_server
            thread = self._auth_server_thread
            self._auth_server = None
            self._auth_server_thread = None

            if server:
                if thread and thread.is_alive() and threading.current_thread() != thread:
                    try:
                        server.shutdown()
                    except Exception:
                        pass
                try:
                    server.server_close()
                except Exception:
                    pass

            if thread and thread.is_alive() and threading.current_thread() != thread:
                try:
                    thread.join(timeout=3.0)
                except Exception:
                    pass

    # ==================== VK Музыка ====================

    def _clean_vk_token(self, token_or_url: str) -> str:
        s = (token_or_url or "").strip().strip("\"'").strip()
        if not s:
            return ""
        s = urllib.parse.unquote(s).strip()
        if "://" in s or "blank.html" in s or "error=" in s or "oauth.vk.com" in s or "oauth.vk.ru" in s:
            if "access_token=" not in s:
                return ""
        if "access_token=" in s:
            m = re.search(r"access_token=([^&\s#]+)", s)
            if m:
                s = m.group(1)
            else:
                return ""
        s = urllib.parse.unquote(s).strip()
        if "://" in s or "blank.html" in s or "error=" in s:
            return ""
        return s

    def _call_vk_api(self, method: str, params: dict = None) -> dict:
        if not requests:
            return {"error": {"error_msg": "requests недоступен"}}
        params = params or {}
        token = params.get("access_token") or self.config.get("vk_token", "")
        if not token:
            return {"error": {"error_msg": "VK токен не установлен"}}
        url = f"https://api.vk.com/method/{method}"
        headers = {
            "User-Agent": VK_USER_AGENT,
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "Origin": "https://vk.com",
            "Referer": "https://vk.com/"
        }
        data = {
            "v": VK_API_VERSION,
            "access_token": token
        }
        data.update(params)
        try:
            resp = requests.post(url, headers=headers, data=data, timeout=20)
            return resp.json()
        except Exception as e:
            logger.error(f"VK API error on {method}: {e}")
            return {"error": {"error_msg": str(e)}}

    async def _init_vk_client(self, token: str):
        cleaned = self._clean_vk_token(token)
        if not cleaned or not requests:
            self._vk_user = None
            self._vk_logged_in = False
            return None
        def _check():
            try:
                res = self._call_vk_api("users.get", {
                    "access_token": cleaned,
                    "fields": "photo_100,first_name,last_name"
                })
                if "response" in res and res["response"]:
                    u = res["response"][0]
                    first = u.get("first_name", "")
                    last = u.get("last_name", "")
                    full = f"{first} {last}".strip() or "VK User"
                    return {
                        "id": str(u.get("id", "")),
                        "name": full,
                        "avatar": u.get("photo_100", "")
                    }
            except Exception as e:
                logger.error(f"VK client check exception: {e}")
            return None

        user_info = await asyncio.to_thread(_check)
        if user_info:
            self._vk_user = user_info
            self._vk_logged_in = True
            self.config["vk_user"] = user_info
            self.config["vk_token"] = cleaned
            self._save_config()
        else:
            self._vk_user = None
            self._vk_logged_in = False
        return self._vk_user

    def _sync_vk_set_token(self, token: str) -> dict:
        cleaned = self._clean_vk_token(token)
        if not cleaned or not requests:
            return {"success": False, "error": "Неверный токен"}
        try:
            res = self._call_vk_api("users.get", {
                "access_token": cleaned,
                "fields": "photo_100,first_name,last_name"
            })
            if "response" in res and res["response"]:
                u = res["response"][0]
                first = u.get("first_name", "")
                last = u.get("last_name", "")
                full = f"{first} {last}".strip() or "VK User"
                user_info = {
                    "id": str(u.get("id", "")),
                    "name": full,
                    "avatar": u.get("photo_100", "")
                }
                self._vk_user = user_info
                self._vk_logged_in = True
                self.config["vk_user"] = user_info
                self.config["vk_token"] = cleaned
                self._save_config()
                return {"success": True, "user": full, "id": user_info["id"], "avatar": user_info["avatar"]}
            else:
                err = res.get("error", {}).get("error_msg", "Ошибка токена VK")
                return {"success": False, "error": err}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def vk_set_token(self, token: str):
        return await asyncio.to_thread(self._sync_vk_set_token, token)

    async def vk_logout(self):
        self.config["vk_token"] = ""
        self.config["vk_user"] = {}
        self._vk_user = None
        self._vk_logged_in = False
        self._save_config()
        return {"success": True}

    async def _vk_browser_monitor_loop(self):
        """Continuously monitors Steam CEF DevTools for VK, Yandex, or Spotify OAuth completion to auto-capture token and close tab."""
        while True:
            try:
                await asyncio.to_thread(self._check_steam_cef_for_vk_token)
                await asyncio.sleep(0.5)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.debug(f"CEF browser monitor loop error: {e}")
                await asyncio.sleep(1.0)

    def _evaluate_cef_js(self, target_identifier: str, expr: str):
        try:
            req = urllib.request.Request("http://127.0.0.1:8080/json")
            with urllib.request.urlopen(req, timeout=0.6) as resp:
                targets = json.loads(resp.read().decode("utf-8"))
                for t in targets:
                    if t.get("id") == target_identifier or (t.get("webSocketDebuggerUrl") and target_identifier in t.get("webSocketDebuggerUrl")):
                        ws_url = t.get("webSocketDebuggerUrl")
                        if not ws_url:
                            continue
                        import socket, base64, os, struct
                        path = ws_url.split(":8080")[1]
                        s = socket.socket()
                        s.settimeout(0.6)
                        s.connect(("127.0.0.1", 8080))
                        key = base64.b64encode(os.urandom(16)).decode()
                        req_str = f"GET {path} HTTP/1.1\r\nHost: 127.0.0.1:8080\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
                        s.sendall(req_str.encode())
                        buf = b""
                        while b"\r\n\r\n" not in buf:
                            buf += s.recv(1024)
                        payload = json.dumps({"id": 1001, "method": "Runtime.evaluate", "params": {"expression": expr}}).encode()
                        length = len(payload)
                        if length < 126:
                            hdr = bytes([0x81, 0x80 | length])
                        elif length <= 65535:
                            hdr = bytes([0x81, 0x80 | 126]) + struct.pack("!H", length)
                        else:
                            hdr = bytes([0x81, 0x80 | 127]) + struct.pack("!Q", length)
                        mask = os.urandom(4)
                        frame = hdr + mask + bytes([b ^ mask[i % 4] for i, b in enumerate(payload)])
                        s.sendall(frame)
                        s.close()
                        break
        except Exception:
            pass

    def _close_cef_target(self, target_id: str):
        try:
            close_req = urllib.request.Request(f"http://127.0.0.1:8080/json/close/{target_id}")
            urllib.request.urlopen(close_req, timeout=0.5)
            logger.info(f"Closed Steam browser target {target_id}")
        except Exception:
            pass
        # Ask Big Picture to NavigateBack cleanly if external web is open
        try:
            req = urllib.request.Request("http://127.0.0.1:8080/json")
            with urllib.request.urlopen(req, timeout=0.6) as resp:
                targets = json.loads(resp.read().decode("utf-8"))
                for t in targets:
                    ws_url = t.get("webSocketDebuggerUrl")
                    title = t.get("title", "")
                    if ws_url and "SharedJSContext" in title:
                        expr = "try { if (window.DFL && window.DFL.Navigation && typeof window.DFL.Navigation.NavigateBack === 'function') window.DFL.Navigation.NavigateBack(); } catch(e){}"
                        self._evaluate_cef_js(ws_url, expr)
        except Exception:
            pass

    def _dismiss_steam_browser_overlay(self):
        try:
            req = urllib.request.Request("http://127.0.0.1:8080/json")
            with urllib.request.urlopen(req, timeout=0.6) as resp:
                targets = json.loads(resp.read().decode("utf-8"))
                for t in targets:
                    ws_url = t.get("webSocketDebuggerUrl")
                    title = t.get("title", "")
                    if ws_url and "SharedJSContext" in title:
                        expr = "try { if (window.DFL && window.DFL.Navigation && typeof window.DFL.Navigation.NavigateBack === 'function') window.DFL.Navigation.NavigateBack(); } catch(e){}"
                        self._evaluate_cef_js(ws_url, expr)
        except Exception:
            pass

    def _check_steam_cef_for_vk_token(self):
        try:
            req = urllib.request.Request("http://127.0.0.1:8080/json")
            with urllib.request.urlopen(req, timeout=0.8) as resp:
                targets = json.loads(resp.read().decode("utf-8"))
                for target in targets:
                    url = target.get("url", "")
                    target_id = target.get("id")

                    search_str = f"{url} {urllib.parse.unquote(url)}"

                    # 1. VK OAuth token interception
                    if not self._vk_logged_in and "access_token" in search_str and ("blank.html" in search_str or "oauth.vk" in search_str or "vk1.a." in search_str):
                        m = re.search(r"access_token[=:]+([^&\s#\"']+)", search_str)
                        if m:
                            token = m.group(1)
                            logger.info("VK token auto-intercepted from Steam browser session")
                            if target_id:
                                success_ui = "document.body.innerHTML = '<div style=\"background:#0f172a;color:#ffffff;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;padding:24px;\"><div style=\"width:64px;height:64px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;\">✓</div><h2 style=\"font-size:22px;margin-bottom:8px;\">Вход в ВКонтакте выполнен!</h2><p style=\"color:#94a3b8;font-size:14px;\">Возвращаемся в DeckyMus...</p></div>'; setTimeout(() => { window.close(); if (window.history) window.history.back(); }, 600);"
                                self._evaluate_cef_js(target_id, success_ui)
                                threading.Timer(0.7, lambda: self._close_cef_target(target_id)).start()
                            return self._sync_vk_set_token(token)

                    # 2. Yandex OAuth token interception (Cassette method)
                    if self._yandex_client is None and "access_token" in search_str and ("verification_code" in search_str or "oauth.yandex" in search_str or "yandex.ru" in search_str):
                        m = re.search(r"access_token[=:]+([^&\s#\"']+)", search_str)
                        if m:
                            token = m.group(1)
                            logger.info("Yandex token auto-intercepted from Steam browser session (Cassette method)")
                            if target_id:
                                success_ui = "document.body.innerHTML = '<div style=\"background:#0f172a;color:#ffffff;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;padding:24px;\"><div style=\"width:64px;height:64px;border-radius:50%;background:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;\">✓</div><h2 style=\"font-size:22px;margin-bottom:8px;\">Вход в Яндекс Музыку выполнен!</h2><p style=\"color:#94a3b8;font-size:14px;\">Возвращаемся в DeckyMus...</p></div>'; setTimeout(() => { window.close(); if (window.history) window.history.back(); }, 600);"
                                self._evaluate_cef_js(target_id, success_ui)
                                threading.Timer(0.7, lambda: self._close_cef_target(target_id)).start()
                            return self._sync_yandex_set_token(token)

                    # 3. Auto-close remaining pages when already logged in
                    if self._yandex_client is not None and target_id and ("verification_code" in url or "oauth.yandex.ru" in url or "passport.yandex" in url):
                        self._close_cef_target(target_id)
                    elif self._spotify_user is not None and target_id and ("accounts.spotify.com" in url or "9911/callback" in url or "spotify/callback" in url):
                        self._close_cef_target(target_id)


        except Exception:
            pass
        return None

    async def vk_get_status(self):
        if not self._vk_logged_in:
            await asyncio.to_thread(self._check_steam_cef_for_vk_token)
        has_token = bool(self.config.get("vk_token"))
        logged_in = self._vk_user is not None
        user_name = self._vk_user.get("name", "") if self._vk_user else ""
        user_id = str(self._vk_user.get("id", "")) if self._vk_user else ""
        avatar = self._vk_user.get("avatar", "") if self._vk_user else ""
        local_ip = self._get_local_ip()
        auth_url = (
            f"https://oauth.vk.ru/authorize?client_id={VK_CLIENT_ID}"
            "&scope=audio&redirect_uri=https://oauth.vk.ru/blank.html"
            "&display=page&response_type=token"
        )
        helper_url = f"http://{local_ip}:9911/vk"
        qr_svg = self._generate_qr_svg(helper_url)

        return {
            "has_token": has_token,
            "logged_in": logged_in,
            "user_name": user_name,
            "user_id": user_id,
            "avatar": avatar,
            "auth_url": auth_url,
            "helper_url": helper_url,
            "qr_svg": qr_svg
        }

    async def vk_get_my_music(self, offset: int = 0, count: int = 2000):
        def _fetch():
            out = []
            cur_offset = offset
            limit = min(max(1, count), 2000)
            while len(out) < limit:
                chunk_count = min(1000, limit - len(out))
                res = self._call_vk_api("audio.get", {"offset": cur_offset, "count": chunk_count})
                if "response" not in res:
                    break
                items = res["response"].get("items", [])
                if not items:
                    break
                for item in items:
                    aid = str(item.get("id", ""))
                    oid = str(item.get("owner_id", ""))
                    album_obj = item.get("album") or {}
                    thumb = album_obj.get("thumb") or album_obj.get("photo") or {}
                    cover = thumb.get("photo_600") or thumb.get("photo_300") or thumb.get("photo_135") or ""
                    out.append({
                        "id": f"vk_{oid}_{aid}",
                        "title": item.get("title", "Трек"),
                        "artist": item.get("artist", "Исполнитель"),
                        "album": album_obj.get("title", ""),
                        "duration": int(item.get("duration", 0)),
                        "art_url": cover,
                        "url": item.get("url", ""),
                        "source": "vk"
                    })
                cur_offset += len(items)
                if len(items) < chunk_count:
                    break
            return out
        return await asyncio.to_thread(_fetch)

    async def vk_get_playlists(self, offset: int = 0, count: int = 50):
        def _fetch():
            owner_id = self._vk_user.get("id") if self._vk_user else ""
            params = {"offset": offset, "count": count}
            if owner_id:
                params["owner_id"] = owner_id
            res = self._call_vk_api("audio.getPlaylists", params)
            if "response" not in res:
                return []
            items = res["response"].get("items", [])
            out = []
            for item in items:
                thumb = item.get("photo") or item.get("thumb") or {}
                cover = thumb.get("photo_600") or thumb.get("photo_300") or thumb.get("photo_135") or ""
                out.append({
                    "id": str(item.get("id", "")),
                    "owner_id": str(item.get("owner_id", "")),
                    "title": item.get("title", "Плейлист"),
                    "track_count": int(item.get("count", 0)),
                    "cover": cover,
                    "description": item.get("description", "")
                })
            return out
        return await asyncio.to_thread(_fetch)

    async def vk_get_playlist_tracks(self, playlist_id: str, owner_id: str = "", offset: int = 0, count: int = 100):
        def _fetch():
            params = {
                "album_id": playlist_id,
                "offset": offset,
                "count": count
            }
            if owner_id:
                params["owner_id"] = owner_id
            res = self._call_vk_api("audio.get", params)
            if "response" not in res:
                return []
            items = res["response"].get("items", [])
            out = []
            for item in items:
                aid = str(item.get("id", ""))
                oid = str(item.get("owner_id", ""))
                album_obj = item.get("album") or {}
                thumb = album_obj.get("thumb") or album_obj.get("photo") or {}
                cover = thumb.get("photo_600") or thumb.get("photo_300") or thumb.get("photo_135") or ""
                out.append({
                    "id": f"vk_{oid}_{aid}",
                    "title": item.get("title", "Трек"),
                    "artist": item.get("artist", "Исполнитель"),
                    "album": album_obj.get("title", ""),
                    "duration": int(item.get("duration", 0)),
                    "art_url": cover,
                    "url": item.get("url", ""),
                    "source": "vk"
                })
            return out
        return await asyncio.to_thread(_fetch)

    async def vk_search(self, query: str, offset: int = 0, count: int = 50):
        if not query or not query.strip():
            return []
        def _fetch():
            res = self._call_vk_api("audio.search", {
                "q": query.strip(),
                "offset": offset,
                "count": count,
                "auto_complete": 1
            })
            if "response" not in res:
                return []
            items = res["response"].get("items", [])
            out = []
            for item in items:
                aid = str(item.get("id", ""))
                oid = str(item.get("owner_id", ""))
                album_obj = item.get("album") or {}
                thumb = album_obj.get("thumb") or album_obj.get("photo") or {}
                cover = thumb.get("photo_600") or thumb.get("photo_300") or thumb.get("photo_135") or ""
                out.append({
                    "id": f"vk_{oid}_{aid}",
                    "title": item.get("title", "Трек"),
                    "artist": item.get("artist", "Исполнитель"),
                    "album": album_obj.get("title", ""),
                    "duration": int(item.get("duration", 0)),
                    "art_url": cover,
                    "url": item.get("url", ""),
                    "source": "vk"
                })
            return out
        return await asyncio.to_thread(_fetch)

    def _sync_resolve_vk_url(self, track: dict) -> str:
        # Check existing url in track object
        u = track.get("url", "")
        if u and ("index.m3u8" in u or ".mp3" in u):
            return u
        # Fallback to audio.getById
        tid = track.get("id", "")
        raw_id = tid.replace("vk_", "")
        res = self._call_vk_api("audio.getById", {"audios": raw_id})
        if "response" in res and res["response"]:
            item = res["response"][0]
            fresh_url = item.get("url", "")
            if fresh_url:
                track["url"] = fresh_url
                return fresh_url
        return ""

    async def _resolve_vk_url(self, track: dict) -> str:
        return await asyncio.to_thread(self._sync_resolve_vk_url, track)

    # ==================== Spotify ====================

    def _compute_pkce_challenge(self, verifier: str) -> str:
        digest = hashlib.sha256(verifier.encode("ascii")).digest()
        return base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")

    def _get_or_create_spotify_pkce_session(self) -> dict:
        with self._spotify_lock:
            now = time.time()
            if self._spotify_pkce_session:
                created_at = self._spotify_pkce_session.get("created_at", 0)
                if now - created_at < SPOTIFY_PKCE_TTL:
                    return self._spotify_pkce_session

            client_id = self.config.get("spotify_client_id") or SPOTIFY_PUBLIC_CLIENT_ID
            verifier = secrets.token_urlsafe(64)
            challenge = self._compute_pkce_challenge(verifier)

            local_ip = self._get_local_ip()
            loopback_redirect = "http://127.0.0.1:9911/callback"
            lan_redirect = f"http://{local_ip}:9911/callback"

            scope_encoded = urllib.parse.quote(SPOTIFY_AUTH_SCOPE)

            auth_url = (
                f"https://accounts.spotify.com/authorize?client_id={client_id}"
                f"&response_type=code"
                f"&redirect_uri={urllib.parse.quote(loopback_redirect, safe='')}"
                f"&code_challenge_method=S256"
                f"&code_challenge={challenge}"
                f"&scope={scope_encoded}"
                f"&state=loopback"
            )

            lan_auth_url = (
                f"https://accounts.spotify.com/authorize?client_id={client_id}"
                f"&response_type=code"
                f"&redirect_uri={urllib.parse.quote(lan_redirect, safe='')}"
                f"&code_challenge_method=S256"
                f"&code_challenge={challenge}"
                f"&scope={scope_encoded}"
                f"&state=lan"
            )

            qr_svg = self._generate_qr_svg(lan_auth_url)

            session = {
                "client_id": client_id,
                "verifier": verifier,
                "challenge": challenge,
                "auth_url": auth_url,
                "lan_auth_url": lan_auth_url,
                "qr_svg": qr_svg,
                "created_at": now,
            }
            self._spotify_pkce_session = session
            return session

    def _spotify_refresh_access_token(self) -> str:
        refresh_tok = self.config.get("spotify_refresh_token")
        if not refresh_tok or not requests:
            return ""
        client_id = self.config.get("spotify_client_id") or SPOTIFY_PUBLIC_CLIENT_ID
        try:
            resp = requests.post(
                "https://accounts.spotify.com/api/token",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_tok,
                    "client_id": client_id,
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "DeckyMus/1.0"
                },
                timeout=15
            )
            if resp.status_code == 200:
                data = resp.json()
                new_tok = data.get("access_token", "")
                if new_tok:
                    with self._spotify_lock:
                        self._spotify_access_token = new_tok
                        if "refresh_token" in data:
                            self.config["spotify_refresh_token"] = data["refresh_token"]
                        expires_in = int(data.get("expires_in", 3600))
                        self._spotify_token_expires = time.time() + expires_in - 60
                        with self._config_lock:
                            self.config["spotify_token"] = new_tok
                            self._save_config()
                    return new_tok
            else:
                logger.warning(f"Spotify token refresh failed: {resp.status_code} {resp.text}")
        except Exception as e:
            logger.error(f"Spotify token refresh exception: {e}")
        return ""

    def _spotify_ensure_token(self) -> str:
        now = time.time()
        if self._spotify_access_token and (self._spotify_token_expires == 0 or now < self._spotify_token_expires):
            return self._spotify_access_token

        # Try PKCE refresh token
        refreshed = self._spotify_refresh_access_token()
        if refreshed:
            return refreshed

        if self._spotify_access_token:
            return self._spotify_access_token

        # Legacy client credentials fallback
        cid = self.config.get("spotify_client_id")
        sec = self.config.get("spotify_client_secret")
        if cid and sec and requests:
            try:
                resp = requests.post(
                    "https://accounts.spotify.com/api/token",
                    data={"grant_type": "client_credentials", "client_id": cid, "client_secret": sec},
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=15
                )
                data = resp.json()
                if "access_token" in data:
                    self._spotify_access_token = data["access_token"]
                    self._spotify_token_expires = time.time() + int(data.get("expires_in", 3600)) - 60
                    return self._spotify_access_token
            except Exception as e:
                logger.error(f"Spotify client credentials refresh error: {e}")
        return ""

    def _sync_spotify_set_credentials(self, client_id: str, client_secret: str) -> dict:
        if not requests:
            return {"success": False, "error": "requests недоступен"}
        cid = client_id.strip()
        sec = client_secret.strip()
        try:
            resp = requests.post(
                "https://accounts.spotify.com/api/token",
                data={"grant_type": "client_credentials", "client_id": cid, "client_secret": sec},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=15
            )
            data = resp.json()
            if "access_token" in data:
                with self._config_lock:
                    self.config["spotify_client_id"] = cid
                    self.config["spotify_client_secret"] = sec
                    self.config["spotify_token"] = data["access_token"]
                    self._save_config()
                with self._spotify_lock:
                    self._spotify_access_token = data["access_token"]
                    self._spotify_token_expires = 0
                return {"success": True}
            else:
                err = data.get("error_description") or data.get("error") or "Неверные ключи"
                return {"success": False, "error": err}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def spotify_set_credentials(self, client_id: str, client_secret: str):
        return await asyncio.to_thread(self._sync_spotify_set_credentials, client_id, client_secret)

    def _sync_spotify_set_token(self, token: str, refresh_token: str = "") -> dict:
        tok = token.strip()
        if not tok or not requests:
            return {"success": False, "error": "Неверный токен"}
        try:
            resp = requests.get(
                "https://api.spotify.com/v1/me",
                headers={"Authorization": f"Bearer {tok}", "User-Agent": "DeckyMus/1.0"},
                timeout=15
            )
            if resp.status_code == 200:
                data = resp.json()
                name = data.get("display_name") or data.get("id") or "Spotify User"
                images = data.get("images") or []
                avatar = images[0].get("url", "") if images else ""
                prod = data.get("product", "Free")
                user_info = {
                    "id": data.get("id", ""),
                    "name": name,
                    "avatar": avatar,
                    "product": prod
                }
                with self._spotify_lock:
                    self._spotify_user = user_info
                    self._spotify_access_token = tok
                    self._spotify_token_expires = time.time() + 3540
                    with self._config_lock:
                        self.config["spotify_user"] = user_info
                        self.config["spotify_token"] = tok
                        if refresh_token:
                            self.config["spotify_refresh_token"] = refresh_token.strip()
                        self._save_config()
                return {"success": True, "user": name, "id": user_info["id"], "avatar": avatar, "product": prod}
            else:
                return {"success": False, "error": f"Ошибка {resp.status_code}: Недействительный токен"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def spotify_set_token(self, token: str, refresh_token: str = ""):
        return await asyncio.to_thread(self._sync_spotify_set_token, token, refresh_token)

    async def spotify_logout(self):
        with self._spotify_lock:
            self._spotify_pkce_session = None
            self._spotify_auth_state = None
            self._spotify_user = None
            self._spotify_access_token = ""
            self._spotify_token_expires = 0
            with self._config_lock:
                self.config["spotify_token"] = ""
                self.config["spotify_refresh_token"] = ""
                self.config["spotify_user"] = {}
                self._save_config()
        return {"success": True}

    async def _init_spotify_client(self):
        tok = self.config.get("spotify_token", "")
        refresh_tok = self.config.get("spotify_refresh_token", "")
        if tok:
            await self.spotify_set_token(tok, refresh_tok)
        elif refresh_tok:
            await asyncio.to_thread(self._spotify_ensure_token)
        else:
            cid = self.config.get("spotify_client_id", "")
            sec = self.config.get("spotify_client_secret", "")
            if cid and sec:
                await self.spotify_set_credentials(cid, sec)

    async def spotify_get_status(self):
        has_token = bool(self.config.get("spotify_token") or self._spotify_access_token)
        logged_in = self._spotify_user is not None
        user_name = self._spotify_user.get("name", "") if self._spotify_user else ""
        user_id = self._spotify_user.get("id", "") if self._spotify_user else ""
        avatar = self._spotify_user.get("avatar", "") if self._spotify_user else ""
        product = self._spotify_user.get("product", "") if self._spotify_user else ""
        local_ip = self._get_local_ip()

        if logged_in:
            return {
                "has_token": has_token,
                "logged_in": True,
                "user_name": user_name,
                "user_id": user_id,
                "avatar": avatar,
                "product": product,
                "has_credentials": True,
                "auth_url": "",
                "helper_url": f"http://{local_ip}:9911/spotify",
                "qr_svg": ""
            }

        session = self._get_or_create_spotify_pkce_session()
        return {
            "has_token": has_token,
            "logged_in": False,
            "user_name": "",
            "user_id": "",
            "avatar": "",
            "product": "",
            "has_credentials": True,
            "auth_url": session["auth_url"],
            "helper_url": f"http://{local_ip}:9911/spotify",
            "qr_svg": session["qr_svg"]
        }

    async def spotify_get_playlists(self, offset: int = 0, limit: int = 50):
        def _fetch():
            tok = self._spotify_ensure_token()
            if not tok or not requests:
                return []
            endpoint = "https://api.spotify.com/v1/me/playlists" if self._spotify_user else "https://api.spotify.com/v1/browse/featured-playlists"
            try:
                resp = requests.get(
                    endpoint,
                    headers={"Authorization": f"Bearer {tok}"},
                    params={"limit": limit, "offset": offset},
                    timeout=15
                )
                if resp.status_code != 200:
                    return []
                data = resp.json()
                items = data.get("playlists", {}).get("items", []) if "playlists" in data else data.get("items", [])
                out = []
                for p in items:
                    if not p:
                        continue
                    imgs = p.get("images") or []
                    cover = imgs[0].get("url", "") if imgs else ""
                    out.append({
                        "id": p.get("id", ""),
                        "title": p.get("name", "Плейлист"),
                        "track_count": int(p.get("tracks", {}).get("total", 0)),
                        "cover": cover,
                        "owner_name": p.get("owner", {}).get("display_name", "")
                    })
                return out
            except Exception as e:
                logger.error(f"Spotify get playlists error: {e}")
                return []
        return await asyncio.to_thread(_fetch)

    async def spotify_get_playlist_tracks(self, playlist_id: str, offset: int = 0, limit: int = 100):
        def _fetch():
            tok = self._spotify_ensure_token()
            if not tok or not requests:
                return []
            try:
                resp = requests.get(
                    f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks",
                    headers={"Authorization": f"Bearer {tok}"},
                    params={"limit": limit, "offset": offset},
                    timeout=15
                )
                if resp.status_code != 200:
                    return []
                items = resp.json().get("items", [])
                out = []
                for item in items:
                    t = item.get("track") if "track" in item else item
                    if not t or not t.get("id"):
                        continue
                    album = t.get("album") or {}
                    imgs = album.get("images") or []
                    cover = imgs[0].get("url", "") if imgs else ""
                    artists = ", ".join(a.get("name", "") for a in t.get("artists", []))
                    out.append({
                        "id": f"sp_{t.get('id')}",
                        "title": t.get("name", "Трек"),
                        "artist": artists or "Spotify",
                        "album": album.get("name", ""),
                        "duration": int((t.get("duration_ms") or 0) / 1000),
                        "art_url": cover,
                        "url": t.get("preview_url") or "",
                        "source": "spotify"
                    })
                return out
            except Exception as e:
                logger.error(f"Spotify playlist tracks error: {e}")
                return []
        return await asyncio.to_thread(_fetch)

    async def spotify_get_liked_tracks(self, offset: int = 0, limit: int = 50):
        def _fetch():
            tok = self._spotify_ensure_token()
            if not tok or not requests:
                return []
            try:
                resp = requests.get(
                    "https://api.spotify.com/v1/me/tracks",
                    headers={"Authorization": f"Bearer {tok}"},
                    params={"limit": limit, "offset": offset},
                    timeout=15
                )
                if resp.status_code != 200:
                    return []
                items = resp.json().get("items", [])
                out = []
                for item in items:
                    t = item.get("track")
                    if not t or not t.get("id"):
                        continue
                    album = t.get("album") or {}
                    imgs = album.get("images") or []
                    cover = imgs[0].get("url", "") if imgs else ""
                    artists = ", ".join(a.get("name", "") for a in t.get("artists", []))
                    out.append({
                        "id": f"sp_{t.get('id')}",
                        "title": t.get("name", "Трек"),
                        "artist": artists or "Spotify",
                        "album": album.get("name", ""),
                        "duration": int((t.get("duration_ms") or 0) / 1000),
                        "art_url": cover,
                        "url": t.get("preview_url") or "",
                        "source": "spotify"
                    })
                return out
            except Exception as e:
                logger.error(f"Spotify liked tracks error: {e}")
                return []
        return await asyncio.to_thread(_fetch)

    async def spotify_search(self, query: str, offset: int = 0, limit: int = 50):
        if not query or not query.strip():
            return []
        def _fetch():
            tok = self._spotify_ensure_token()
            if not tok or not requests:
                return []
            try:
                resp = requests.get(
                    "https://api.spotify.com/v1/search",
                    headers={"Authorization": f"Bearer {tok}"},
                    params={"q": query.strip(), "type": "track", "limit": limit, "offset": offset},
                    timeout=15
                )
                if resp.status_code != 200:
                    return []
                items = resp.json().get("tracks", {}).get("items", [])
                out = []
                for t in items:
                    if not t or not t.get("id"):
                        continue
                    album = t.get("album") or {}
                    imgs = album.get("images") or []
                    cover = imgs[0].get("url", "") if imgs else ""
                    artists = ", ".join(a.get("name", "") for a in t.get("artists", []))
                    out.append({
                        "id": f"sp_{t.get('id')}",
                        "title": t.get("name", "Трек"),
                        "artist": artists or "Spotify",
                        "album": album.get("name", ""),
                        "duration": int((t.get("duration_ms") or 0) / 1000),
                        "art_url": cover,
                        "url": t.get("preview_url") or "",
                        "source": "spotify"
                    })
                return out
            except Exception as e:
                logger.error(f"Spotify search error: {e}")
                return []
        return await asyncio.to_thread(_fetch)

    async def _resolve_spotify_url(self, track: dict) -> str:
        title = track.get("title", "")
        artist = track.get("artist", "")
        if not yt_dlp:
            return track.get("url", "")
        def _resolve():
            try:
                search_query = f"ytsearch1:{artist} - {title} audio" if artist else f"ytsearch1:{title} audio"
                ydl_opts = {
                    "format": "bestaudio/best",
                    "quiet": True,
                    "no_warnings": True,
                    "extract_flat": False
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(search_query, download=False)
                    entries = info.get("entries")
                    if entries and len(entries) > 0:
                        return entries[0].get("url", "")
                    return info.get("url", "")
            except Exception as e:
                logger.error(f"Spotify stream resolve error: {e}")
                return track.get("url", "")
        return await asyncio.to_thread(_resolve)
