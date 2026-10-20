import { detectLocale, type Locale } from "../i18n/index.js";
export interface Preferences {
  locale: Locale;
  sound: boolean;
  reduceMotion: boolean;
}
export function readPreferences(): Preferences {
  let saved: Partial<Preferences> = {};
  try {
    saved = JSON.parse(
      localStorage.getItem("fp:preferences") ?? "{}",
    ) as Partial<Preferences>;
  } catch {
    /* Private browsing still supports session-only settings. */
  }
  return {
    locale:
      saved.locale === "pt" || saved.locale === "en"
        ? saved.locale
        : detectLocale(navigator.languages),
    sound: saved.sound !== false,
    reduceMotion: saved.reduceMotion === true,
  };
}
export function savePreferences(value: Preferences): void {
  try {
    localStorage.setItem("fp:preferences", JSON.stringify(value));
  } catch {
    /* Keep the active in-memory choice. */
  }
}
