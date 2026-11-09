import { useState, useEffect, useCallback } from "react";
import { translations } from "./translations";

export const SUPPORTED_LANGUAGES = [
  { code: "auto", name: "Авто (Язык Steam)" },
  { code: "ru", name: "Русский (Russian)" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch (German)" },
  { code: "fr", name: "Français (French)" },
  { code: "es", name: "Español (Spanish)" },
  { code: "es-419", name: "Español - Latinoamérica" },
  { code: "it", name: "Italiano (Italian)" },
  { code: "pt-BR", name: "Português do Brasil" },
  { code: "pt", name: "Português (Portugal)" },
  { code: "pl", name: "Polski (Polish)" },
  { code: "zh-CN", name: "简体中文 (Simplified Chinese)" },
  { code: "zh-TW", name: "繁體中文 (Traditional Chinese)" },
  { code: "ja", name: "日本語 (Japanese)" },
  { code: "ko", name: "한국어 (Korean)" },
  { code: "uk", name: "Українська (Ukrainian)" },
  { code: "tr", name: "Türkçe (Turkish)" },
  { code: "cs", name: "Čeština (Czech)" },
  { code: "da", name: "Dansk (Danish)" },
  { code: "nl", name: "Nederlands (Dutch)" },
  { code: "fi", name: "Suomi (Finnish)" },
  { code: "el", name: "Ελληνικά (Greek)" },
  { code: "hu", name: "Magyar (Hungarian)" },
  { code: "no", name: "Norsk (Norwegian)" },
  { code: "ro", name: "Română (Romanian)" },
  { code: "sv", name: "Svenska (Swedish)" },
  { code: "vi", name: "Tiếng Việt (Vietnamese)" },
  { code: "bg", name: "Български (Bulgarian)" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "th", name: "ไทย (Thai)" },
];

function normalizeLangCode(str: string): string {
  const s = (str || "").toLowerCase().trim();
  if (s.startsWith("ru")) return "ru";
  if (s.startsWith("en")) return "en";
  if (s.startsWith("de") || s === "german") return "de";
  if (s.startsWith("fr") || s === "french") return "fr";
  if (s === "latam" || s === "es-419") return "es-419";
  if (s.startsWith("es") || s === "spanish") return "es";
  if (s.startsWith("it") || s === "italian") return "it";
  if (s === "brazilian" || s === "pt-br") return "pt-BR";
  if (s.startsWith("pt") || s === "portuguese") return "pt";
  if (s.startsWith("pl") || s === "polish") return "pl";
  if (s === "schinese" || s === "zh-cn" || s === "zh-hans" || s === "zh") return "zh-CN";
  if (s === "tchinese" || s === "zh-tw" || s === "zh-hant") return "zh-TW";
  if (s.startsWith("ja") || s === "japanese") return "ja";
  if (s.startsWith("ko") || s === "korean" || s === "koreana") return "ko";
  if (s.startsWith("uk") || s === "ukrainian") return "uk";
  if (s.startsWith("tr") || s === "turkish") return "tr";
  if (s.startsWith("cs") || s === "czech") return "cs";
  if (s.startsWith("da") || s === "danish") return "da";
  if (s.startsWith("nl") || s === "dutch") return "nl";
  if (s.startsWith("fi") || s === "finnish") return "fi";
  if (s.startsWith("el") || s === "greek") return "el";
  if (s.startsWith("hu") || s === "hungarian") return "hu";
  if (s.startsWith("no") || s.startsWith("nb") || s === "norwegian") return "no";
  if (s.startsWith("ro") || s === "romanian") return "ro";
  if (s.startsWith("sv") || s === "swedish") return "sv";
  if (s.startsWith("vi") || s === "vietnamese") return "vi";
  if (s.startsWith("bg") || s === "bulgarian") return "bg";
  if (s.startsWith("id") || s === "indonesian") return "id";
  if (s.startsWith("th") || s === "thai") return "th";
  return "en";
}

export function detectSteamLanguage(): string {
  try {
    const sc = (window as any).SteamClient;
    if (sc?.Settings?.GetCurrentLanguage) {
      const l = sc.Settings.GetCurrentLanguage();
      if (l) return normalizeLangCode(l);
    }
    if (sc?.System?.GetLauncherLanguage) {
      const l = sc.System.GetLauncherLanguage();
      if (l) return normalizeLangCode(l);
    }
  } catch (_) {}

  try {
    const lm = (window as any).LocalizationManager;
    if (lm?.m_strLanguage) {
      return normalizeLangCode(lm.m_strLanguage);
    }
  } catch (_) {}

  try {
    if (typeof navigator !== "undefined" && navigator.language) {
      return normalizeLangCode(navigator.language);
    }
  } catch (_) {}

  return "ru";
}

let activeLanguage = "auto";
try {
  const saved = localStorage.getItem("deckymus_language");
  if (saved) activeLanguage = saved;
} catch (_) {}

const listeners = new Set<() => void>();

export function getSelectedLanguageCode(): string {
  return activeLanguage;
}

export function getEffectiveLanguageCode(): string {
  if (activeLanguage === "auto" || !activeLanguage) {
    return detectSteamLanguage();
  }
  return normalizeLangCode(activeLanguage);
}

export function setAppLanguage(code: string) {
  activeLanguage = code;
  try {
    localStorage.setItem("deckymus_language", code);
  } catch (_) {}
  listeners.forEach((fn) => fn());
}

export function t(key: string, ...args: (string | number)[]): string {
  const lang = getEffectiveLanguageCode();
  const dict = translations[lang] || translations["ru"] || translations["en"] || {};
  let val = dict[key] || (translations["ru"] && translations["ru"][key]) || (translations["en"] && translations["en"][key]) || key;
  if (args.length > 0) {
    args.forEach((arg, i) => {
      val = val.replace(new RegExp(`\\{${i}\\}`, "g"), String(arg));
    });
  }
  return val;
}

export function useTranslation() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const translate = useCallback((key: string, ...args: (string | number)[]) => {
    return t(key, ...args);
  }, []);

  return {
    t: translate,
    lang: getEffectiveLanguageCode(),
    selectedCode: getSelectedLanguageCode(),
    setLanguage: setAppLanguage,
  };
}
