import { callable } from "@decky/api";
import {
  PlayerStatus,
  Track,
  YandexStatus,
  YandexPlaylist,
  VkStatus,
  VkPlaylist,
  SpotifyStatus,
  SpotifyPlaylist,
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
export const rpcYandexLogout = callable<[], boolean>("yandex_logout");
export const rpcYandexStartAuth = callable<[boolean?], { success: boolean; user_code?: string; auth_url?: string; qr_svg?: string; expires_in?: number; error?: string }>("yandex_start_auth");
export const rpcYandexGetStatus = callable<[], YandexStatus>("yandex_get_status");
export const rpcYandexGetPlaylists = callable<[], YandexPlaylist[]>("yandex_get_playlists");
export const rpcYandexGetPlaylistTracks = callable<[string, string], Track[]>("yandex_get_playlist_tracks");
export const rpcYandexGetChart = callable<[], Track[]>("yandex_get_chart");

// VK Музыка
export const rpcVkGetStatus = callable<[], VkStatus>("vk_get_status");
export const rpcVkSetToken = callable<[string], { success: boolean; user?: string; error?: string }>("vk_set_token");
export const rpcVkLogout = callable<[], boolean>("vk_logout");
export const rpcVkGetMyMusic = callable<[number, number], Track[]>("vk_get_my_music");
export const rpcVkGetPlaylists = callable<[number, number], VkPlaylist[]>("vk_get_playlists");
export const rpcVkGetPlaylistTracks = callable<[string, string, number, number], Track[]>("vk_get_playlist_tracks");
export const rpcVkSearch = callable<[string, number, number], Track[]>("vk_search");

// Spotify
export const rpcSpotifyGetStatus = callable<[], SpotifyStatus>("spotify_get_status");
export const rpcSpotifySetCredentials = callable<[string, string], { success: boolean; error?: string }>("spotify_set_credentials");
export const rpcSpotifySetToken = callable<[string, string], { success: boolean; user?: string; error?: string }>("spotify_set_token");
export const rpcSpotifyLogout = callable<[], boolean>("spotify_logout");
export const rpcSpotifyGetPlaylists = callable<[number, number], SpotifyPlaylist[]>("spotify_get_playlists");
export const rpcSpotifyGetPlaylistTracks = callable<[string, number, number], Track[]>("spotify_get_playlist_tracks");
export const rpcSpotifyGetLikedTracks = callable<[number, number], Track[]>("spotify_get_liked_tracks");
export const rpcSpotifySearch = callable<[string, number, number], Track[]>("spotify_search");

// YouTube Music
export const rpcYtSearch = callable<[string], Track[]>("yt_search");

// Downloads & Offline Storage
export const rpcGetDownloadFolder = callable<[], string>("get_download_folder");
export const rpcSetDownloadFolder = callable<[string], boolean>("set_download_folder");
export const rpcGetDownloadedInfo = callable<[], DownloadedInfo>("get_downloaded_info");
export const rpcDownloadTrack = callable<[Track], { success: boolean; path?: string; error?: string }>("download_track");

// Browser Opener
export const rpcOpenBrowser = callable<[string], { success: boolean; error?: string }>("open_browser");
