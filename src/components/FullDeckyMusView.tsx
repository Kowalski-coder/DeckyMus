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
import { NowPlayingTab } from "./tabs/NowPlayingTab";
import { LocalLibraryTab } from "./tabs/LocalLibraryTab";
import { VkMusicTab } from "./tabs/VkMusicTab";
import { YandexMusicTab } from "./tabs/YandexMusicTab";
import { YouTubeMusicTab } from "./tabs/YouTubeMusicTab";
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
      content: <VkMusicTab />,
      route: "/deckymus/vk",
    },
    {
      title: t("tabYandex"),
      icon: <YandexMusicIcon size={16} />,
      content: <YandexMusicTab status={status} onRefresh={fetchStatus} />,
      route: "/deckymus/yandex",
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
    <SidebarNavigation
      title="DeckyMus"
      showTitle={true}
      pages={pages}
    />
  );
};
