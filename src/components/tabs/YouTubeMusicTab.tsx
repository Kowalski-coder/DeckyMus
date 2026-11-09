import { FC, useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  DialogButton,
  TextField,
} from "@decky/ui";
import { FaPlay, FaPause, FaSearch, FaYoutube, FaSpinner, FaDownload } from "react-icons/fa";
import { Track, PlayerStatus } from "../../types";
import { useTranslation } from "../../i18n";
import {
  rpcYtSearch,
  rpcPlayQueue,
  rpcGetDownloadedInfo,
  rpcDownloadTrack,
  rpcPlayPause,
} from "../../api";

interface YouTubeMusicTabProps {
  status: PlayerStatus;
  onRefresh: () => void;
}

// Module-level persistent cache across tab navigation
let cachedQuery = "";
let cachedTracks: Track[] = [];
let cachedHasSearched = false;

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const YouTubeMusicTab: FC<YouTubeMusicTabProps> = ({ status, onRefresh }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(cachedQuery);
  const [tracks, setTracks] = useState<Track[]>(cachedTracks);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(cachedHasSearched);
  const [loadingTrackIdx, setLoadingTrackIdx] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusIsError, setStatusIsError] = useState(false);

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

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    cachedQuery = query;
    cachedHasSearched = true;
    try {
      const res = await rpcYtSearch(query.trim());
      const list = res || [];
      setTracks(list);
      cachedTracks = list;
      loadDownloaded();
    } catch (e) {
      console.error("YT search error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (index: number) => {
    const t = tracks[index];
    const isCurrent = status.track?.id === t.id;
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
      setTimeout(() => setLoadingTrackIdx(null), 1500);
    }
  };

  useEffect(() => {
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

      <PanelSection title={t("ytSectionTitle")}>
        {/* Search Bar */}
        <PanelSectionRow>
          <div
            style={{
              display: "flex",
              gap: "10px",
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
              boxSizing: "border-box",
              marginBottom: "12px",
              alignItems: "center",
            }}
          >
            <div style={{ flex: "1 1 0%", minWidth: 0 }}>
              <TextField
                label={t("ytSearchPlaceholder")}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  cachedQuery = e.target.value;
                }}
              />
            </div>
            <div style={{ width: "120px", flexShrink: 0 }}>
              <DialogButton
                disabled={loading || !query.trim()}
                onClick={handleSearch}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px 0",
                  backgroundColor: "rgba(239, 68, 68, 0.3)",
                }}
              >
                <FaSearch size={12} />
                <span>{loading ? t("searchingBtn") : t("searchBtn")}</span>
              </DialogButton>
            </div>
          </div>
        </PanelSectionRow>

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

        {/* Results List */}
        <PanelSectionRow>
          <div
            style={{
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              boxSizing: "border-box",
              overflowX: "hidden",
            }}
          >
            {loading && (
              <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                {t("ytSearching")}
              </div>
            )}

            {!loading && hasSearched && tracks.length === 0 && (
              <div
                style={{
                  padding: "32px",
                  textAlign: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  color: "#94a3b8",
                }}
              >
                {t("nothingFound")}
              </div>
            )}

            {!loading && !hasSearched && (
              <div
                style={{
                  padding: "32px",
                  textAlign: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  color: "#94a3b8",
                }}
              >
                <FaYoutube size={36} color="#ef4444" style={{ marginBottom: "8px", opacity: 0.8 }} />
                <div>{t("ytEnterQueryHint")}</div>
              </div>
            )}

            {!loading && tracks.map((t, idx) => {
              const isCurrent = status.track?.id === t.id;
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
                      backgroundColor: isCurrent ? "rgba(239, 68, 68, 0.25)" : "rgba(255, 255, 255, 0.04)",
                      border: isCurrent ? "1px solid rgba(239, 68, 68, 0.6)" : "1px solid transparent",
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
                      {/* Thumbnail */}
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
                          <FaYoutube size={20} color="#ef4444" />
                        )}
                      </div>

                      {/* Metadata */}
                      <div style={{ flex: "1 1 0%", minWidth: 0, overflow: "hidden" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: isCurrent ? "#f87171" : "#f8fafc",
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

                    {/* Duration and Play status */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        {formatDuration(t.duration)}
                      </span>
                      {isLoadingThis ? (
                        <FaSpinner className="deckymus-spin" size={12} color="#f87171" />
                      ) : isCurrent && isPlaying ? (
                        <FaPause size={11} color="#f87171" />
                      ) : (
                        <FaPlay size={11} color={isCurrent ? "#f87171" : "#94a3b8"} />
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
