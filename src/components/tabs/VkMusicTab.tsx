import { FC, useState, useEffect, useRef } from "react";
import {
  PanelSection,
  PanelSectionRow,
  DialogButton,
  Focusable,
  Navigation,
  TextField,
} from "@decky/ui";
import {
  FaPlay,
  FaPause,
  FaDownload,
  FaSpinner,
  FaSignOutAlt,
  FaSearch,
  FaListUl,
  FaMusic,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";
import { Track, PlayerStatus, VkStatus, VkPlaylist } from "../../types";
import {
  rpcVkGetStatus,
  rpcVkSetToken,
  rpcVkLogout,
  rpcVkGetMyMusic,
  rpcVkGetPlaylists,
  rpcVkGetPlaylistTracks,
  rpcVkSearch,
  rpcPlayQueue,
  rpcPlayPause,
  rpcGetDownloadedInfo,
  rpcDownloadTrack,
} from "../../api";
import { openExternalAuthUrl } from "../../utils/browser";
import { VkMusicIcon } from "../VkMusicIcon";
import { useTranslation } from "../../i18n";

interface VkMusicTabProps {
  status: PlayerStatus;
  onRefresh: () => void;
}

// Persistent caches
let cachedVkTracks: Track[] = [];
let cachedVkPlaylists: VkPlaylist[] = [];
let cachedVkView: "my_music" | "playlists" | "search" = "my_music";
let cachedVkSearchQuery = "";
let cachedVkSearchResults: Track[] = [];

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const VkMusicTab: FC<VkMusicTabProps> = ({ status, onRefresh }) => {
  const { t } = useTranslation();
  const [vkStatus, setVkStatus] = useState<VkStatus>({
    has_token: false,
    logged_in: false,
    user_name: "",
  });
  const [activeView, setActiveView] = useState<"my_music" | "playlists" | "playlist_tracks" | "search">(
    cachedVkView
  );
  const [tracks, setTracks] = useState<Track[]>(cachedVkTracks);
  const [playlists, setPlaylists] = useState<VkPlaylist[]>(cachedVkPlaylists);
  const [selectedPlaylist, setSelectedPlaylist] = useState<VkPlaylist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState(cachedVkSearchQuery);
  const [searchResults, setSearchResults] = useState<Track[]>(cachedVkSearchResults);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusIsError, setStatusIsError] = useState(false);
  const [loadingTrackIdx, setLoadingTrackIdx] = useState<number | null>(null);

  // Manual token input state
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [submittingToken, setSubmittingToken] = useState(false);

  // Downloads tracking
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [downloadedNames, setDownloadedNames] = useState<Set<string>>(new Set());
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const loadDownloaded = async () => {
    try {
      const info = await rpcGetDownloadedInfo();
      if (info) {
        setDownloadedIds(new Set(info.ids || []));
        setDownloadedNames(new Set(info.filenames || []));
      }
    } catch (e) {
      console.error("loadDownloaded error:", e);
    }
  };

  const isDownloaded = (item: Track): boolean => {
    if (item.id && downloadedIds.has(String(item.id))) return true;
    const cleanT = (item.title || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
    const cleanA = (item.artist || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
    const full = cleanA ? `${cleanA} - ${cleanT}` : cleanT;
    return downloadedNames.has(full) || downloadedNames.has(cleanT);
  };

  const handleDownload = async (item: Track) => {
    const tid = String(item.id);
    setDownloadingIds((prev) => new Set(prev).add(tid));
    setStatusIsError(false);
    setStatusMsg(t("downloadingTrack", item.title));
    try {
      const res = await rpcDownloadTrack(item);
      if (res && res.success) {
        setDownloadedIds((prev) => new Set(prev).add(tid));
        const cleanT = (item.title || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
        const cleanA = (item.artist || "").toLowerCase().replace(/[\/\\*?:"<>|]/g, "").trim();
        const full = cleanA ? `${cleanA} - ${cleanT}` : cleanT;
        setDownloadedNames((prev) => new Set(prev).add(full));
        setStatusIsError(false);
        setStatusMsg(t("downloadSuccess", item.title));
        setTimeout(() => setStatusMsg(""), 4000);
      } else {
        setStatusIsError(true);
        setStatusMsg(t("downloadError", res?.error || "Error"));
        setTimeout(() => setStatusMsg(""), 4000);
      }
    } catch (e) {
      console.error("Download exception:", e);
      setStatusIsError(true);
      setStatusMsg(t("downloadError", "Exception"));
      setTimeout(() => setStatusMsg(""), 4000);
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(tid);
        return next;
      });
    }
  };

  const loadStatus = async () => {
    try {
      const s = await rpcVkGetStatus();
      setVkStatus(s);
      if (s.logged_in) {
        if (cachedVkTracks.length === 0) {
          loadMyMusic();
        }
      }
    } catch (e) {
      console.error("VK status error:", e);
    }
  };

  const loadMyMusic = async () => {
    setLoading(true);
    try {
      const res = await rpcVkGetMyMusic(0, 100);
      const list = res || [];
      setTracks(list);
      cachedVkTracks = list;
    } catch (e) {
      console.error("loadMyMusic error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const res = await rpcVkGetPlaylists(0, 50);
      const list = res || [];
      setPlaylists(list);
      cachedVkPlaylists = list;
    } catch (e) {
      console.error("loadPlaylists error:", e);
    } finally {
      setLoading(false);
    }
  };

  const openPlaylist = async (pl: VkPlaylist) => {
    setSelectedPlaylist(pl);
    setActiveView("playlist_tracks");
    setLoading(true);
    try {
      const res = await rpcVkGetPlaylistTracks(pl.id, pl.owner_id, 0, 100);
      setPlaylistTracks(res || []);
    } catch (e) {
      console.error("openPlaylist error:", e);
      setPlaylistTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setLoading(true);
    setActiveView("search");
    cachedVkView = "search";
    cachedVkSearchQuery = q;
    try {
      const res = await rpcVkSearch(q, 0, 50);
      const list = res || [];
      setSearchResults(list);
      cachedVkSearchResults = list;
    } catch (e) {
      console.error("VK search error:", e);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    const raw = manualToken.trim();
    if (!raw) return;
    setSubmittingToken(true);
    setStatusMsg("Проверка токена...");
    setStatusIsError(false);
    try {
      const res = await rpcVkSetToken(raw);
      if (res && res.success) {
        setStatusMsg("Успешный вход!");
        setStatusIsError(false);
        setManualToken("");
        setShowManualInput(false);
        await loadStatus();
        loadMyMusic();
        loadPlaylists();
      } else {
        setStatusMsg(res?.error || "Неверный токен или ссылка");
        setStatusIsError(true);
      }
    } catch (e: any) {
      setStatusMsg("Ошибка авторизации: " + (e?.message || String(e)));
      setStatusIsError(true);
    } finally {
      setSubmittingToken(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await rpcVkLogout();
      setTracks([]);
      setPlaylists([]);
      setSearchResults([]);
      cachedVkTracks = [];
      cachedVkPlaylists = [];
      cachedVkSearchResults = [];
      await loadStatus();
    } catch (e) {
      console.error("VK logout error:", e);
    } finally {
      setLoading(false);
    }
  };

  const openBrowser = async () => {
    if (vkStatus.auth_url) {
      await openExternalAuthUrl(vkStatus.auth_url);
    }
  };
  const handleOpenBrowser = openBrowser;

  const handlePlayTrack = async (targetList: Track[], index: number) => {
    setLoadingTrackIdx(index);
    try {
      await rpcPlayQueue(targetList, index);
      onRefresh();
    } catch (e) {
      console.error("handlePlayTrack error:", e);
    } finally {
      setLoadingTrackIdx(null);
    }
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStatus();
    loadDownloaded();
    const interval = setInterval(async () => {
      // Periodically check if logged in via phone helper or browser session
      if (!vkStatus.logged_in) {
        const s = await rpcVkGetStatus();
        if (s.logged_in) {
          setVkStatus(s);
          loadMyMusic();
          try {
            if (typeof Navigation?.NavigateBack === "function") {
              Navigation.NavigateBack();
            }
            const sc = (window as any).SteamClient;
            if (typeof sc?.Overlay?.CloseOverlay === "function") {
              sc.Overlay.CloseOverlay();
            }
          } catch (e) {}
        }
      }
    }, 800);
    return () => clearInterval(interval);
  }, [vkStatus.logged_in]);

  const currentList =
    activeView === "my_music"
      ? tracks
      : activeView === "playlist_tracks"
      ? playlistTracks
      : searchResults;

  return (
    <div
      style={{
        padding: "16px 20px",
        width: "100%",
        maxWidth: "850px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <PanelSection>
        {/* Status Notification Message */}
        {statusMsg && (
          <PanelSectionRow>
            <div
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: statusIsError ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                border: `1px solid ${statusIsError ? "rgba(239, 68, 68, 0.4)" : "rgba(34, 197, 94, 0.4)"}`,
                color: statusIsError ? "#f87171" : "#4ade80",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span>{statusMsg}</span>
              <DialogButton
                style={{ minWidth: "40px", padding: "4px 8px", fontSize: "11px" }}
                onClick={() => setStatusMsg("")}
              >
                ✕
              </DialogButton>
            </div>
          </PanelSectionRow>
        )}

        {/* NOT LOGGED IN: Authentication View */}
        {!vkStatus.logged_in ? (
          <>
            <PanelSectionRow>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "28px 20px",
                  backgroundColor: "rgba(0, 115, 247, 0.08)",
                  borderRadius: "14px",
                  border: "1px solid rgba(0, 115, 247, 0.25)",
                  width: "100%",
                  boxSizing: "border-box",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "16px",
                    marginBottom: "12px",
                  }}
                >
                  <VkMusicIcon size={48} />
                </div>

                <div style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }}>
                  {t("vkAuthHeader")}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    maxWidth: "500px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-line",
                    marginBottom: "24px",
                  }}
                >
                  {t("vkInstructions")}
                </div>

                <DialogButton
                  className="deckymus-focus-btn"
                  style={{
                    padding: "14px 28px",
                    backgroundColor: "#0073f7",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    fontWeight: 700,
                    fontSize: "14px",
                    borderRadius: "10px",
                    maxWidth: "320px",
                    width: "100%",
                  }}
                  onClick={handleOpenBrowser}
                >
                  <FaExternalLinkAlt size={16} />
                  <span>{t("openInBrowser")}</span>
                </DialogButton>
              </div>
            </PanelSectionRow>
          </>
        ) : (
          /* LOGGED IN: Full VK Music Experience */
          <>
            {/* User Profile Bar */}
            <PanelSectionRow>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: "12px 16px",
                  backgroundColor: "rgba(0, 115, 247, 0.12)",
                  borderRadius: "10px",
                  border: "1px solid rgba(0, 115, 247, 0.25)",
                  width: "100%",
                  boxSizing: "border-box",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                  {vkStatus.avatar ? (
                    <img
                      src={vkStatus.avatar}
                      alt="Avatar"
                      style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: "#0073f7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      VK
                    </div>
                  )}
                  <div style={{ minWidth: 0, overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#f8fafc",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {vkStatus.user_name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      ID: {vkStatus.user_id}
                    </div>
                  </div>
                </div>
              </div>
            </PanelSectionRow>

            {/* Search Input Bar */}
            <PanelSectionRow>
              <Focusable flow-children="row" style={{ display: "flex", gap: "8px", width: "100%", marginBottom: "12px", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    value={searchQuery}
                    onChange={(e: any) => setSearchQuery(e?.target?.value || "")}
                    placeholder={t("searchVkPlaceholder")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />
                </div>
                <DialogButton
                  className="deckymus-focus-btn deckymus-search-btn"
                  style={{
                    width: "40px",
                    minWidth: "40px",
                    height: "40px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    flexShrink: 0,
                  }}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading && activeView === "search" ? (
                    <FaSpinner className="spin" size={14} />
                  ) : (
                    <FaSearch size={14} />
                  )}
                </DialogButton>
              </Focusable>
            </PanelSectionRow>

            {/* Section Switcher Tabs */}
            <PanelSectionRow>
              <Focusable flow-children="row" style={{ display: "flex", gap: "8px", width: "100%", marginBottom: "16px" }}>
                <DialogButton
                  className="deckymus-focus-btn"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: activeView === "my_music" ? "rgba(0, 115, 247, 0.4)" : "rgba(255, 255, 255, 0.05)",
                    border: activeView === "my_music" ? "1px solid #0073f7" : "1px solid transparent",
                    fontWeight: activeView === "my_music" ? 700 : 500,
                  }}
                  onClick={() => {
                    setActiveView("my_music");
                    cachedVkView = "my_music";
                    if (tracks.length === 0) loadMyMusic();
                  }}
                >
                  <FaMusic size={12} style={{ marginRight: "6px" }} />
                  <span>{t("myMusic")}</span>
                </DialogButton>

                <DialogButton
                  className="deckymus-focus-btn"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor:
                      activeView === "playlists" || activeView === "playlist_tracks"
                        ? "rgba(0, 115, 247, 0.4)"
                        : "rgba(255, 255, 255, 0.05)",
                    border:
                      activeView === "playlists" || activeView === "playlist_tracks"
                        ? "1px solid #0073f7"
                        : "1px solid transparent",
                    fontWeight: activeView === "playlists" || activeView === "playlist_tracks" ? 700 : 500,
                  }}
                  onClick={() => {
                    setActiveView("playlists");
                    cachedVkView = "playlists";
                    if (playlists.length === 0) loadPlaylists();
                  }}
                >
                  <FaListUl size={12} style={{ marginRight: "6px" }} />
                  <span>{t("myPlaylists")}</span>
                </DialogButton>

                {searchResults.length > 0 && (
                  <DialogButton
                    className="deckymus-focus-btn"
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      backgroundColor: activeView === "search" ? "rgba(0, 115, 247, 0.4)" : "rgba(255, 255, 255, 0.05)",
                      border: activeView === "search" ? "1px solid #0073f7" : "1px solid transparent",
                      fontWeight: activeView === "search" ? 700 : 500,
                    }}
                    onClick={() => {
                      setActiveView("search");
                      cachedVkView = "search";
                    }}
                  >
                    <FaSearch size={12} style={{ marginRight: "6px" }} />
                    <span>{t("searchResults")}</span>
                  </DialogButton>
                )}
              </Focusable>
            </PanelSectionRow>

            {/* Back button when inside playlist tracks */}
            {activeView === "playlist_tracks" && selectedPlaylist && (
              <PanelSectionRow>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    marginBottom: "12px",
                  }}
                >
                  <DialogButton
                    style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                    onClick={() => setActiveView("playlists")}
                  >
                    <FaArrowLeft size={11} />
                    <span>{t("backToPlaylists")}</span>
                  </DialogButton>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>
                    {selectedPlaylist.title}
                  </span>
                </div>
              </PanelSectionRow>
            )}

            {/* PLAYLISTS VIEW */}
            {activeView === "playlists" && (
              <PanelSectionRow>
                {playlists.length === 0 && !loading ? (
                  <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8", width: "100%" }}>
                    {t("noPlaylistsFound")}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "12px",
                      width: "100%",
                    }}
                  >
                    {playlists.map((pl) => (
                      <div
                        key={`${pl.owner_id}_${pl.id}`}
                        tabIndex={0}
                        className="deckymus-playlist-card"
                        onClick={() => openPlaylist(pl)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") openPlaylist(pl);
                        }}
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "10px",
                          padding: "10px",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          transition: "background-color 0.2s",
                        }}
                      >
                        {pl.cover ? (
                          <img
                            src={pl.cover}
                            alt={pl.title}
                            style={{
                              width: "100%",
                              aspectRatio: "1/1",
                              borderRadius: "8px",
                              objectFit: "cover",
                              marginBottom: "8px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              aspectRatio: "1/1",
                              borderRadius: "8px",
                              backgroundColor: "rgba(0, 115, 247, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: "8px",
                              color: "#0073f7",
                            }}
                          >
                            <FaListUl size={32} />
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#f8fafc",
                            width: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {pl.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                          {t("trackCount", pl.track_count)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PanelSectionRow>
            )}

            {/* TRACKS LIST VIEW (My Music, Search, or Playlist Tracks) */}
            {activeView !== "playlists" && (
              <PanelSectionRow>
                {loading && currentList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", width: "100%" }}>
                    <FaSpinner className="spin" size={24} style={{ marginBottom: "10px" }} />
                    <div>{t("loading")}</div>
                  </div>
                ) : currentList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", width: "100%" }}>
                    {t("noTracksFound")}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", padding: "4px 6px", boxSizing: "border-box" }}>
                    {currentList.map((track, idx) => {
                      const isPlaying =
                        status.playback_status === "Playing" &&
                        status.track?.title === track.title &&
                        status.track?.artist === track.artist;
                      const isCurrentPaused =
                        status.playback_status === "Paused" &&
                        status.track?.title === track.title &&
                        status.track?.artist === track.artist;
                      const downloaded = isDownloaded(track);
                      const downloading = downloadingIds.has(String(track.id));

                      return (
                        <Focusable
                          key={`${track.id || idx}_${track.title}`}
                          flow-children="row"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            width: "100%",
                            boxSizing: "border-box",
                          }}
                        >
                          {/* Track Play Button (Left) */}
                          <Focusable
                            className="deckymus-focus-btn"
                            onActivate={() => {
                              if (isPlaying) {
                                rpcPlayPause().then(onRefresh);
                              } else if (isCurrentPaused) {
                                rpcPlayPause().then(onRefresh);
                              } else {
                                handlePlayTrack(currentList, idx);
                              }
                            }}
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 12px",
                              backgroundColor: isPlaying
                                ? "rgba(0, 115, 247, 0.2)"
                                : "rgba(255, 255, 255, 0.03)",
                              border: isPlaying ? "1px solid #0073f7" : "1px solid rgba(255, 255, 255, 0.06)",
                              borderRadius: "8px",
                              gap: "10px",
                              cursor: "pointer",
                            }}
                          >
                            {/* Play / Pause indicator icon */}
                            <div
                              style={{
                                minWidth: "36px",
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: isPlaying ? "#0073f7" : "rgba(255, 255, 255, 0.1)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {loadingTrackIdx === idx ? (
                                <FaSpinner className="spin" size={12} />
                              ) : isPlaying ? (
                                <FaPause size={12} />
                              ) : (
                                <FaPlay size={12} style={{ marginLeft: "2px" }} />
                              )}
                            </div>

                            {/* Cover art */}
                            {track.art_url ? (
                              <img
                                src={track.art_url}
                                alt={track.title}
                                style={{ width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#94a3b8",
                                  flexShrink: 0,
                                }}
                              >
                                <FaMusic size={14} />
                              </div>
                            )}

                            {/* Track info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: isPlaying ? "#60a5fa" : "#f8fafc",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {track.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#94a3b8",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {track.artist || t("unknownArtist")}
                              </div>
                            </div>

                            {/* Duration */}
                            <div style={{ fontSize: "12px", color: "#64748b", minWidth: "40px", textAlign: "right", flexShrink: 0 }}>
                              {formatDuration(track.duration)}
                            </div>
                          </Focusable>

                          {/* Download Button (Right) */}
                          <DialogButton
                            className="deckymus-focus-btn"
                            style={{
                              minWidth: "36px",
                              width: "36px",
                              height: "44px",
                              padding: "0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "8px",
                              backgroundColor: downloaded
                                ? "rgba(34, 197, 94, 0.2)"
                                : "rgba(255, 255, 255, 0.06)",
                              border: downloaded ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                              color: downloaded ? "#4ade80" : "#cbd5e1",
                              flexShrink: 0,
                            }}
                            disabled={downloading}
                            onClick={() => handleDownload(track)}
                          >
                            {downloading ? (
                              <FaSpinner className="spin" size={12} />
                            ) : downloaded ? (
                              <FaCheck size={12} />
                            ) : (
                              <FaDownload size={12} />
                            )}
                          </DialogButton>
                        </Focusable>
                      );
                    })}
                  </div>
                )}
              </PanelSectionRow>
            )}
          </>
        )}
      </PanelSection>
    </div>
  );
};
