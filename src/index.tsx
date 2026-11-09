import { FC, useState, useEffect, useCallback } from "react";
import {
  PanelSection,
  staticClasses,
} from "@decky/ui";
import { definePlugin, routerHook } from "@decky/api";
import { PlayerStatus } from "./types";
import { rpcGetStatus } from "./api";
import { DeckyMusIcon } from "./components/DeckyMusIcon";
import { QAMPlayerView } from "./components/QAMPlayerView";
import { FullDeckyMusView } from "./components/FullDeckyMusView";

const DEFAULT_STATUS: PlayerStatus = {
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
};

const Content: FC = () => {
  const [status, setStatus] = useState<PlayerStatus>(DEFAULT_STATUS);

  const refreshStatus = useCallback(() => {
    rpcGetStatus()
      .then((s) => {
        if (s) setStatus(s);
      })
      .catch((e) => console.error("DeckyMus get_status error:", e));
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 1000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return (
    <PanelSection>
      <QAMPlayerView status={status} onRefresh={refreshStatus} />
    </PanelSection>
  );
};

export default definePlugin(() => {
  // Register native full-screen SteamOS route like Wine Cellar
  routerHook.addRoute("/deckymus", FullDeckyMusView);

  return {
    name: "DeckyMus",
    titleView: (
      <div
        className={staticClasses.Title}
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        <DeckyMusIcon size={18} />
        <span>DeckyMus</span>
      </div>
    ),
    content: <Content />,
    icon: <DeckyMusIcon size={20} />,
    onDismount() {
      routerHook.removeRoute("/deckymus");
    },
  };
});
