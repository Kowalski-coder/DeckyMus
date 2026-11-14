import { Navigation } from "@decky/ui";
import { rpcOpenBrowser } from "../api";

/**
 * Robust external auth URL opener for SteamOS / Decky Loader.
 * Supports modern SteamOS (WindowStore.m_mapDesiredWindowInstances) as well as legacy navigators and backend CEF bridge.
 */
export const openExternalAuthUrl = async (url?: string): Promise<void> => {
  if (!url) return;

  // 1. Direct navigation through modern SteamOS WindowStore Navigator
  try {
    const s = (window as any).SteamUIStore;
    const w = s?.WindowStore?.m_mapDesiredWindowInstances?.get?.(1) || s?.GetFocusedWindowInstance?.();
    if (typeof w?.m_Navigator?.ExternalWeb === "function") {
      w.m_Navigator.ExternalWeb(url);
    }
  } catch (e) {
    console.warn("Direct m_Navigator.ExternalWeb failed:", e);
  }

  // 2. Navigation through @decky/ui router
  try {
    if (typeof Navigation?.NavigateToExternalWeb === "function") {
      Navigation.NavigateToExternalWeb(url);
    }
  } catch (e) {
    console.warn("Navigation.NavigateToExternalWeb failed:", e);
  }

  // 3. Fallback / complementary backend CEF trigger
  try {
    await rpcOpenBrowser(url);
  } catch (e) {
    console.warn("rpcOpenBrowser failed:", e);
  }
};
