import { FC, useState, useEffect } from "react";
import {
  PanelSection,
  PanelSectionRow,
  DialogButton,
  DropdownItem,
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
} from "react-icons/fa";
import {
  rpcGetLocalFolders,
  rpcSetLocalFolders,
  rpcBrowseDirectory,
  rpcGetDownloadFolder,
  rpcSetDownloadFolder,
} from "../../api";
import { DirectoryBrowseResult } from "../../types";
import { useTranslation, SUPPORTED_LANGUAGES } from "../../i18n";

export const SettingsTab: FC = () => {
  const { t, selectedCode, setLanguage } = useTranslation();
  const [folders, setFolders] = useState<string[]>([]);
  const [downloadFolder, setDownloadFolder] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [dlSaved, setDlSaved] = useState(false);

  // Folder browser state
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserMode, setBrowserMode] = useState<"library" | "download">("library");
  const [browseData, setBrowseData] = useState<DirectoryBrowseResult | null>(null);
  const [browsing, setBrowsing] = useState(false);

  const loadData = async () => {
    try {
      const [fRes, dlRes] = await Promise.all([
        rpcGetLocalFolders(),
        rpcGetDownloadFolder(),
      ]);
      setFolders(fRes || []);
      setDownloadFolder(dlRes || "");
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

  return (
    <div style={{ padding: "16px 24px", maxWidth: "800px", margin: "0 auto" }}>
      {/* 0. Language Settings Section */}
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
              <div
                key={idx}
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
                    flexShrink: 0,
                  }}
                >
                  <FaTrash size={12} color="#f87171" />
                </DialogButton>
              </div>
            ))}

            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
              {t("autoScanNotice")}
            </div>
          </div>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};