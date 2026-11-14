import { FC, useState, useRef, useEffect } from "react";
import {
  PanelSectionRow,
  DialogButton,
  Navigation,
  Focusable,
} from "@decky/ui";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaMusic,
  FaExpandAlt,
  FaRandom,
  FaRedo,
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
} from "react-icons/fa";
import { PlayerStatus } from "../types";
import { useTranslation } from "../i18n";
import {
  rpcPlayPause,
  rpcNextTrack,
  rpcPreviousTrack,
  rpcToggleShuffle,
  rpcSetRepeat,
  rpcSetVolume,
} from "../api";

interface QAMPlayerViewProps {
  status: PlayerStatus;
  onRefresh: () => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const QAMPlayerView: FC<QAMPlayerViewProps> = ({ status, onRefresh }) => {
  const { t } = useTranslation();
  const busyRef = useRef(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
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
  const isPlaying = status.playback_status === "Playing";
  const hasTrack = Boolean(status.track && status.track.title);
  const duration = status.duration || status.track?.duration || 0;
  const position = status.position || 0;
  const pct = duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

  const handleAction = async (key: string, action: () => Promise<unknown>, e?: any) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPressedKey(key);
    try {
      await action();
    } catch (err) {
      console.error("DeckyMus action error:", err);
    } finally {
      setTimeout(() => {
        onRefresh();
        setPressedKey(null);
        busyRef.current = false;
      }, 150);
    }
  };

  const handleRepeatCycle = (e?: any) => {
    const nextMode = status.repeat === "off" ? "all" : status.repeat === "all" ? "one" : "off";
    handleAction("repeat", () => rpcSetRepeat(nextMode), e);
  };

  const handleOpenFullscreen = (e?: any) => {
    setPressedKey("open");
    try {
      if (typeof Navigation.CloseSideMenus === "function") {
        Navigation.CloseSideMenus();
      }
      Navigation.Navigate("/deckymus");
    } catch (err) {
      console.warn("Navigation error:", err);
    }
    setTimeout(() => {
      setPressedKey(null);
    }, 120);
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <style>{`
        .deckymus-qam-btn {
          transition: transform 0.1s ease, filter 0.1s ease, box-shadow 0.1s ease, outline 0.1s ease !important;
          box-sizing: border-box !important;
        }
        .deckymus-qam-btn:focus,
        .deckymus-qam-btn:focus-visible,
        .deckymus-qam-btn.focused,
        .deckymus-qam-btn[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.9), inset 0 0 4px rgba(255, 255, 255, 0.4) !important;
          transform: scale(1.05) !important;
          filter: brightness(1.25) !important;
          z-index: 5 !important;
        }
        .deckymus-open-btn {
          transition: transform 0.1s ease, filter 0.1s ease, box-shadow 0.1s ease, outline 0.1s ease !important;
        }
        .deckymus-open-btn,
        .deckymus-open-btn *,
        .deckymus-open-btn:active {
          color: #ffffff !important;
          opacity: 1 !important;
        }
        .deckymus-open-btn:focus,
        .deckymus-open-btn:focus-visible,
        .deckymus-open-btn.focused,
        .deckymus-open-btn[data-focused="true"] {
          outline: 2px solid #ffffff !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.9) !important;
          transform: scale(1.02) !important;
          filter: brightness(1.25) !important;
          color: #ffffff !important;
          z-index: 5 !important;
        }
      `}</style>

      {/* 1. Track Info & Cover Art */}
      <PanelSectionRow>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            padding: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            borderRadius: "8px",
            marginBottom: "6px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Cover Art */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "6px",
              overflow: "hidden",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
            }}
          >
            {status.track?.art_url ? (
              <img
                src={status.track.art_url}
                alt="Cover"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <FaMusic size={22} color="#94a3b8" />
            )}
          </div>

