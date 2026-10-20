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
