import { FC, useState, useEffect, useRef } from "react";
import {
  PanelSection,
  PanelSectionRow,
  DialogButton,
  TextField,
  Focusable,
} from "@decky/ui";
import { FaPlay, FaPause, FaSync, FaMusic, FaSpinner } from "react-icons/fa";
import { Track, PlayerStatus } from "../../types";
import { rpcScanLocalMusic, rpcPlayQueue, rpcPlayPause } from "../../api";
import { useTranslation } from "../../i18n";

interface LocalLibraryTabProps {
  status: PlayerStatus;
  onRefresh: () => void;
}

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const LocalLibraryTab: FC<LocalLibraryTabProps> = ({ status, onRefresh }) => {
  const { t } = useTranslation();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [loadingTrackIdx, setLoadingTrackIdx] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadTracks = async () => {
    setLoading(true);
    try {
      const res = await rpcScanLocalMusic();
      if (Array.isArray(res)) {
        setTracks(res);
      }
    } catch (e) {
      console.error("Failed to load local tracks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const filteredTracks = tracks.filter((t) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.artist && t.artist.toLowerCase().includes(q)) ||
      (t.album && t.album.toLowerCase().includes(q))
    );
  });

  const handlePlay = async (index: number) => {
    const t = filteredTracks[index];
    const isCurrent = (t.path && status.track?.path === t.path) || (t.id && status.track?.id === t.id);
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
      await rpcPlayQueue(filteredTracks, index);
      setTimeout(onRefresh, 300);
    } catch (e) {
      console.error("Play error:", e);
    } finally {
      setTimeout(() => setLoadingTrackIdx(null), 1000);
    }
  };

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
      <PanelSection>
        {/* Controls row */}
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
                onChange={(e: any) => setQuery(e?.target?.value || "")}
                placeholder={t("searchTracksPlaceholder")}
              />
            </div>
            <DialogButton
              className="deckymus-focus-btn"
              disabled={loading}
              onClick={loadTracks}
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
            >
              <FaSync className={loading ? "spin" : ""} size={14} />
            </DialogButton>
          </Focusable>
        </PanelSectionRow>

        {/* Tracks List */}
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
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
              {t("tracksFound", filteredTracks.length)}
            </div>

            {filteredTracks.length === 0 && !loading && (
              <div
                style={{
                  padding: "32px",
                  textAlign: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  color: "#94a3b8",
                }}
              >
                <FaMusic size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                <div>{t("musicNotFound")}</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  {t("musicNotFoundHint")}
                </div>
              </div>
            )}

            {filteredTracks.map((item, idx) => {
              const isCurrent = (item.path && status.track?.path === item.path) || (item.id && status.track?.id === item.id);
              const isPlaying = isCurrent && status.playback_status === "Playing";
              const isCurrentPaused = isCurrent && status.playback_status === "Paused";
              const isLoadingThis = loadingTrackIdx === idx;

              return (
                <Focusable
                  key={item.id || item.path || idx}
                  className="deckymus-focus-btn deckymus-track-row"
                  onActivate={() => {
                    if (isPlaying) {
                      rpcPlayPause().then(onRefresh);
                    } else if (isCurrentPaused) {
                      rpcPlayPause().then(onRefresh);
                    } else {
                      handlePlay(idx);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    backgroundColor: isPlaying
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(255, 255, 255, 0.03)",
                    border: isPlaying ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "8px",
                    gap: "10px",
                    cursor: "pointer",
                  }}
                >
                  {/* Play / Pause button */}
                  <div
                    style={{
                      minWidth: "36px",
                      width: "36px",
                      height: "36px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      backgroundColor: isPlaying ? "#3b82f6" : "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
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

                  {/* Cover miniature */}
                  {item.art_url ? (
                    <img
                      src={item.art_url}
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
                        color: "#94a3b8",
                        flexShrink: 0,
                      }}
                    >
                      <FaMusic size={14} />
                    </div>
                  )}

                  {/* Title & Artist */}
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: isPlaying ? "#60a5fa" : "#f8fafc",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
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
                      {item.artist || t("unknownArtist")}
                    </div>
                  </div>

                  {/* Duration */}
                  <div style={{ fontSize: "12px", color: "#64748b", minWidth: "40px", textAlign: "right", flexShrink: 0 }}>
                    {formatDuration(item.duration)}
                  </div>
                </Focusable>
              );
            })}
          </div>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};
