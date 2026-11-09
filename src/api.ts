import { callable } from "@decky/api";
import {
  PlayerStatus,
  Track,
  YandexStatus,
  YandexPlaylist,
  QueueState,
  DirectoryBrowseResult,
  DownloadedInfo,
} from "./types";

// Player Core
export const rpcGetStatus = callable<[], PlayerStatus>("get_status");
export const rpcPlayPause = callable<[], boolean>("play_pause");
export const rpcPlay = callable<[], boolean>("play");
export const rpcPause = callable<[], boolean>("pause");
export const rpcStop = callable<[], boolean>("stop");
export const rpcNextTrack = callable<[], boolean>("next_track");
export const rpcPreviousTrack = callable<[], boolean>("previous_track");
export const rpcSeek = callable<[number], boolean>("seek");
export const rpcSetVolume = callable<[number], boolean>("set_volume");
export const rpcSetRepeat = callable<[string], boolean>("set_repeat");
export const rpcToggleShuffle = callable<[], boolean>("toggle_shuffle");
export const rpcPlayTrack = callable<[Track], boolean>("play_track");
export const rpcPlayQueue = callable<[Track[], number], boolean>("play_queue");
export const rpcPlayIndex = callable<[number], boolean>("play_index");
export const rpcGetQueue = callable<[], QueueState>("get_queue");
export const rpcClearQueue = callable<[], boolean>("clear_queue");

// Local Library
export const rpcGetLocalFolders = callable<[], string[]>("get_local_folders");
export const rpcSetLocalFolders = callable<[string[]], boolean>("set_local_folders");
export const rpcScanLocalMusic = callable<[], Track[]>("scan_local_music");
export const rpcBrowseDirectory = callable<[string], DirectoryBrowseResult>("browse_directory");

// Yandex Music
export const rpcYandexSetToken = callable<[string], { success: boolean; user?: string; error?: string }>("yandex_set_token");
export const rpcYandexGetStatus = callable<[], YandexStatus>("yandex_get_status");
export const rpcYandexGetPlaylists = callable<[], YandexPlaylist[]>("yandex_get_playlists");
export const rpcYandexGetPlaylistTracks = callable<[string, string], Track[]>("yandex_get_playlist_tracks");
export const rpcYandexGetChart = callable<[], Track[]>("yandex_get_chart");

// YouTube Music
export const rpcYtSearch = callable<[string], Track[]>("yt_search");

// Downloads & Offline Storage
export const rpcGetDownloadFolder = callable<[], string>("get_download_folder");
export const rpcSetDownloadFolder = callable<[string], boolean>("set_download_folder");
export const rpcGetDownloadedInfo = callable<[], DownloadedInfo>("get_downloaded_info");
export const rpcDownloadTrack = callable<[Track], { success: boolean; path?: string; error?: string }>("download_track");
