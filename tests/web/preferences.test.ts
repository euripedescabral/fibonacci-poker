import { expect, it, vi } from "vitest";
import {
  readPreferences,
  savePreferences,
} from "../../apps/web/src/preferences/store.js";
import { CompletionAudio } from "../../apps/web/src/preferences/audio.js";
it("supports disabled storage and Portuguese locale without crashing", () => {
  vi.stubGlobal("navigator", { languages: ["pt-BR"] });
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw Error();
    },
    setItem: () => {
      throw Error();
    },
  });
  expect(readPreferences()).toEqual({
    locale: "pt",
    sound: true,
    reduceMotion: false,
  });
  expect(() => savePreferences(readPreferences())).not.toThrow();
  vi.unstubAllGlobals();
});
it("browser audio refusal leaves silent mode usable", async () => {
  vi.stubGlobal(
    "AudioContext",
    class {
      constructor() {
        throw Error("blocked");
      }
    },
  );
  const audio = new CompletionAudio();
  expect(await audio.unlock()).toBe(false);
  expect(() => audio.play("round", true)).not.toThrow();
  vi.unstubAllGlobals();
});
it("plays completion once, never replays muted events, and defaults sound on", async () => {
  const start = vi.fn();
  class AudioFixture {
    state = "running";
    currentTime = 0;
    destination = {};
    async resume() {}
    createOscillator() {
      return {
        type: "sine",
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {},
        start,
        stop() {},
      };
    }
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
      };
    }
  }
  vi.stubGlobal("AudioContext", AudioFixture);
  const audio = new CompletionAudio();
  await audio.unlock();
  audio.play("one", true);
  audio.play("one", true);
  audio.play("two", false);
  audio.play("two", true);
  expect(start).toHaveBeenCalledTimes(1);
  vi.unstubAllGlobals();
});

it.each(["null", "[]", "42", '"pt"', "{broken"])("recovers from malformed stored preferences: %s", (stored) => {
  vi.stubGlobal("navigator", { languages: ["pt-BR"] });
  vi.stubGlobal("localStorage", { getItem: () => stored });
  try { expect(readPreferences()).toEqual({ locale: "pt", sound: true, reduceMotion: false }); }
  finally { vi.unstubAllGlobals(); }
});

it("combines OS and explicit motion preferences and releases its listener", async () => {
  const { applyMotion } = await import("../../apps/web/src/preferences/motion.js");
  const dataset: Record<string, string> = {};
  let changed = () => {};
  const media = { matches: true, addEventListener: vi.fn((_event, fn) => { changed = fn; }), removeEventListener: vi.fn() };
  vi.stubGlobal("document", { documentElement: { dataset } });
  vi.stubGlobal("matchMedia", () => media);
  try {
    const stop = applyMotion(false);
    expect(dataset.reducedMotion).toBe("true");
    media.matches = false; changed();
    expect(dataset.reducedMotion).toBe("false");
    stop(); expect(media.removeEventListener).toHaveBeenCalledOnce();
    const stopExplicit = applyMotion(true);
    changed(); expect(dataset.reducedMotion).toBe("true");
    stopExplicit();
  } finally { vi.unstubAllGlobals(); }
});
