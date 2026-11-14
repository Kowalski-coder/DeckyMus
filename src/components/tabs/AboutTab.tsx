import { FC } from "react";
import {
  PanelSection,
  PanelSectionRow,
} from "@decky/ui";
import {
  FaInfoCircle,
  FaMusic,
  FaHeadphones,
  FaDownload,
  FaCheckCircle,
  FaFolder,
  FaYoutube,
  FaPuzzlePiece,
} from "react-icons/fa";
import { DeckyMusIcon } from "../DeckyMusIcon";
import { YandexMusicIcon } from "../YandexMusicIcon";
import { VkMusicIcon } from "../VkMusicIcon";
import { useTranslation } from "../../i18n";

export const AboutTab: FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: "16px 24px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header Banner */}
      <PanelSection>
        <PanelSectionRow>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "18px 20px",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DeckyMusIcon size={32} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#f8fafc" }}>
                  DeckyMus
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(59, 130, 246, 0.25)",
                    color: "#60a5fa",
                    border: "1px solid rgba(59, 130, 246, 0.4)",
                  }}
                >
                  v0.9.2
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                {t("aboutTagline")}
              </div>
            </div>
          </div>
        </PanelSectionRow>
      </PanelSection>

      {/* Main Features */}
      <PanelSection title={t("featuresTitle")}>
        <PanelSectionRow>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
              width: "100%",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#60a5fa", fontWeight: 600, fontSize: "13px" }}>
                <FaHeadphones size={13} />
                <span>{t("featBackgroundTitle")}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }}>
                {t("featBackgroundDesc")}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#4ade80", fontWeight: 600, fontSize: "13px" }}>
                <FaFolder size={13} />
                <span>{t("featLocalTitle")}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }}>
                {t("featLocalDesc")}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#ec5cf7", fontWeight: 600, fontSize: "13px" }}>
                <VkMusicIcon size={14} />
                <span>{t("featVkTitle")}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }}>
                {t("featVkDesc")}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#facc15", fontWeight: 600, fontSize: "13px" }}>
                <YandexMusicIcon size={14} />
                <span>{t("featYandexTitle")}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }}>
                {t("featYandexDesc")}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#ef4444", fontWeight: 600, fontSize: "13px" }}>
                <FaYoutube size={14} />
                <span>{t("featYtTitle")}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }}>
                {t("featYtDesc")}
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", color: "#a78bfa", fontWeight: 600, fontSize: "13px" }}>
                <FaDownload size={13} />
                <span>{t("featDownloadTitle")}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }}>
                {t("featDownloadDesc")}
              </div>
            </div>
          </div>
        </PanelSectionRow>
      </PanelSection>

      {/* Tech Info */}
      <PanelSection title={t("techInfoTitle")}>
        <PanelSectionRow>
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f8fafc" }}>
              <FaCheckCircle size={13} color="#4ade80" />
              <span><b>{t("techAudioEngine")}</b> MPV Headless IPC (PipeWire / ALSA)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f8fafc" }}>
              <FaCheckCircle size={13} color="#4ade80" />
              <span><b>{t("techInterface")}</b> SteamOS Native React UI (@decky/ui)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f8fafc" }}>
              <FaCheckCircle size={13} color="#4ade80" />
              <span><b>{t("techConversion")}</b> FFmpeg &amp; Mutagen ID3</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f8fafc" }}>
              <FaCheckCircle size={13} color="#60a5fa" />
              <span><b>{t("techCreatedFor")}</b></span>
            </div>
          </div>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};
