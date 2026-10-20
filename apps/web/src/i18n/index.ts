import { en } from "./en.js";
import { pt } from "./pt.js";
export type Locale = "pt" | "en";
export type Key = keyof typeof en;
export function detectLocale(languages: readonly string[]): Locale {
  return languages[0]?.toLowerCase().startsWith("pt") ? "pt" : "en";
}
export function translator(locale: Locale) {
  return (key: Key, values: Record<string, string | number> = {}) =>
    Object.entries(values).reduce(
      (text, [k, v]) => text.replaceAll("{" + k + "}", String(v)),
      (locale === "pt" ? pt : en)[key],
    );
}
export type Translate = ReturnType<typeof translator>;
