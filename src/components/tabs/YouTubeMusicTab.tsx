import { FC, useState, useEffect, useRef } from "react";
import {
  PanelSection,
  PanelSectionRow,
  DialogButton,
  TextField,
  Focusable,
} from "@decky/ui";
import { FaPlay, FaPause, FaSearch, FaYoutube, FaSpinner, FaDownload, FaCheck } from "react-icons/fa";
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
  const searchInputRef = useRef<HTMLInputElement>(null);

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

      <PanelSection>
        {/* Search Bar */}
        <PanelSectionRow>
          <Focusable
            flow-children="row"
            style={{
              display: "flex",
              gap: "8px",
              width: "100%",
              marginBottom: "12px",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <TextField
                value={query}
                onChange={(e: any) => {
                  const val = e?.target?.value || "";
                  setQuery(val);
                  cachedQuery = val;
                }}
                placeholder={t("ytSearchPlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
            <DialogButton
              className="deckymus-focus-btn deckymus-search-btn"
              disabled={loading || !query.trim()}
              onClick={handleSearch}
              style={{
                width: "40px",
                minWidth: "40px",
                height: "40px",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                backgroundColor: "rgba(239, 68, 68, 0.3)",
                flexShrink: 0,
              }}
            >
              {loading ? (
                <FaSpinner className="spin" size={14} />
              ) : (
                <FaSearch size={14} />
              )}
            </DialogButton>
          </Focusable>
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
              padding: "4px 6px",
              boxSizing: "border-box",
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
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: isPlaying ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.06)",
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
                        backgroundColor: isPlaying ? "#ef4444" : "rgba(255, 255, 255, 0.1)",
                        color: "#fff",
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

                    {/* Thumbnail */}
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
                          color: "#ef4444",
                          flexShrink: 0,
                        }}
                      >
                        <FaYoutube size={18} />
                      </div>
                    )}

                    {/* Metadata */}
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: isPlaying ? "#f87171" : "#f8fafc",
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
