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
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

import importlib.util

# Inject bundled pure-python modules
PLUGIN_DIR = Path(__file__).resolve().parent
PY_MODULES = PLUGIN_DIR / "py_modules"
if str(PY_MODULES) not in sys.path:
    sys.path.insert(0, str(PY_MODULES))

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
except Exception as e:
    YandexClient = None
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
        self._req_counter = 0

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

        env["PATH"] = "/usr/local/bin:/usr/bin:/bin"
        env["HOME"] = str(self.home)
        env["USER"] = self.user_info["username"]
        env["XDG_RUNTIME_DIR"] = f"/run/user/{self.uid}"
        env["PULSE_SERVER"] = f"unix:/run/user/{self.uid}/pulse/native"
        env["PIPEWIRE_RUNTIME_DIR"] = f"/run/user/{self.uid}"

        cmd = [
            "mpv",
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
        await asyncio.to_thread(self._ensure_mpv)

        # Initialize Yandex Music client if token exists
        if self.config.get("yandex_token"):
            asyncio.create_task(self._init_yandex_client(self.config["yandex_token"]))

        # Start background monitor for track finish / queue progression
        self._monitor_task = asyncio.create_task(self._playback_monitor_loop())

    async def _unload(self):
        logger.info("DeckyMus plugin unloading")
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
            if source in ("ytmusic", "yandex", "vk") or not play_url:
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
            env["PATH"] = "/usr/local/bin:/usr/bin:/bin"

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

            elif source == "ytmusic":
                if not yt_dlp:
                    logger.error("Download failed: yt-dlp is not available")
                    return {"success": False, "error": "yt-dlp недоступен"}

                ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
                last_err = ""

                # Retry up to 2 times in case of transient YouTube 403 / throttling
                for attempt in range(1, 3):
                    try:
                        ydl_opts = {
                            "format": "bestaudio/best",
                            "quiet": True,
                            "no_warnings": True,
                            "extract_flat": False
                        }
                        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                            info = ydl.extract_info(f"https://www.youtube.com/watch?v={track_id}", download=False)
                            direct_url = info.get("url")
                    except Exception as ye:
                        last_err = f"Ошибка извлечения потока: {ye}"
                        logger.error(f"yt_dlp extraction error for {track_id} (attempt {attempt}): {ye}")
                        continue

                    if not direct_url:
                        last_err = "Не удалось извлечь YouTube поток"
                        continue

                    cmd = [
                        "ffmpeg", "-y",
                        "-user_agent", ua,
                        "-reconnect", "1",
                        "-reconnect_streamed", "1",
                        "-reconnect_delay_max", "5",
                        "-i", direct_url,
                        "-vn", "-c:a", "libmp3lame", "-b:a", "192k",
                        "-f", "mp3",
                        "-metadata", f"title={title}",
                        "-metadata", f"artist={artist}",
                        "-metadata", f"album={album}",
                        str(tmp_path)
                    ]
                    proc = subprocess.run(cmd, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
                    if proc.returncode == 0:
                        last_err = ""
                        break
                    else:
                        last_err = (proc.stderr or "")[-400:].strip()
                        logger.warning(f"FFmpeg attempt {attempt} error {proc.returncode}: {last_err}")
                        import time
                        time.sleep(1.0)

                if last_err or not tmp_path.is_file():
                    return {"success": False, "error": f"Ошибка скачивания ({last_err[:80]})"}
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
            return None
        try:
            def _create():
                c = YandexClient(token).init()
                return c
            self._yandex_client = await asyncio.to_thread(_create)
            return self._yandex_client
        except Exception as e:
            logger.warning(f"Yandex Music init error: {e}")
            self._yandex_client = None
            return None

    async def yandex_set_token(self, token: str):
        self.config["yandex_token"] = token.strip()
        self._save_config()
        client = await self._init_yandex_client(self.config["yandex_token"])
        if client and hasattr(client, "me"):
            return {
                "success": True,
                "user": getattr(client.me.account, "full_name", "") or getattr(client.me.account, "login", "")
            }
        return {"success": False, "error": "Не удалось авторизоваться по токену"}

    async def yandex_get_status(self):
        has_token = bool(self.config.get("yandex_token"))
        logged_in = self._yandex_client is not None
        user_name = ""
        if logged_in:
            try:
                user_name = getattr(self._yandex_client.me.account, "full_name", "") or getattr(self._yandex_client.me.account, "login", "")
            except Exception:
                pass
        return {
            "has_token": has_token,
            "logged_in": logged_in,
            "user_name": user_name
        }

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
                if playlist_id == "likes":
                    likes = self._yandex_client.users_likes_tracks()
                    raw_tracks = [l.fetch_track() for l in likes[:150] if l]
                else:
                    pl = self._yandex_client.users_playlists(kind=int(playlist_id), user_id=owner_id or self._yandex_client.me.account.uid)
                    raw_tracks = [t.track for t in pl.tracks if t and t.track]

                for t in raw_tracks:
                    if not t:
                        continue
                    cover = ""
                    if hasattr(t, "cover_uri") and t.cover_uri:
                        cover = "https://" + t.cover_uri.replace("%%", "200x200")
                    artists_str = ", ".join(a.name for a in t.artists) if t.artists else "Исполнитель"
                    duration_s = int(t.duration_ms / 1000) if t.duration_ms else 0
                    tracks.append({
                        "id": str(t.id),
                        "title": t.title or "Трек",
                        "artist": artists_str,
                        "album": t.albums[0].title if t.albums else "",
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
