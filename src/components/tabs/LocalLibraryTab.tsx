import { FC, useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  DialogButton,
  TextField,
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
      <PanelSection title={t("localSectionTitle")}>
        {/* Controls row */}
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
                label={t("searchTracksPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div style={{ width: "140px" }}>
              <DialogButton
                disabled={loading}
                onClick={loadTracks}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px 0",
                }}
              >
                <FaSync className={loading ? "spin" : ""} size={12} />
                <span>{loading ? t("searchingBtn") : t("refreshBtn")}</span>
              </DialogButton>
            </div>
          </div>
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
              boxSizing: "border-box",
              overflowX: "hidden",
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
              const isPlaying = status.playback_status === "Playing";
              const isLoadingThis = loadingTrackIdx === idx;
              return (
                <DialogButton
                  key={item.id || item.path || idx}
                  onClick={() => handlePlay(idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    backgroundColor: isCurrent ? "rgba(59, 130, 246, 0.25)" : "rgba(255, 255, 255, 0.04)",
                    border: isCurrent ? "1px solid rgba(59, 130, 246, 0.6)" : "1px solid transparent",
                    textAlign: "left",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                    {/* Cover miniature */}
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
                      {item.art_url ? (
                        <img src={item.art_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <FaMusic size={16} color="#64748b" />
                      )}
                    </div>

                    {/* Title & Artist */}
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: isCurrent ? "#60a5fa" : "#f8fafc",
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
                  </div>

                  {/* Duration & Play icon */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {formatDuration(item.duration)}
                    </span>
                    {isLoadingThis ? (
                      <FaSpinner className="spin" size={12} color="#60a5fa" />
                    ) : isCurrent && isPlaying ? (
                      <FaPause size={11} color="#60a5fa" />
                    ) : (
                      <FaPlay size={11} color={isCurrent ? "#60a5fa" : "#94a3b8"} />
                    )}
                  </div>
                </DialogButton>
              );
            })}
          </div>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};
