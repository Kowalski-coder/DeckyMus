import { FC, useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  DialogButton,
  DropdownItem,
  Focusable,
} from "@decky/ui";
import {
  FaFolder,
  FaFolderOpen,
  FaTrash,
  FaLevelUpAlt,
  FaCheck,
  FaTimes,
  FaDownload,
  FaGlobe,
  FaSignOutAlt,
} from "react-icons/fa";
import { VkMusicIcon } from "../VkMusicIcon";
import { YandexMusicIcon } from "../YandexMusicIcon";
import { SpotifyIcon } from "../SpotifyIcon";
import {
  rpcGetLocalFolders,
  rpcSetLocalFolders,
  rpcBrowseDirectory,
  rpcGetDownloadFolder,
  rpcSetDownloadFolder,
  rpcVkGetStatus,
  rpcVkLogout,
  rpcYandexGetStatus,
  rpcYandexLogout,
  rpcSpotifyGetStatus,
  rpcSpotifyLogout,
} from "../../api";
import { DirectoryBrowseResult, VkStatus, YandexStatus, SpotifyStatus } from "../../types";
import { useTranslation, SUPPORTED_LANGUAGES } from "../../i18n";

export const SettingsTab: FC = () => {
  const { t, selectedCode, setLanguage } = useTranslation();
  const [folders, setFolders] = useState<string[]>([]);
  const [downloadFolder, setDownloadFolder] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [dlSaved, setDlSaved] = useState(false);

  // Accounts state
  const [vkStatus, setVkStatus] = useState<VkStatus | null>(null);
  const [yandexStatus, setYandexStatus] = useState<YandexStatus | null>(null);
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyStatus | null>(null);
  const [loggingOutService, setLoggingOutService] = useState<string | null>(null);

  // Folder browser state
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserMode, setBrowserMode] = useState<"library" | "download">("library");
  const [browseData, setBrowseData] = useState<DirectoryBrowseResult | null>(null);
  const [browsing, setBrowsing] = useState(false);

  const loadAccounts = async () => {
    try {
      const [v, y, s] = await Promise.all([
        rpcVkGetStatus().catch(() => null),
        rpcYandexGetStatus().catch(() => null),
        rpcSpotifyGetStatus().catch(() => null),
      ]);
      setVkStatus(v);
      setYandexStatus(y);
      setSpotifyStatus(s);
    } catch (e) {
      console.error("loadAccounts error:", e);
    }
  };

  const handleAccountLogout = async (service: "vk" | "yandex" | "spotify") => {
    setLoggingOutService(service);
    try {
      if (service === "vk") await rpcVkLogout();
      else if (service === "yandex") await rpcYandexLogout();
      else if (service === "spotify") await rpcSpotifyLogout();
      await loadAccounts();
    } catch (e) {
      console.error("Account logout error:", e);
    } finally {
      setLoggingOutService(null);
    }
  };

  const loadData = async () => {
    try {
      const [fRes, dlRes] = await Promise.all([
        rpcGetLocalFolders(),
        rpcGetDownloadFolder(),
      ]);
      setFolders(fRes || []);
      setDownloadFolder(dlRes || "");
      await loadAccounts();
    } catch (e) {
      console.error("Load settings error:", e);
    }
  };

  const navigateBrowser = async (path: string = "") => {
    setBrowsing(true);
    try {
      const res = await rpcBrowseDirectory(path);
      if (res && res.current) {
        setBrowseData(res);
      }
    } catch (e) {
      console.error("Browse error:", e);
    } finally {
      setBrowsing(false);
    }
  };

  const openLibraryBrowser = () => {
    setBrowserMode("library");
    setShowBrowser(true);
    navigateBrowser("");
  };

  const openDownloadBrowser = () => {
    setBrowserMode("download");
    setShowBrowser(true);
    navigateBrowser(downloadFolder || "");
  };

  const handleSelectCurrentFolder = async (pathToAdd?: string) => {
    const target = pathToAdd || browseData?.current;
    if (!target) return;

    if (browserMode === "library") {
      if (!folders.includes(target)) {
        const updated = [...folders, target];
        setFolders(updated);
        await rpcSetLocalFolders(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } else {
      setDownloadFolder(target);
      await rpcSetDownloadFolder(target);
      // Reload folders because downloadFolder is automatically added to library
      const fRes = await rpcGetLocalFolders();
      setFolders(fRes || []);
      setDlSaved(true);
      setTimeout(() => setDlSaved(false), 2000);
    }
    setShowBrowser(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemoveFolder = async (idx: number) => {
    const updated = folders.filter((_, i) => i !== idx);
    setFolders(updated);
    await rpcSetLocalFolders(updated);
  };

  const loggedInAccounts = [];
  if (vkStatus && vkStatus.logged_in) {
    loggedInAccounts.push({
      service: "vk" as const,
      name: vkStatus.user_name || "VK User",
      id: vkStatus.user_id ? `ID: ${vkStatus.user_id}` : "",
      label: "VK Музыка",
      avatar: vkStatus.avatar || "",
      color: "#0073f7",
      colorRgb: "0, 115, 247",
      icon: <VkMusicIcon size={20} />,
    });
  }
  if (yandexStatus && yandexStatus.logged_in) {
    loggedInAccounts.push({
      service: "yandex" as const,
      name: yandexStatus.user_name || "Yandex User",
      id: yandexStatus.user_id ? `ID: ${yandexStatus.user_id}` : "",
      label: "Яндекс Музыка",
      avatar: yandexStatus.avatar || "",
      color: "#facc15",
      colorRgb: "250, 204, 21",
      icon: <YandexMusicIcon size={20} />,
    });
  }
  if (spotifyStatus && spotifyStatus.logged_in) {
    loggedInAccounts.push({
      service: "spotify" as const,
      name: spotifyStatus.user_name || "Spotify User",
      id: spotifyStatus.product ? `Spotify ${spotifyStatus.product}` : (spotifyStatus.user_id ? `ID: ${spotifyStatus.user_id}` : ""),
      label: "Spotify",
      avatar: spotifyStatus.avatar || "",
      color: "#1ed760",
      colorRgb: "30, 215, 96",
      icon: <SpotifyIcon size={20} />,
    });
  }

  return (
    <div style={{ padding: "16px 24px", maxWidth: "800px", margin: "0 auto" }}>
      <style>{`
        .deckymus-account-row {
          transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease, outline 0.12s ease, border-color 0.12s ease !important;
          box-sizing: border-box !important;
          outline: none !important;
        }
        .deckymus-account-row .DialogButton,
        .deckymus-account-row button,
        .deckymus-logout-btn {
          width: auto !important;
          min-width: 80px !important;
          max-width: 95px !important;
          flex: 0 0 auto !important;
          height: 36px !important;
          padding: 0 10px !important;
          box-sizing: border-box !important;
        }
        .deckymus-account-row-vk:focus-within,
        .deckymus-account-row-vk:focus,
        .deckymus-account-row-vk:focus-visible,
        .deckymus-account-row-vk.focused,
        .deckymus-account-row-vk[data-focused="true"] {
          outline: 2px solid #0073f7 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(0, 115, 247, 0.85), inset 0 0 4px rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.015) !important;
          filter: brightness(1.2) !important;
          border-color: #0073f7 !important;
        }
        .deckymus-account-row-yandex:focus-within,
        .deckymus-account-row-yandex:focus,
        .deckymus-account-row-yandex:focus-visible,
        .deckymus-account-row-yandex.focused,
        .deckymus-account-row-yandex[data-focused="true"] {
          outline: 2px solid #facc15 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(250, 204, 21, 0.85), inset 0 0 4px rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.015) !important;
          filter: brightness(1.2) !important;
          border-color: #facc15 !important;
        }
        .deckymus-account-row-spotify:focus-within,
        .deckymus-account-row-spotify:focus,
        .deckymus-account-row-spotify:focus-visible,
        .deckymus-account-row-spotify.focused,
        .deckymus-account-row-spotify[data-focused="true"] {
          outline: 2px solid #1ed760 !important;
          outline-offset: 1px !important;
          box-shadow: 0 0 14px rgba(30, 215, 96, 0.85), inset 0 0 4px rgba(255, 255, 255, 0.25) !important;
          transform: scale(1.015) !important;
          filter: brightness(1.2) !important;
          border-color: #1ed760 !important;
        }
      `}</style>

      {/* 1. Language Settings Section */}
      <PanelSection title={t("languageSettingTitle")}>
        <PanelSectionRow>
          <div style={{ width: "100%", marginBottom: "12px" }}>
            <DropdownItem
              label={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaGlobe size={14} color="#60a5fa" />
                  <span>{t("languageSettingTitle")}</span>
                </div>
              }
              description={t("languageSettingDesc")}
              menuLabel={t("languageSettingTitle")}
              rgOptions={SUPPORTED_LANGUAGES.map((l) => ({
                data: l.code,
                label: l.code === "auto" ? t("languageAuto") : l.name,
              }))}
              selectedOption={selectedCode}
              onChange={(opt: any) => setLanguage(opt?.data || opt)}
            />
          </div>
        </PanelSectionRow>
      </PanelSection>

      {/* 1. Folder Browser Modal / Section */}
      {showBrowser && browseData && (
        <PanelSection title={browserMode === "download" ? t("modalTitleDownload") : t("modalTitleLibrary")}>
          <PanelSectionRow>
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.55)",
                border: "1px solid rgba(59, 130, 246, 0.5)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#60a5fa" }}>
                  {browserMode === "download" ? t("modalHeaderDownload") : t("modalHeaderLibrary")}
                </div>
                <DialogButton
                  onClick={() => setShowBrowser(false)}
                  style={{ minWidth: 0, padding: "4px 8px", backgroundColor: "transparent" }}
                >
                  <FaTimes size={14} color="#94a3b8" />
                </DialogButton>
              </div>

              {/* Quick Presets */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>{t("quickSelect")}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {browseData.presets.map((preset, pIdx) => (
                    <DialogButton
                      key={pIdx}
                      onClick={() => handleSelectCurrentFolder(preset.path)}
                      style={{ minWidth: "auto", padding: "6px 12px", fontSize: "12px" }}
                    >
                      <FaFolder size={11} style={{ marginRight: "6px" }} />
                      {preset.name}
                    </DialogButton>
                  ))}
                </div>
              </div>

              {/* Current directory path */}
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#f8fafc",
                  marginBottom: "10px",
                  wordBreak: "break-all",
                }}
              >
                {t("currentFolder")} <b>{browseData.current}</b>
              </div>

              {/* Action: Select this folder */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <DialogButton
                  onClick={() => handleSelectCurrentFolder()}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    backgroundColor: "rgba(34, 197, 94, 0.4)",
                  }}
                >
                  <FaCheck size={12} color="#4ade80" />
                  <span>{t("selectThisFolderBtn")}</span>
                </DialogButton>

                {browseData.parent && (
                  <DialogButton
                    disabled={browsing}
                    onClick={() => navigateBrowser(browseData.parent)}
                    style={{ minWidth: "100px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    <FaLevelUpAlt size={12} />
                    <span>{t("upBtn")}</span>
                  </DialogButton>
                )}
              </div>

              {/* Subfolders list */}
              <div
                style={{
                  maxHeight: "180px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingTop: "8px",
                }}
              >
                {browseData.subdirs.length === 0 && (
                  <div style={{ fontSize: "12px", color: "#64748b", padding: "8px 0", textAlign: "center" }}>
                    {t("noSubfolders")}
                  </div>
                )}
                {browseData.subdirs.map((sub, sIdx) => (
                  <DialogButton
                    key={sIdx}
                    onClick={() => navigateBrowser(sub.path)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "8px",
                      padding: "8px 12px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      textAlign: "left",
                    }}
                  >
                    <FaFolder size={12} color="#60a5fa" />
                    <span style={{ fontSize: "13px", color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {sub.name}
                    </span>
                  </DialogButton>
                ))}
              </div>
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {/* 2. Download Folder Section */}
      <PanelSection title={t("settingsSectionDownload")}>
        <PanelSectionRow>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {t("settingsDownloadDesc")}
            </div>

            <div style={{ width: "100%", marginBottom: "4px" }}>
              <DialogButton
                className="deckymus-focus-btn"
                onClick={openDownloadBrowser}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "12px 0",
                  backgroundColor: "rgba(59, 130, 246, 0.3)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                }}
              >
                <FaFolderOpen size={16} color="#60a5fa" />
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>{t("selectFolderBtn")}</span>
              </DialogButton>
            </div>

            {/* Current path card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                borderRadius: "8px",
                gap: "10px",
              }}
            >
              <FaDownload size={14} color="#60a5fa" style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontSize: "13px",
                  color: "#f8fafc",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={downloadFolder}
              >
                {downloadFolder || t("settingsNotSelected")}
              </span>
            </div>

            {dlSaved && (
              <div style={{ fontSize: "12px", color: "#4ade80", textAlign: "center", marginTop: "2px" }}>
                {t("downloadFolderUpdated")}
              </div>
            )}
          </div>
        </PanelSectionRow>
      </PanelSection>

      {/* 3. Connected Library Folders Section */}
      <PanelSection title={t("settingsSectionLibrary")}>
        {/* Folder browser opener button */}
        <PanelSectionRow>
          <div style={{ width: "100%", marginBottom: "12px" }}>
            <DialogButton
              className="deckymus-focus-btn"
              onClick={openLibraryBrowser}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "12px 0",
                backgroundColor: "rgba(59, 130, 246, 0.3)",
                border: "1px solid rgba(59, 130, 246, 0.5)",
              }}
            >
              <FaFolderOpen size={16} color="#60a5fa" />
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>{t("selectAndAddFolderBtn")}</span>
            </DialogButton>
          </div>
          {saved && (
            <div style={{ fontSize: "12px", color: "#4ade80", marginBottom: "8px", textAlign: "center" }}>
              {t("folderAddedSuccess")}
            </div>
          )}
        </PanelSectionRow>

        {/* Existing Configured Folders List with Compact Square Trash Button */}
        <PanelSectionRow>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "2px" }}>
              {t("foldersList")} ({folders.length}):
            </div>
            {folders.length === 0 && (
              <div style={{ fontSize: "12px", color: "#64748b", padding: "8px 0" }}>
                {t("noAddedFolders")}
              </div>
            )}
            {folders.map((f, idx) => (
              <Focusable
                key={idx}
                flow-children="row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "8px",
                  gap: "10px",
                }}
              >
                {/* Full path display taking maximum space */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1, overflow: "hidden" }}>
                  <FaFolder size={14} color="#60a5fa" style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#f8fafc",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                    title={f}
                  >
                    {f}
                  </span>
                </div>

                {/* Compact square trash button on the right */}
                <DialogButton
                  className="deckymus-focus-btn deckymus-trash-btn"
                  onClick={() => handleRemoveFolder(idx)}
                  style={{
                    minWidth: "36px",
                    width: "36px",
                    height: "36px",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    borderRadius: "6px",
                    flex: "0 0 auto",
                  }}
                >
                  <FaTrash size={12} color="#f87171" />
                </DialogButton>
              </Focusable>
            ))}

            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
              {t("autoScanNotice")}
            </div>
          </div>
        </PanelSectionRow>
      </PanelSection>

      {/* 4. Connected Accounts Section */}
      {loggedInAccounts.length > 0 && (
        <PanelSection title={t("settingsSectionAccounts") || "Аккаунты"}>
          <PanelSectionRow>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
              {loggedInAccounts.map((acc) => (
                <Focusable
                  key={acc.service}
                  flow-children="row"
                  className={`deckymus-account-row deckymus-account-row-${acc.service}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: `1px solid rgba(${acc.colorRgb}, 0.25)`,
                    borderRadius: "8px",
                    gap: "12px",
                    cursor: "default",
                  }}
                >
                  {/* Left: Avatar or Platform Logo */}
                  {acc.avatar ? (
                    <div style={{ position: "relative", width: "38px", height: "38px", flexShrink: 0 }}>
                      <img
                        src={acc.avatar}
                        alt=""
                        style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          right: "-2px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "4px",
                          backgroundColor: "#0f172a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {acc.icon}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "8px",
                        backgroundColor: `rgba(${acc.colorRgb}, 0.15)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: acc.color,
                        flexShrink: 0,
                      }}
                    >
                      {acc.icon}
                    </div>
                  )}

                  {/* Middle: User name & ID (matching track title & artist) */}
                  <div style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#f8fafc",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {acc.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginTop: "2px",
                      }}
                    >
                      {acc.label} {acc.id ? `• ${acc.id}` : ""}
                    </div>
                  </div>

                  {/* Right: Red logout button (compact, fixed size, no overflow) */}
                  <DialogButton
                    className="deckymus-focus-btn deckymus-logout-btn"
                    onClick={() => handleAccountLogout(acc.service)}
                    disabled={loggingOutService === acc.service}
                    style={{
                      minWidth: "80px",
                      maxWidth: "95px",
                      width: "auto",
                      height: "36px",
                      padding: "0 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      borderRadius: "6px",
                      flex: "0 0 auto",
                    }}
                  >
                    <FaSignOutAlt size={13} color="#f87171" />
                    <span style={{ fontSize: "12px", fontWeight: "bold", color: "#f87171" }}>
                      {loggingOutService === acc.service ? "..." : (t("logoutBtn") || "Выйти")}
                    </span>
                  </DialogButton>
                </Focusable>
              ))}
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}
    </div>
  );
};