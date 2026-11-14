import { FC, useState, useEffect, useRef } from "react";
import { SidebarNavigation, SidebarNavigationPage } from "@decky/ui";
import {
  FaPlayCircle,
  FaFolder,
  FaYoutube,
  FaCog,
  FaPuzzlePiece,
} from "react-icons/fa";
import { YandexMusicIcon } from "./YandexMusicIcon";
import { VkMusicIcon } from "./VkMusicIcon";
import { SpotifyIcon } from "./SpotifyIcon";
import { NowPlayingTab } from "./tabs/NowPlayingTab";
import { LocalLibraryTab } from "./tabs/LocalLibraryTab";
import { VkMusicTab } from "./tabs/VkMusicTab";
import { YandexMusicTab } from "./tabs/YandexMusicTab";
import { YouTubeMusicTab } from "./tabs/YouTubeMusicTab";
import { SpotifyTab } from "./tabs/SpotifyTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { AboutTab } from "./tabs/AboutTab";
import { PlayerStatus } from "../types";
import { rpcGetStatus } from "../api";
import { useTranslation } from "../i18n";

export const FullDeckyMusView: FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<PlayerStatus>({
    playback_status: "Stopped",
    position: 0,
    duration: 0,
    volume: 85,
    is_idle: true,
    track: { id: "", title: "", artist: "", album: "", art_url: "", duration: 0, source: "none" },
    queue_length: 0,
    queue_index: -1,
    repeat: "off",
    shuffle: false,
  });

  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await rpcGetStatus();
      if (res && typeof res === "object") {
        setStatus(res);
      }
    } catch (e) {
      console.error("fetchStatus error:", e);
    }
  };

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 1000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pages: (SidebarNavigationPage | "separator")[] = [
    {
      title: t("tabPlayer"),
      icon: <FaPlayCircle size={16} />,
      content: <NowPlayingTab status={status} onRefresh={fetchStatus} />,
      route: "/deckymus/now-playing",
    },
    {
      title: t("tabLocal"),
      icon: <FaFolder size={16} />,
      content: <LocalLibraryTab status={status} onRefresh={fetchStatus} />,
      route: "/deckymus/local",
    },
    {
      title: t("tabVk"),
      icon: <VkMusicIcon size={16} />,
      content: <VkMusicTab status={status} onRefresh={fetchStatus} />,
      route: "/deckymus/vk",
    },
    {
      title: t("tabYandex"),
      icon: <YandexMusicIcon size={16} />,
      content: <YandexMusicTab status={status} onRefresh={fetchStatus} />,
      route: "/deckymus/yandex",
    },
    {
      title: t("tabSpotify"),
      icon: <SpotifyIcon size={16} />,
      content: <SpotifyTab status={status} onRefresh={fetchStatus} />,
      route: "/deckymus/spotify",
    },
    {
      title: t("tabYtmusic"),
      icon: <FaYoutube size={16} color="#ef4444" />,
      content: <YouTubeMusicTab status={status} onRefresh={fetchStatus} />,
      route: "/deckymus/ytmusic",
    },
    {
      title: t("tabSettings"),
      icon: <FaCog size={16} />,
      content: <SettingsTab />,
      route: "/deckymus/settings",
    },
    {
      title: t("tabAbout"),
      icon: <FaPuzzlePiece size={16} />,
      content: <AboutTab />,
      route: "/deckymus/about",
    },
  ];

  return (
    <>
      <style>{`
        .deckymus-track-row {
          transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease, border-color 0.12s ease !important;
          box-sizing: border-box !important;
          outline: none !important;
          margin: 2px 2px !important;
        }
        .deckymus-track-row:focus-within,
        .deckymus-track-row:focus,
        .deckymus-track-row:focus-visible,
        .deckymus-track-row.focused,
        .deckymus-track-row[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 0px !important;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.85), inset 0 0 4px rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.01) !important;
          filter: brightness(1.2) !important;
          border-color: #3b82f6 !important;
          z-index: 2 !important;
        }
        .deckymus-playlist-card {
          transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease, border-color 0.12s ease !important;
          box-sizing: border-box !important;
          outline: none !important;
        }
        .deckymus-playlist-card:focus-within,
        .deckymus-playlist-card:focus,
        .deckymus-playlist-card:focus-visible,
        .deckymus-playlist-card.focused,
        .deckymus-playlist-card[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.85), inset 0 0 4px rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.03) !important;
          filter: brightness(1.2) !important;
          border-color: #3b82f6 !important;
          z-index: 2 !important;
        }
        .deckymus-ctrl-btn {
          transition: transform 0.1s ease, filter 0.1s ease, box-shadow 0.1s ease, outline 0.1s ease !important;
          box-sizing: border-box !important;
        }
        .deckymus-ctrl-btn:focus,
        .deckymus-ctrl-btn:focus-visible,
        .deckymus-ctrl-btn.focused,
        .deckymus-ctrl-btn[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.9), inset 0 0 4px rgba(255, 255, 255, 0.4) !important;
          transform: scale(1.08) !important;
          filter: brightness(1.25) !important;
          z-index: 5 !important;
        }
        .deckymus-focus-btn {
          transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease, border-color 0.12s ease !important;
          box-sizing: border-box !important;
        }
        .deckymus-focus-btn,
        .deckymus-focus-btn *,
        .deckymus-focus-btn:focus,
        .deckymus-focus-btn:focus *,
        .deckymus-focus-btn.focused,
        .deckymus-focus-btn.focused *,
        .deckymus-focus-btn[data-focused="true"],
        .deckymus-focus-btn[data-focused="true"] * {
          color: #ffffff !important;
        }
        .deckymus-focus-btn:focus,
        .deckymus-focus-btn:focus-visible,
        .deckymus-focus-btn.focused,
        .deckymus-focus-btn[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.9), inset 0 0 4px rgba(255, 255, 255, 0.35) !important;
          transform: scale(1.05) !important;
          filter: brightness(1.25) !important;
          border-color: #3b82f6 !important;
          z-index: 5 !important;
        }
        .deckymus-search-input-box {
          border-radius: 8px !important;
          transition: border-color 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease !important;
          box-sizing: border-box !important;
        }
        .deckymus-search-input-box.focused,
        .deckymus-search-input-box[data-focused="true"],
        .deckymus-search-input-box:focus-within {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.9), inset 0 0 6px rgba(59, 130, 246, 0.3) !important;
          border-color: #3b82f6 !important;
        }
        .deckymus-search-input-box.focused input,
        .deckymus-search-input-box[data-focused="true"] input,
        .deckymus-search-input-box:focus-within input {
          border-color: #3b82f6 !important;
          color: #ffffff !important;
        }
        .deckymus-search-input {
          transition: border-color 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease !important;
          box-sizing: border-box !important;
        }
        .deckymus-search-input:focus,
        .deckymus-search-input:focus-visible,
        .deckymus-search-input.focused,
        .deckymus-search-input[data-focused="true"] {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.9), inset 0 0 6px rgba(59, 130, 246, 0.3) !important;
          border-color: #3b82f6 !important;
        }
        .deckymus-trash-btn {
          width: 36px !important;
          min-width: 36px !important;
          max-width: 36px !important;
          height: 36px !important;
          padding: 0 !important;
          flex: 0 0 auto !important;
        }
        .deckymus-trash-btn:focus,
        .deckymus-trash-btn:focus-visible,
        .deckymus-trash-btn.focused,
        .deckymus-trash-btn[data-focused="true"] {
          outline: 2px solid #ef4444 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.95), inset 0 0 4px rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.1) !important;
          filter: brightness(1.3) !important;
          border-color: #ef4444 !important;
          z-index: 5 !important;
        }
        .deckymus-logout-btn {
          width: auto !important;
          min-width: 80px !important;
          max-width: 95px !important;
          flex: 0 0 auto !important;
          height: 36px !important;
        }
        .deckymus-logout-btn:focus,
        .deckymus-logout-btn:focus-visible,
        .deckymus-logout-btn.focused,
        .deckymus-logout-btn[data-focused="true"] {
          outline: 2px solid #ef4444 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.95), inset 0 0 4px rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.05) !important;
          filter: brightness(1.25) !important;
          border-color: #ef4444 !important;
          z-index: 5 !important;
        }
      `}</style>
      <SidebarNavigation
        title="DeckyMus"
        showTitle={true}
        pages={pages}
      />
    </>
  );
};
