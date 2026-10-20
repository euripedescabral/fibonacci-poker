import { expect, it } from "vitest";
import { en } from "../../apps/web/src/i18n/en.js";
import { pt } from "../../apps/web/src/i18n/pt.js";
import { detectLocale, translator } from "../../apps/web/src/i18n/index.js";
import { ERROR_CODES } from "../../packages/contracts/src/index.js";
it("has matching complete dictionaries and localized protocol errors", () => {
  expect(Object.keys(pt).sort()).toEqual(Object.keys(en).sort());
  for (const key of ERROR_CODES) expect(pt[key]).toBeTruthy();
});
it("detects Portuguese variants and falls back to English", () => {
  expect(detectLocale(["pt-BR"])).toBe("pt");
  expect(detectLocale(["pt-PT"])).toBe("pt");
  expect(detectLocale(["ja"])).toBe("en");
  expect(translator("pt")("progress", { voted: 2, total: 3 })).toBe(
    "2 de 3 escolheram",
  );
});
