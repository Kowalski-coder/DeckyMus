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
  FaHeart,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";
import { Track, PlayerStatus, SpotifyStatus, SpotifyPlaylist } from "../../types";
import {
  rpcSpotifyGetStatus,
  rpcSpotifyLogout,
  rpcSpotifyGetPlaylists,
  rpcSpotifyGetPlaylistTracks,
  rpcSpotifyGetLikedTracks,
  rpcSpotifySearch,
  rpcPlayQueue,
  rpcPlayPause,
  rpcGetDownloadedInfo,
  rpcDownloadTrack,
} from "../../api";
import { openExternalAuthUrl } from "../../utils/browser";
import { SpotifyIcon } from "../SpotifyIcon";
import { useTranslation } from "../../i18n";

interface SpotifyTabProps {
  status: PlayerStatus;
  onRefresh: () => void;
}

// Persistent caches
let cachedSpotifyLiked: Track[] = [];
let cachedSpotifyPlaylists: SpotifyPlaylist[] = [];
let cachedSpotifyView: "liked" | "playlists" | "search" = "liked";
let cachedSpotifySearchQuery = "";
let cachedSpotifySearchResults: Track[] = [];

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const SpotifyTab: FC<SpotifyTabProps> = ({ status, onRefresh }) => {
  const { t } = useTranslation();
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyStatus>({
    has_token: false,
    logged_in: false,
    user_name: "",
  });


  const [activeView, setActiveView] = useState<"liked" | "playlists" | "playlist_tracks" | "search">(
    cachedSpotifyView
  );
  const [likedTracks, setLikedTracks] = useState<Track[]>(cachedSpotifyLiked);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>(cachedSpotifyPlaylists);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState(cachedSpotifySearchQuery);
  const [searchResults, setSearchResults] = useState<Track[]>(cachedSpotifySearchResults);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusIsError, setStatusIsError] = useState(false);
  const [loadingTrackIdx, setLoadingTrackIdx] = useState<number | null>(null);

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
      const s = await rpcSpotifyGetStatus();
      setSpotifyStatus(s);
      if (s.logged_in) {
        if (cachedSpotifyLiked.length === 0) {
          loadLikedTracks();
        }
      }
    } catch (e) {
      console.error("Spotify status error:", e);
    }
  };

  const loadLikedTracks = async () => {
    setLoading(true);
    try {
      const res = await rpcSpotifyGetLikedTracks(0, 50);
      const list = res || [];
      setLikedTracks(list);
      cachedSpotifyLiked = list;
    } catch (e) {
      console.error("loadLikedTracks error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const res = await rpcSpotifyGetPlaylists(0, 50);
      const list = res || [];
      setPlaylists(list);
      cachedSpotifyPlaylists = list;
    } catch (e) {
      console.error("loadPlaylists error:", e);
    } finally {
      setLoading(false);
    }
  };

  const openPlaylist = async (pl: SpotifyPlaylist) => {
    setSelectedPlaylist(pl);
    setActiveView("playlist_tracks");
    setLoading(true);
    try {
      const res = await rpcSpotifyGetPlaylistTracks(pl.id, 0, 100);
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
    cachedSpotifyView = "search";
    cachedSpotifySearchQuery = q;
    try {
      const res = await rpcSpotifySearch(q, 0, 50);
      const list = res || [];
      setSearchResults(list);
      cachedSpotifySearchResults = list;
    } catch (e) {
      console.error("Spotify search error:", e);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await rpcSpotifyLogout();
      setLikedTracks([]);
      setPlaylists([]);
      setSearchResults([]);
      cachedSpotifyLiked = [];
      cachedSpotifyPlaylists = [];
      cachedSpotifySearchResults = [];
      await loadStatus();
    } catch (e) {
      console.error("Spotify logout error:", e);
    } finally {
      setLoading(false);
    }
  };

  const openBrowser = async () => {
    if (spotifyStatus.auth_url) {
      await openExternalAuthUrl(spotifyStatus.auth_url);
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
      if (!spotifyStatus.logged_in) {
        const s = await rpcSpotifyGetStatus();
        if (s.logged_in) {
          setSpotifyStatus(s);
          loadLikedTracks();
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
    }, 1200);
    return () => clearInterval(interval);
  }, [spotifyStatus.logged_in]);

  const currentList =
    activeView === "liked"
      ? likedTracks
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
        {/* Beta Notice Banner */}
        <PanelSectionRow>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 14px",
              backgroundColor: "rgba(234, 179, 8, 0.12)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              borderRadius: "8px",
              marginBottom: "12px",
              fontSize: "12px",
              color: "#fef08a",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                backgroundColor: "#eab308",
                color: "#000000",
                fontWeight: 700,
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "4px",
                letterSpacing: "0.5px",
                flexShrink: 0,
              }}
            >
              BETA
            </span>
            <span>{t("betaNotice")}</span>
          </div>
        </PanelSectionRow>

        {/* Status Notification Message */}
        {statusMsg && (
          <PanelSectionRow>
            <div
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: statusIsError ? "rgba(239, 68, 68, 0.2)" : "rgba(30, 215, 96, 0.2)",
                border: `1px solid ${statusIsError ? "rgba(239, 68, 68, 0.4)" : "rgba(30, 215, 96, 0.4)"}`,
                color: statusIsError ? "#f87171" : "#1ed760",
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
        {!spotifyStatus.logged_in ? (
          <>
            <PanelSectionRow>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "24px 20px",
                  backgroundColor: "rgba(30, 215, 96, 0.08)",
                  borderRadius: "14px",
                  border: "1px solid rgba(30, 215, 96, 0.25)",
                  width: "100%",
                  boxSizing: "border-box",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                {/* Authentic Spotify Icon with transparent cutout holes */}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "transparent",
                    marginBottom: "12px",
                  }}
                >
                  <SpotifyIcon size={56} />
                </div>

                <div style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }}>
                  {t("spotifyAuthHeader")}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    maxWidth: "500px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-line",
                    marginBottom: "20px",
                  }}
                >
                  {t("spotifyInstructions")}
                </div>

                {/* QR Code and Web Opener */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "24px",
                    marginBottom: "20px",
                    width: "100%",
                  }}
                >
                  {/* QR Code Container */}
                  {spotifyStatus.qr_svg && (
                    <div
                      style={{
                        width: "170px",
                        height: "170px",
                        backgroundColor: "#ffffff",
                        padding: "10px",
                        borderRadius: "14px",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: spotifyStatus.qr_svg }}
                        style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                      />
                    </div>
                  )}

                  {/* Browser Button */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }}>
                    <DialogButton
                      className="deckymus-focus-btn"
                      style={{
                        padding: "12px 18px",
                        backgroundColor: "#1ed760",
                        color: "#000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        fontWeight: 700,
                        borderRadius: "8px",
                      }}
                      onClick={handleOpenBrowser}
                    >
                      <FaExternalLinkAlt size={14} />
                      <span>{t("openInBrowser")}</span>
                    </DialogButton>
                  </div>
                </div>
              </div>
            </PanelSectionRow>
          </>
        ) : (
          /* LOGGED IN: Full Spotify Experience */
          <>
            {/* User Profile Bar */}
            <PanelSectionRow>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  backgroundColor: "rgba(30, 215, 96, 0.12)",
                  borderRadius: "10px",
                  border: "1px solid rgba(30, 215, 96, 0.3)",
                  width: "100%",
                  boxSizing: "border-box",
                  marginBottom: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                  {spotifyStatus.avatar ? (
                    <img
                      src={spotifyStatus.avatar}
                      alt="Avatar"
                      style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <SpotifyIcon size={28} />
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
                      {spotifyStatus.user_name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#1ed760",
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Spotify {spotifyStatus.product || "Connected"}
                    </div>
                  </div>
                </div>
              </div>
            </PanelSectionRow>

            {/* Search Bar */}
            <PanelSectionRow>
              <Focusable flow-children="row" style={{ display: "flex", gap: "8px", width: "100%", marginBottom: "12px", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    value={searchQuery}
                    onChange={(e: any) => setSearchQuery(e?.target?.value || "")}
                    placeholder={t("searchSpotifyPlaceholder")}
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
                    backgroundColor: activeView === "liked" ? "rgba(30, 215, 96, 0.3)" : "rgba(255, 255, 255, 0.05)",
                    border: activeView === "liked" ? "1px solid #1ed760" : "1px solid transparent",
                    fontWeight: activeView === "liked" ? 700 : 500,
                  }}
                  onClick={() => {
                    setActiveView("liked");
                    cachedSpotifyView = "liked";
                    if (likedTracks.length === 0) loadLikedTracks();
                  }}
                >
                  <FaHeart size={12} style={{ marginRight: "6px", color: "#1ed760" }} />
                  <span>{t("likedTracks")}</span>
                </DialogButton>

                <DialogButton
                  className="deckymus-focus-btn"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor:
                      activeView === "playlists" || activeView === "playlist_tracks"
                        ? "rgba(30, 215, 96, 0.3)"
                        : "rgba(255, 255, 255, 0.05)",
                    border:
                      activeView === "playlists" || activeView === "playlist_tracks"
                        ? "1px solid #1ed760"
                        : "1px solid transparent",
                    fontWeight: activeView === "playlists" || activeView === "playlist_tracks" ? 700 : 500,
                  }}
                  onClick={() => {
                    setActiveView("playlists");
                    cachedSpotifyView = "playlists";
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
                      backgroundColor: activeView === "search" ? "rgba(30, 215, 96, 0.3)" : "rgba(255, 255, 255, 0.05)",
                      border: activeView === "search" ? "1px solid #1ed760" : "1px solid transparent",
                      fontWeight: activeView === "search" ? 700 : 500,
                    }}
                    onClick={() => {
                      setActiveView("search");
                      cachedSpotifyView = "search";
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
                        key={pl.id}
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
                              backgroundColor: "rgba(30, 215, 96, 0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <SpotifyIcon size={36} />
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

            {/* TRACKS LIST VIEW (Liked Songs, Search, or Playlist Tracks) */}
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
                                ? "rgba(30, 215, 96, 0.18)"
                                : "rgba(255, 255, 255, 0.03)",
                              border: isPlaying ? "1px solid #1ed760" : "1px solid rgba(255, 255, 255, 0.06)",
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
                                backgroundColor: isPlaying ? "#1ed760" : "rgba(255, 255, 255, 0.1)",
                                color: isPlaying ? "#000" : "#fff",
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
                                  flexShrink: 0,
                                }}
                              >
                                <SpotifyIcon size={20} />
                              </div>
                            )}

                            {/* Track info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: isPlaying ? "#1ed760" : "#f8fafc",
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
