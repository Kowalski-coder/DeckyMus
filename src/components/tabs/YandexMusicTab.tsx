import { FC, useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  DialogButton,
  TextField,
} from "@decky/ui";
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaListUl,
  FaChartLine,
  FaKey,
  FaSignOutAlt,
  FaSpinner,
  FaDownload,
} from "react-icons/fa";
import { Track, PlayerStatus, YandexStatus, YandexPlaylist } from "../../types";
import {
  rpcYandexGetStatus,
  rpcYandexSetToken,
  rpcYandexGetPlaylists,
  rpcYandexGetPlaylistTracks,
  rpcYandexGetChart,
  rpcPlayQueue,
  rpcPlayPause,
  rpcGetDownloadedInfo,
  rpcDownloadTrack,
} from "../../api";
import { YandexMusicIcon } from "../YandexMusicIcon";
import { useTranslation } from "../../i18n";

interface YandexMusicTabProps {
  status: PlayerStatus;
  onRefresh: () => void;
}

// Module-level persistent cache across tab navigation
let cachedYandexPlaylists: YandexPlaylist[] = [];
let cachedYandexTracks: Track[] = [];
let cachedSelectedPlaylistName = "";
let cachedSelectedPlaylistId = "chart";

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const YandexMusicTab: FC<YandexMusicTabProps> = ({ status, onRefresh }) => {
  const { t } = useTranslation();
  const [yandexStatus, setYandexStatus] = useState<YandexStatus>({ has_token: false, logged_in: false, user_name: "" });
  const [tokenInput, setTokenInput] = useState("");
  const [playlists, setPlaylists] = useState<YandexPlaylist[]>(cachedYandexPlaylists);
  const [tracks, setTracks] = useState<Track[]>(cachedYandexTracks);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(cachedSelectedPlaylistId);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState(cachedSelectedPlaylistName || t("chartTitle"));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusIsError, setStatusIsError] = useState(false);
  const [loadingTrackIdx, setLoadingTrackIdx] = useState<number | null>(null);

  // Download state tracking
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
      const s = await rpcYandexGetStatus();
      setYandexStatus(s);
      if (s.logged_in) {
        loadPlaylists();
      } else if (cachedYandexTracks.length === 0) {
        loadChart();
      }
    } catch (e) {
      console.error("Yandex status error:", e);
    }
  };

  const loadChart = async () => {
    setLoading(true);
    setSelectedPlaylistId("chart");
    cachedSelectedPlaylistId = "chart";
    const chartName = t("chartTitle");
    setSelectedPlaylistName(chartName);
    cachedSelectedPlaylistName = chartName;
    try {
      const res = await rpcYandexGetChart();
      const list = res || [];
      setTracks(list);
      cachedYandexTracks = list;
      loadDownloaded();
    } catch (e) {
      console.error("Chart error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylists = async () => {
    try {
      const pls = await rpcYandexGetPlaylists();
      const pList = pls || [];
      setPlaylists(pList);
      cachedYandexPlaylists = pList;
      if (cachedYandexTracks.length === 0) {
        if (pList.length > 0) {
          loadPlaylistTracks(pList[0].id, pList[0].owner_id || "", pList[0].title);
        } else {
          loadChart();
        }
      }
    } catch (e) {
      console.error("Playlists error:", e);
    }
  };

  const loadPlaylistTracks = async (plId: string, ownerId: string, title: string) => {
    setLoading(true);
    setSelectedPlaylistId(plId);
    cachedSelectedPlaylistId = plId;
    setSelectedPlaylistName(title);
    cachedSelectedPlaylistName = title;
    try {
      const res = await rpcYandexGetPlaylistTracks(plId, ownerId);
      const list = res || [];
      setTracks(list);
      cachedYandexTracks = list;
      loadDownloaded();
    } catch (e) {
      console.error("Playlist tracks error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!tokenInput.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await rpcYandexSetToken(tokenInput.trim());
      if (res && res.success) {
        setTokenInput("");
        setMsg(t("connectedAs", res.user));
        await loadStatus();
      } else {
        setMsg(res?.error || t("downloadError", "Auth error"));
      }
    } catch (e) {
      setMsg(t("downloadError", "Failed to connect"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await rpcYandexSetToken("");
    await loadStatus();
    loadChart();
  };

  const handlePlayTrack = async (index: number) => {
    const t = tracks[index];
    const isCurrent = (t.id && status.track?.id === t.id) || (t.path && status.track?.path === t.path);
    if (isCurrent) {
      try {
        await rpcPlayPause();
        setTimeout(onRefresh, 150);
      } catch (e) {
        console.error("PlayPause error:", e);
      }
      return;
    }

    setLoadingTrackIdx(index);
    try {
      await rpcPlayQueue(tracks, index);
      setTimeout(onRefresh, 300);
    } catch (e) {
      console.error("Play error:", e);
    } finally {
      setTimeout(() => setLoadingTrackIdx(null), 1200);
    }
  };

  useEffect(() => {
    loadStatus();
    loadDownloaded();
  }, []);

  return (
    <div
      style={{
        padding: "16px 20px",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes deckymus-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .deckymus-spin {
          animation: deckymus-spin 1s linear infinite;
        }
      `}</style>

      <PanelSection title={t("yandexSectionTitle")}>
        {/* Account Header */}
        <PanelSectionRow>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderRadius: "8px",
              marginBottom: "12px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <YandexMusicIcon size={24} />
              <div>
                {yandexStatus.logged_in ? (
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#facc15" }}>
                      {t("connectedAs", yandexStatus.user_name)}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {t("playlistsTitle")}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#f8fafc" }}>
                      {t("chartTitle")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {t("authDesc")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {yandexStatus.logged_in && (
              <DialogButton
                onClick={handleLogout}
                style={{ minWidth: 0, padding: "6px 12px", backgroundColor: "rgba(239, 68, 68, 0.2)" }}
              >
                <FaSignOutAlt size={12} color="#f87171" />
              </DialogButton>
            )}
          </div>
        </PanelSectionRow>

        {/* Token Input if not logged in */}
        {!yandexStatus.logged_in && (
          <PanelSectionRow>
            <div style={{ display: "flex", gap: "10px", width: "100%", marginBottom: "16px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <TextField
                  label={t("tokenFieldLabel")}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                />
              </div>
              <div style={{ width: "120px" }}>
                <DialogButton
                  disabled={loading || !tokenInput}
                  onClick={handleLogin}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px 0",
                  }}
                >
                  <FaKey size={12} />
                  <span>{loading ? t("searchingBtn") : t("loginBtn")}</span>
                </DialogButton>
              </div>
            </div>
            {msg && <div style={{ fontSize: "12px", color: "#facc15", marginTop: "4px" }}>{msg}</div>}
          </PanelSectionRow>
        )}

        {/* Download Status Toast / Message */}
        {statusMsg && (
          <PanelSectionRow>
            <div
              style={{
                width: "100%",
                padding: "8px 14px",
                borderRadius: "8px",
                backgroundColor: statusIsError
                  ? "rgba(239, 68, 68, 0.2)"
                  : "rgba(34, 197, 94, 0.2)",
                border: statusIsError
                  ? "1px solid rgba(239, 68, 68, 0.5)"
                  : "1px solid rgba(34, 197, 94, 0.5)",
                color: statusIsError ? "#fca5a5" : "#86efac",
                fontSize: "13px",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              {statusMsg}
            </div>
          </PanelSectionRow>
        )}

        {/* Playlist Selector Buttons */}
        <PanelSectionRow>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", width: "100%" }}>
            <DialogButton
              onClick={loadChart}
              style={{
                minWidth: "auto",
                whiteSpace: "nowrap",
                padding: "6px 12px",
                backgroundColor: selectedPlaylistId === "chart" ? "#facc15" : undefined,
                color: selectedPlaylistId === "chart" ? "#000" : undefined,
              }}
            >
              <FaChartLine size={12} style={{ marginRight: "6px" }} />
              {t("chartTitle")}
            </DialogButton>

            {playlists.map((pl) => (
              <DialogButton
                key={pl.id}
                onClick={() => loadPlaylistTracks(pl.id, pl.owner_id || "", pl.title)}
                style={{
                  minWidth: "auto",
                  whiteSpace: "nowrap",
                  padding: "6px 12px",
                  backgroundColor: selectedPlaylistId === pl.id ? "#facc15" : undefined,
                  color: selectedPlaylistId === pl.id ? "#000" : undefined,
                }}
              >
                {pl.id === "likes" ? (
                  <FaHeart size={12} style={{ marginRight: "6px" }} />
                ) : (
                  <FaListUl size={12} style={{ marginRight: "6px" }} />
                )}
                {pl.title} ({pl.track_count})
              </DialogButton>
            ))}
          </div>
        </PanelSectionRow>

        {/* Tracks List */}
        <PanelSectionRow>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#f8fafc", marginBottom: "6px" }}>
              {selectedPlaylistId === "chart" ? t("chartTitle") : selectedPlaylistName} ({tracks.length})
            </div>

            {loading && (
              <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                {t("loadingTracks")}
              </div>
            )}

            {!loading && tracks.map((t, idx) => {
              const isCurrent = (t.id && status.track?.id === t.id) || (t.path && status.track?.path === t.path);
              const isPlaying = status.playback_status === "Playing";
              const isLoadingThis = loadingTrackIdx === idx;
              const isDown = isDownloaded(t);
              const isDowning = downloadingIds.has(String(t.id));

              return (
                <div
                  key={t.id || idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    marginBottom: "4px",
                    overflow: "hidden",
                  }}
                >
                  {/* Track Play Button */}
                  <DialogButton
                    onClick={() => handlePlayTrack(idx)}
                    style={{
                      flex: "1 1 0%",
                      minWidth: 0,
                      maxWidth: !isDown ? "calc(100% - 44px)" : "100%",
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: isCurrent ? "rgba(250, 204, 21, 0.25)" : "rgba(255, 255, 255, 0.04)",
                      border: isCurrent ? "1px solid rgba(250, 204, 21, 0.6)" : "1px solid transparent",
                      textAlign: "left",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        minWidth: 0,
                        flex: "1 1 0%",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          backgroundColor: "rgba(0, 0, 0, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {t.art_url ? (
                          <img src={t.art_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <YandexMusicIcon size={20} />
                        )}
                      </div>

                      <div style={{ flex: "1 1 0%", minWidth: 0, overflow: "hidden" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: isCurrent ? "#facc15" : "#f8fafc",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.title}
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
                          {t.artist}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        {formatDuration(t.duration)}
                      </span>
                      {isLoadingThis ? (
                        <FaSpinner className="deckymus-spin" size={12} color="#facc15" />
                      ) : isCurrent && isPlaying ? (
                        <FaPause size={11} color="#facc15" />
                      ) : (
                        <FaPlay size={11} color={isCurrent ? "#facc15" : "#94a3b8"} />
                      )}
                    </div>
                  </DialogButton>

                  {/* Download Button (Only visible if track is NOT yet downloaded) */}
                  {!isDown && (
                    <DialogButton
                      disabled={isDowning}
                      onClick={() => handleDownload(t)}
                      style={{
                        minWidth: "38px",
                        maxWidth: "38px",
                        width: "38px",
                        height: "38px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isDowning ? "rgba(59, 130, 246, 0.35)" : "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "6px",
                        flexShrink: 0,
                        boxSizing: "border-box",
                      }}
                    >
                      {isDowning ? (
                        <FaSpinner className="deckymus-spin" size={13} color="#60a5fa" />
                      ) : (
                        <FaDownload size={12} color="#94a3b8" />
                      )}
                    </DialogButton>
                  )}
                </div>
              );
            })}
          </div>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};
