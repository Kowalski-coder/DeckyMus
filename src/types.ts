export interface Track {
  id: string;
  path?: string;
  url?: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  art_url?: string;
  source: "local" | "yandex" | "ytmusic" | "vk" | "none";
}

export interface PlayerStatus {
  playback_status: "Playing" | "Paused" | "Stopped";
  position: number;
  duration: number;
  volume: number;
  is_idle: boolean;
  track: Track;
  queue_length: number;
  queue_index: number;
  repeat: "off" | "all" | "one";
  shuffle: boolean;
}

export interface YandexStatus {
  has_token: boolean;
  logged_in: boolean;
  user_name: string;
}

export interface YandexPlaylist {
  id: string;
  owner_id?: string;
  title: string;
  track_count: number;
  cover?: string;
}

export interface QueueState {
  queue: Track[];
  index: number;
}

export interface DirectoryBrowseResult {
  current: string;
  parent: string;
  subdirs: { name: string; path: string }[];
  presets: { name: string; path: string }[];
}

export interface DownloadedInfo {
  ids: string[];
  filenames: string[];
}