          {/* Metadata */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              minWidth: 0,
              flex: 1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#f8fafc",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={status.track?.title || "DeckyMus"}
            >
              {status.track?.title || t("noTrackSelected")}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={status.track?.artist}
            >
              {status.track?.artist || t("clickOpenLibraryHint")}
            </div>

            {/* Status Pill Badge */}
            <div style={{ marginTop: "3px" }}>
              <span
                style={{
                  fontSize: "9px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  display: "inline-block",
                  backgroundColor:
                    status.playback_status === "Playing"
                      ? "rgba(34, 197, 94, 0.2)"
                      : status.playback_status === "Paused"
                      ? "rgba(234, 179, 8, 0.2)"
                      : "rgba(148, 163, 184, 0.15)",
                  color:
                    status.playback_status === "Playing"
                      ? "#4ade80"
                      : status.playback_status === "Paused"
                      ? "#facc15"
                      : "#94a3b8",
                }}
              >
                {status.playback_status === "Playing"
                  ? t("statusPlaying")
                  : status.playback_status === "Paused"
                  ? t("statusPaused")
                  : t("statusStopped")}
              </span>
            </div>
          </div>
        </div>
      </PanelSectionRow>

      {/* 2. Non-interactive Progress Bar & Time */}
      {hasTrack && (
        <PanelSectionRow>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              width: "100%",
              marginBottom: "6px",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#94a3b8",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span>{formatTime(position)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "5px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  backgroundColor: "#3b82f6",
                  borderRadius: "3px",
                  transition: "width 0.25s linear",
                }}
              />
            </div>
          </div>
        </PanelSectionRow>
      )}

      {/* 3. Playback Controls Grid: Previous, Play/Pause, Next */}
      <PanelSectionRow>
        <Focusable
          flow-children="row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "6px",
            width: "100%",
            boxSizing: "border-box",
            marginBottom: "6px",
          }}
        >
          <div style={{ minWidth: 0, width: "100%" }}>
            <DialogButton
              className="deckymus-qam-btn"
              disabled={!hasTrack}
              onPointerDown={() => setPressedKey("prev")}
              onPointerUp={() => setPressedKey(null)}
              onClick={(e) => handleAction("prev", rpcPreviousTrack, e)}
              style={{
                minWidth: "0px",
                width: "100%",
                padding: "8px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: pressedKey === "prev" ? "scale(0.92)" : "scale(1)",
                filter: pressedKey === "prev" ? "brightness(1.4)" : "brightness(1)",
              }}
            >
              <FaBackward size={13} />
            </DialogButton>
          </div>

          <div style={{ minWidth: 0, width: "100%" }}>
            <DialogButton
              className="deckymus-qam-btn"
              disabled={!hasTrack}
              onPointerDown={() => setPressedKey("play")}
              onPointerUp={() => setPressedKey(null)}
              onClick={(e) => handleAction("play", rpcPlayPause, e)}
              style={{
                minWidth: "0px",
                width: "100%",
                padding: "8px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isPlaying ? "rgba(239, 68, 68, 0.35)" : "rgba(59, 130, 246, 0.35)",
                border: isPlaying ? "1px solid rgba(239, 68, 68, 0.55)" : "1px solid rgba(59, 130, 246, 0.55)",
                transform: pressedKey === "play" ? "scale(0.92)" : "scale(1)",
                filter: pressedKey === "play" ? "brightness(1.4)" : "brightness(1)",
              }}
            >
              {isPlaying ? <FaPause size={13} /> : <FaPlay size={13} />}
            </DialogButton>
          </div>

          <div style={{ minWidth: 0, width: "100%" }}>
            <DialogButton
              className="deckymus-qam-btn"
              disabled={!hasTrack}
              onPointerDown={() => setPressedKey("next")}
              onPointerUp={() => setPressedKey(null)}
              onClick={(e) => handleAction("next", rpcNextTrack, e)}
              style={{
                minWidth: "0px",
                width: "100%",
                padding: "8px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: pressedKey === "next" ? "scale(0.92)" : "scale(1)",
                filter: pressedKey === "next" ? "brightness(1.4)" : "brightness(1)",
              }}
            >
              <FaForward size={13} />
            </DialogButton>
          </div>
        </Focusable>
      </PanelSectionRow>

      {/* 4. Secondary Controls: Shuffle & Repeat */}
      <PanelSectionRow>
        <Focusable
          flow-children="row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "6px",
            width: "100%",
            boxSizing: "border-box",
            marginBottom: "8px",
          }}
        >
          <div style={{ minWidth: 0, width: "100%" }}>
            <DialogButton
              className="deckymus-qam-btn"
              onPointerDown={() => setPressedKey("shuffle")}
              onPointerUp={() => setPressedKey(null)}
              onClick={(e) => handleAction("shuffle", rpcToggleShuffle, e)}
              style={{
                minWidth: "0px",
                width: "100%",
                padding: "7px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: status.shuffle ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.08)",
                border: status.shuffle ? "1px solid rgba(59, 130, 246, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
                transform: pressedKey === "shuffle" ? "scale(0.92)" : "scale(1)",
                filter: pressedKey === "shuffle" ? "brightness(1.4)" : "brightness(1)",
              }}
            >
              <FaRandom size={11} color={status.shuffle ? "#60a5fa" : "#94a3b8"} />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: status.shuffle ? 600 : "normal",
                  color: status.shuffle ? "#60a5fa" : "#94a3b8",
                }}
              >
                {t("shuffle")}
              </span>
            </DialogButton>
          </div>

          <div style={{ minWidth: 0, width: "100%" }}>
            <DialogButton
              className="deckymus-qam-btn"
              onPointerDown={() => setPressedKey("repeat")}
              onPointerUp={() => setPressedKey(null)}
              onClick={(e) => handleRepeatCycle(e)}
              style={{
                minWidth: "0px",
                width: "100%",
                padding: "7px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: status.repeat !== "off" ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.08)",
                border:
                  status.repeat !== "off" ? "1px solid rgba(59, 130, 246, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
                transform: pressedKey === "repeat" ? "scale(0.92)" : "scale(1)",
                filter: pressedKey === "repeat" ? "brightness(1.4)" : "brightness(1)",
              }}
            >
              <FaRedo size={11} color={status.repeat !== "off" ? "#60a5fa" : "#94a3b8"} />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: status.repeat !== "off" ? 600 : "normal",
                  color: status.repeat !== "off" ? "#60a5fa" : "#94a3b8",
                }}
              >
                {status.repeat === "one" ? t("repeatOne") : status.repeat === "all" ? t("repeatAll") : t("repeatOff")}
              </span>
            </DialogButton>
          </div>
        </Focusable>
      </PanelSectionRow>

      {/* 4.5. Independent Volume Slider */}
      <PanelSectionRow>
        <Focusable
          flow-children="row"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "8px 12px",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
            boxSizing: "border-box",
            marginBottom: "8px",
          }}
        >
          <DialogButton
            className="deckymus-focus-btn"
            onClick={toggleMute}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: volume === 0 ? "#ef4444" : "#60a5fa",
              flexShrink: 0,
              width: "28px",
              minWidth: "28px",
              height: "28px",
              padding: 0,
              backgroundColor: "transparent",
            }}
          >
            {volume === 0 ? (
              <FaVolumeMute size={14} />
            ) : volume < 50 ? (
              <FaVolumeDown size={14} />
            ) : (
              <FaVolumeUp size={14} />
            )}
          </DialogButton>

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
              flex: "1 1 0%",
              height: "6px",
              accentColor: "#3b82f6",
              cursor: "pointer",
            }}
          />

          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#94a3b8",
              width: "34px",
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
            }}
          >
            {Math.round(volume)}%
          </span>
        </Focusable>
      </PanelSectionRow>

      {/* 5. Open Fullscreen DeckyMus Button */}
      <PanelSectionRow>
        <DialogButton
          className="deckymus-qam-btn deckymus-open-btn"
          onPointerDown={() => setPressedKey("open")}
          onPointerUp={() => setPressedKey(null)}
          onClick={(e) => handleOpenFullscreen(e)}
          style={{
            minWidth: "0px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 0",
            backgroundColor: "rgba(59, 130, 246, 0.25)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            transform: pressedKey === "open" ? "scale(0.95)" : "scale(1)",
            filter: pressedKey === "open" ? "brightness(1.3)" : "brightness(1)",
            color: "#ffffff",
          }}
        >
          <FaExpandAlt size={12} color="#60a5fa" />
          <span style={{ color: "#ffffff", fontWeight: 600, opacity: 1, fontSize: "12px" }}>
            {t("openLibrary")}
          </span>
        </DialogButton>
      </PanelSectionRow>
    </div>
  );
};
