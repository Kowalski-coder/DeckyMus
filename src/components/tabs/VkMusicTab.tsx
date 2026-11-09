import { FC } from "react";
import { PanelSection, PanelSectionRow } from "@decky/ui";
import { VkMusicIcon } from "../VkMusicIcon";
import { useTranslation } from "../../i18n";

export const VkMusicTab: FC = () => {
  const { t } = useTranslation();
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
      <PanelSection title={t("vkSectionTitle")}>
        <PanelSectionRow>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "40px 24px",
              backgroundColor: "rgba(0, 115, 247, 0.06)",
              borderRadius: "12px",
              border: "1px solid rgba(0, 115, 247, 0.2)",
              width: "100%",
              boxSizing: "border-box",
              margin: "20px 0",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.25)",
                borderRadius: "16px",
                marginBottom: "16px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
            >
              <VkMusicIcon size={56} />
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#f8fafc",
                marginBottom: "8px",
              }}
            >
              {t("vkSectionTitle")}
            </div>

            <div
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: "20px",
                backgroundColor: "rgba(236, 92, 247, 0.15)",
                border: "1px solid rgba(236, 92, 247, 0.3)",
                color: "#ec5cf7",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "14px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {t("inDevelopmentBadge")}
            </div>

            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#e2e8f0",
                maxWidth: "460px",
                lineHeight: "1.5",
                marginBottom: "8px",
              }}
            >
              {t("vkBannerTitle")}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                maxWidth: "440px",
                lineHeight: "1.4",
              }}
            >
              {t("vkBannerDesc")}
            </div>
          </div>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};
