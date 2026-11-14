import { FC, useState, useEffect, useRef } from "react";
import {
  PanelSection,
  PanelSectionRow,
  DialogButton,
  Focusable,
} from "@decky/ui";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaRandom,
  FaRedo,
  FaMusic,
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
} from "react-icons/fa";
import { PlayerStatus } from "../../types";
import { useTranslation } from "../../i18n";
import {
  rpcPlayPause,
  rpcNextTrack,
  rpcPreviousTrack,
  rpcSeek,
  rpcSetVolume,
  rpcSetRepeat,
  rpcToggleShuffle,
} from "../../api";

interface NowPlayingTabProps {
  status: PlayerStatus;
  onRefresh: () => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const NowPlayingTab: FC<NowPlayingTabProps> = ({ status, onRefresh }) => {
  const { t } = useTranslation();
  const isPlaying = status.playback_status === "Playing";
  const hasTrack = Boolean(status.track && status.track.title);
  const duration = status.duration || status.track?.duration || 0;
  const position = status.position || 0;

  const [volume, setVolume] = useState(status.volume ?? 85);
  const [prevVolume, setPrevVolume] = useState(85);
  const isDraggingVolumeRef = useRef(false);

  useEffect(() => {
    if (!isDraggingVolumeRef.current && typeof status.volume === "number") {
      setVolume(status.volume);
    }
  }, [status.volume]);

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    rpcSetVolume(newVal).catch((e) => console.error("Volume set error:", e));
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      handleVolumeChange(0);
    } else {
      handleVolumeChange(prevVolume > 0 ? prevVolume : 85);
    }
  };

  const handleAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch (e) {
      console.error("Action error:", e);
    } finally {
      setTimeout(onRefresh, 250);
    }
  };

  const handleRepeatCycle = () => {
    const nextMode = status.repeat === "off" ? "all" : status.repeat === "all" ? "one" : "off";
    handleAction(() => rpcSetRepeat(nextMode));
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
        <PanelSectionRow>
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "stretch",
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {/* Left Column: Player Card, Timeline, Controls */}
            <div
              style={{
                flex: "1 1 0%",
                minWidth: 0,
                maxWidth: "calc(100% - 92px)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              {/* Cover and Meta */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  width: "100%",
                  minWidth: 0,
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {status.track?.art_url ? (
                    <img
                      src={status.track.art_url}
                      alt="Cover"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <FaMusic size={50} color="#64748b" />
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    flex: "1 1 0%",
                    minWidth: 0,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  {/* Track Title (supports 2 lines with ellipsis, never overflows) */}
                  <div
                    style={{
                      fontSize: "19px",
                      fontWeight: 700,
                      color: "#f8fafc",
                      lineHeight: "1.25",
                      width: "100%",
                      minWidth: 0,
                      maxWidth: "100%",
                      wordBreak: "break-word",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                    title={status.track?.title}
                  >
                    {status.track?.title || t("noTrackSelected")}
                  </div>

                  {/* Track Artist */}
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#94a3b8",
                      fontWeight: 500,
                      width: "100%",
                      minWidth: 0,
                      maxWidth: "100%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={status.track?.artist}
                  >
                    {status.track?.artist || t("selectSongHint")}
                  </div>

                  {/* Track Album */}
                  {status.track?.album && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        width: "100%",
                        minWidth: 0,
                        maxWidth: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={status.track.album}
                    >
                      {t("albumPrefix")}{status.track.album}
                    </div>
                  )}

                  {/* Source Badge */}
                  <div style={{ marginTop: "4px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        backgroundColor:
                          status.track?.source === "vk"
                            ? "rgba(236, 92, 247, 0.25)"
                            : status.track?.source === "yandex"
                            ? "rgba(234, 179, 8, 0.25)"
                            : status.track?.source === "spotify"
                            ? "rgba(30, 215, 96, 0.25)"
                            : status.track?.source === "ytmusic"
                            ? "rgba(239, 68, 68, 0.25)"
                            : "rgba(59, 130, 246, 0.25)",
                        color:
                          status.track?.source === "vk"
                            ? "#ec5cf7"
                            : status.track?.source === "yandex"
                            ? "#facc15"
                            : status.track?.source === "spotify"
                            ? "#1ed760"
                            : status.track?.source === "ytmusic"
                            ? "#f87171"
                            : "#60a5fa",
                      }}
                    >
                      {status.track?.source === "vk"
                        ? t("sourceVk")
                        : status.track?.source === "yandex"
                        ? t("sourceYandex")
                        : status.track?.source === "spotify"
                        ? t("sourceSpotify")
                        : status.track?.source === "ytmusic"
                        ? t("sourceYtmusic")
                        : status.track?.source === "local"
                        ? t("sourceLocal")
                        : "DeckyMus"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline Slider */}
              {duration > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }}>
                    <span>{formatTime(position)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, duration)}
                    value={Math.min(position, duration)}
                    onChange={(e) => handleAction(() => rpcSeek(Number(e.target.value)))}
                    style={{
                      width: "100%",
                      accentColor: "#3b82f6",
                      cursor: "pointer",
                    }}
                  />
                </div>
              )}

              {/* Playback Controls Row */}
              <Focusable
                flow-children="row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "8px",
                  width: "100%",
                  minWidth: 0,
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
                {/* Shuffle */}
                <DialogButton
                  className="deckymus-ctrl-btn"
                  onClick={() => handleAction(rpcToggleShuffle)}
                  style={{
                    minWidth: 0,
                    padding: "10px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: status.shuffle ? "rgba(59, 130, 246, 0.4)" : undefined,
                  }}
                >
                  <FaRandom size={14} color={status.shuffle ? "#60a5fa" : undefined} />
                </DialogButton>

                {/* Prev */}
                <DialogButton
                  className="deckymus-ctrl-btn"
                  disabled={!hasTrack}
                  onClick={() => handleAction(rpcPreviousTrack)}
                  style={{
                    minWidth: 0,
                    padding: "10px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaBackward size={14} />
                </DialogButton>

                {/* Play/Pause */}
                <DialogButton
                  className="deckymus-ctrl-btn"
                  disabled={!hasTrack}
                  onClick={() => handleAction(rpcPlayPause)}
                  style={{
                    minWidth: 0,
                    padding: "10px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isPlaying ? "rgba(239, 68, 68, 0.4)" : "rgba(34, 197, 94, 0.4)",
                  }}
                >
                  {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                </DialogButton>

                {/* Next */}
                <DialogButton
                  className="deckymus-ctrl-btn"
                  disabled={!hasTrack}
                  onClick={() => handleAction(rpcNextTrack)}
                  style={{
                    minWidth: 0,
                    padding: "10px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaForward size={14} />
                </DialogButton>

                {/* Repeat */}
                <DialogButton
                  className="deckymus-ctrl-btn"
                  onClick={handleRepeatCycle}
                  style={{
                    minWidth: 0,
                    padding: "10px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    backgroundColor: status.repeat !== "off" ? "rgba(59, 130, 246, 0.4)" : undefined,
                  }}
                >
                  <FaRedo size={12} color={status.repeat !== "off" ? "#60a5fa" : undefined} />
                  <span style={{ fontSize: "10px", fontWeight: "bold" }}>
                    {status.repeat === "one" ? t("repeatMode1") : status.repeat === "all" ? t("repeatModeAll") : t("repeatModeOff")}
                  </span>
                </DialogButton>
              </Focusable>
            </div>

            {/* Right Column: Vertical Independent Volume Control */}
            <div
              style={{
                width: "76px",
                minWidth: "76px",
                maxWidth: "76px",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                borderRadius: "12px",
                padding: "16px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                }}
              >
                {t("volLabel")}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#f8fafc",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "center",
                }}
              >
                {Math.round(volume)}%
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 0",
                  width: "100%",
                }}
              >
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onPointerDown={() => {
                    isDraggingVolumeRef.current = true;
                  }}
                  onPointerUp={() => {
                    isDraggingVolumeRef.current = false;
                    onRefresh();
                  }}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  style={{
                    writingMode: "vertical-lr",
                    direction: "rtl",
                    WebkitAppearance: "slider-vertical" as any,
                    height: "170px",
                    width: "28px",
                    accentColor: "#3b82f6",
                    cursor: "pointer",
                  }}
                />
              </div>

              <div
                onClick={toggleMute}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: volume === 0 ? "#ef4444" : "#60a5fa",
                  transition: "background-color 0.1s ease",
                }}
                title={volume === 0 ? t("unmute") : t("mute")}
              >
                {volume === 0 ? (
                  <FaVolumeMute size={16} />
                ) : volume < 50 ? (
                  <FaVolumeDown size={16} />
                ) : (
                  <FaVolumeUp size={16} />
                )}
              </div>
            </div>
          </div>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};
