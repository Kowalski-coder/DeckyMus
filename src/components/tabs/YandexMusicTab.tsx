import { FC, useState, useEffect } from "react";
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
  FaHeart,
  FaListUl,
  FaChartLine,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaSpinner,
  FaDownload,
  FaCheck,
  FaSync,
} from "react-icons/fa";
import { Track, PlayerStatus, YandexStatus, YandexPlaylist } from "../../types";
import {
  rpcYandexGetStatus,
  rpcYandexStartAuth,
  rpcYandexSetToken,
  rpcYandexGetPlaylists,
  rpcYandexGetPlaylistTracks,
  rpcYandexGetChart,
  rpcPlayQueue,
  rpcPlayPause,
  rpcGetDownloadedInfo,
  rpcDownloadTrack,
} from "../../api";
import { openExternalAuthUrl } from "../../utils/browser";
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
  const [playlists, setPlaylists] = useState<YandexPlaylist[]>(cachedYandexPlaylists);
  const [tracks, setTracks] = useState<Track[]>(cachedYandexTracks);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(cachedSelectedPlaylistId);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState(cachedSelectedPlaylistName || t("chartTitle"));
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusIsError, setStatusIsError] = useState(false);
  const [loadingTrackIdx, setLoadingTrackIdx] = useState<number | null>(null);
  const [tokenInput, setTokenInput] = useState("");

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

  const openBrowser = async () => {
    if (yandexStatus.auth_url) {
      await openExternalAuthUrl(yandexStatus.auth_url);
    }
  };
  const handleOpenBrowser = openBrowser;

  const handleRefreshCode = async () => {
    setLoading(true);
    try {
      const res = await rpcYandexStartAuth(true);
      if (res && res.success) {
        setYandexStatus((prev) => ({
          ...prev,
          user_code: res.user_code || "",
          auth_url: res.auth_url || "",
          qr_svg: res.qr_svg || "",
        }));
      }
    } catch (e) {
      console.error("Refresh Yandex code error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToken = async () => {
    let tVal = tokenInput.trim();
    const m = tVal.match(/access_token[=:]+([^&\s#"']+)/);
    if (m) tVal = m[1];
    if (!tVal) return;
    setLoading(true);
    try {
      const res = await rpcYandexSetToken(tVal);
      if (res && res.success) {
        setTokenInput("");
        await loadStatus();
      } else {
        setStatusIsError(true);
        setStatusMsg(res?.error || "Не удалось сохранить токен");
        setTimeout(() => setStatusMsg(""), 4000);
      }
    } catch (e) {
      console.error("Save Yandex token error:", e);
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
    const interval = setInterval(async () => {
      if (!yandexStatus.logged_in) {
        const s = await rpcYandexGetStatus();
        if (s.logged_in) {
          setYandexStatus(s);
          loadPlaylists();
          try {
            if (typeof Navigation?.NavigateBack === "function") {
              Navigation.NavigateBack();
            }
            const sc = (window as any).SteamClient;
            if (typeof sc?.Overlay?.CloseOverlay === "function") {
              sc.Overlay.CloseOverlay();
            }
          } catch (e) {}
        } else if (s.user_code && s.user_code !== yandexStatus.user_code) {
          setYandexStatus(s);
        }
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [yandexStatus.logged_in]);

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

        {/* Account Header (Logged In Only) */}
        {yandexStatus.logged_in && (
          <PanelSectionRow>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                backgroundColor: "rgba(250, 204, 21, 0.12)",
                borderRadius: "10px",
                border: "1px solid rgba(250, 204, 21, 0.25)",
                width: "100%",
                boxSizing: "border-box",
                marginBottom: "14px",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                {yandexStatus.avatar ? (
                  <img
                    src={yandexStatus.avatar}
                    alt="Avatar"
                    style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#facc15",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#000",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    Я
                  </div>
                )}
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#f8fafc",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {yandexStatus.user_name}
                  </div>
                  {yandexStatus.user_id && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      ID: {yandexStatus.user_id}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PanelSectionRow>
        )}

        {/* Auth Container with Browser Button, QR Code, and Manual Token Input (Cassette method) */}
        {!yandexStatus.logged_in && (
          <PanelSectionRow>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "28px 16px",
                textAlign: "center",
                background: "linear-gradient(180deg, rgba(250, 204, 21, 0.15) 0%, rgba(18, 18, 18, 0.4) 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(250, 204, 21, 0.3)",
                margin: "8px 0 16px 0",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ marginBottom: "14px" }}>
                <YandexMusicIcon size={56} />
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#f8fafc", marginBottom: "8px" }}>
                {t("yandexAuthHeader")}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  maxWidth: "460px",
                  lineHeight: "1.5",
                  marginBottom: "20px",
                  whiteSpace: "pre-line",
                }}
              >
                {t("yandexInstructions")}
              </div>

              {/* Main Actions: Browser Button & QR Code */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                  marginBottom: "20px",
                  width: "100%",
                }}
              >
                {/* QR Code Container */}
                {yandexStatus.qr_svg && (
                  <div
                    style={{
                      width: "150px",
                      height: "150px",
                      backgroundColor: "#ffffff",
                      padding: "8px",
                      borderRadius: "12px",
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: yandexStatus.qr_svg }}
                      style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                    />
                  </div>
                )}

                {/* Right side: Browser Button */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "200px", alignItems: "center" }}>
                  <DialogButton
                    className="deckymus-focus-btn"
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      backgroundColor: "#facc15",
                      color: "#000000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontWeight: 700,
                      borderRadius: "10px",
                      fontSize: "14px",
                    }}
                    onClick={handleOpenBrowser}
                  >
                    <FaExternalLinkAlt size={15} />
                    <span>{t("openInBrowser")}</span>
                  </DialogButton>
                  <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                    {t("scanQrWithPhone")}
                  </div>
                </div>
              </div>

              {/* Manual Token Input (Cassette method) */}
              <div style={{ width: "100%", maxWidth: "460px", marginTop: "8px" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "6px", textAlign: "left" }}>
                  {t("pasteTokenOrUrl")}
                </div>
                <Focusable flow-children="row" style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                  <div style={{ flex: 1 }}>
                    <TextField
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder={t("tokenFieldPlaceholder") || "access_token или ссылка"}
                    />
                  </div>
                  <DialogButton
                    className="deckymus-focus-btn"
                    style={{
                      minWidth: "40px",
                      width: "40px",
                      height: "40px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#22c55e",
                      color: "#ffffff",
                      borderRadius: "8px",
                      flexShrink: 0,
                    }}
                    onClick={handleSaveToken}
                  >
                    <FaCheck size={14} />
                  </DialogButton>
                </Focusable>
              </div>
            </div>
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
          <Focusable flow-children="row" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", width: "100%" }}>
            <DialogButton
              className="deckymus-focus-btn"
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
                className="deckymus-focus-btn"
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
          </Focusable>
        </PanelSectionRow>

        {/* Tracks List */}
        <PanelSectionRow>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px", padding: "4px 6px", boxSizing: "border-box" }}>
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
              const isPlaying = isCurrent && status.playback_status === "Playing";
              const isCurrentPaused = isCurrent && status.playback_status === "Paused";
              const isLoadingThis = loadingTrackIdx === idx;
              const isDown = isDownloaded(t);
              const isDowning = downloadingIds.has(String(t.id));

              return (
                <Focusable
                  key={t.id || idx}
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
                        handlePlayTrack(idx);
                      }
                    }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      backgroundColor: isPlaying
                        ? "rgba(250, 204, 21, 0.2)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: isPlaying ? "1px solid #facc15" : "1px solid rgba(255, 255, 255, 0.06)",
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
                        backgroundColor: isPlaying ? "#facc15" : "rgba(255, 255, 255, 0.1)",
                        color: isPlaying ? "#000" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isLoadingThis ? (
                        <FaSpinner className="spin" size={12} />
                      ) : isPlaying ? (
                        <FaPause size={12} />
                      ) : (
                        <FaPlay size={12} style={{ marginLeft: "2px" }} />
                      )}
                    </div>

                    {/* Cover */}
                    {t.art_url ? (
                      <img
                        src={t.art_url}
                        alt=""
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
                          color: "#facc15",
                          flexShrink: 0,
                        }}
                      >
                        <YandexMusicIcon size={20} />
                      </div>
                    )}

                    {/* Metadata */}
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: isPlaying ? "#facc15" : "#f8fafc",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t.title}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t.artist}
                      </div>
                    </div>

                    {/* Duration */}
                    <div style={{ fontSize: "12px", color: "#64748b", minWidth: "40px", textAlign: "right", flexShrink: 0 }}>
                      {formatDuration(t.duration)}
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
                      backgroundColor: isDown
                        ? "rgba(34, 197, 94, 0.2)"
                        : "rgba(255, 255, 255, 0.06)",
                      border: isDown ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                      color: isDown ? "#4ade80" : "#cbd5e1",
                      flexShrink: 0,
                    }}
                    disabled={isDowning}
                    onClick={() => handleDownload(t)}
                  >
                    {isDowning ? (
                      <FaSpinner className="spin" size={12} />
                    ) : isDown ? (
                      <FaCheck size={12} />
                    ) : (
                      <FaDownload size={12} />
                    )}
                  </DialogButton>
                </Focusable>
              );
            })}
          </div>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};
