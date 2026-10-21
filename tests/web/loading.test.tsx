// @vitest-environment jsdom
import { render, screen, cleanup, fireEvent, waitFor, act } from "@testing-library/preact";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { View } from "../../apps/web/src/connection/client.js";
const mock = vi.hoisted(() => ({ api: vi.fn(), changed: null as null | ((v: View) => void), retry: vi.fn(), stop: vi.fn() }));
vi.mock("../../apps/web/src/connection/client.js", () => ({
  api: mock.api,
  LiveClient: class {
    constructor(_id: string, _name: string, changed: (v: View) => void) { mock.changed = changed; }
    connect() { mock.changed?.({ state: null, own: null, status: "connecting", pending: false, error: null }); }
    retry = mock.retry;
    stop = mock.stop;
    activity() {}
  },
}));
import { App } from "../../apps/web/src/app.js";
const deferred = () => {
  let resolve!: (v: Record<string, unknown>) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<Record<string, unknown>>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
beforeEach(() => {
  vi.clearAllMocks();
  mock.api.mockReset();
  mock.changed = null;
  history.replaceState({}, "", "/");
  localStorage.clear();
  localStorage.setItem("fp:preferences", JSON.stringify({ locale: "pt", reduceMotion: true }));
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("prepares a session without announcing creation or showing an active form", async () => {
  const session = deferred(); mock.api.mockReturnValue(session.promise);
  render(<App />);
  expect(screen.getByRole("status").textContent).toBe("Preparando o Fibotable…");
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(document.documentElement.dataset.reducedMotion).toBe("true");
  await act(async () => session.resolve({}));
  expect(await screen.findByRole("textbox")).toBeTruthy();
  expect(screen.getByRole("button", { name: /Criar uma mesa/ })).toBeTruthy();
  expect(screen.queryByText("Criando…")).toBeNull();
});
it("keeps restored tables on the loading screen until synchronized, then preserves the table during reconnect", async () => {
  history.replaceState({}, "", "/t/saved");
  mock.api.mockResolvedValueOnce({}).mockResolvedValueOnce({ member: { name: "Saved" } });
  render(<App />);
  await waitFor(() => expect(mock.changed).not.toBeNull());
  expect(screen.queryByRole("textbox")).toBeNull();
  const state: NonNullable<View['state']> = { tableId: "saved", roundId: "round", revision: 1, phase: "open", suit: "ember", members: [], activeVoters: 0, voted: 0, submitted: 0, revealed: null };
  const live: View = { state, own: { id: "me", roundId: "round", value: 8, lastSequence: 1 }, pending: false, status: "live", error: null };
  await act(async () => mock.changed?.(live));
  expect(screen.getByRole("button", { name: "Escolher 8", exact: true }).getAttribute("aria-pressed")).toBe("true");
  await act(async () => mock.changed?.({ ...live, status: "reconnecting" }));
  expect(screen.getByRole("button", { name: "Escolher 8", exact: true }).hasAttribute("disabled")).toBe(true);
  expect(document.querySelector(".loading-page")).toBeNull();
});
it("offers a real initialization retry when the session request fails", async () => {
  mock.api.mockRejectedValueOnce(Error("STORAGE_UNAVAILABLE")).mockResolvedValueOnce({});
  render(<App />);
  const retry = await screen.findByRole("button", { name: /Tentar/ });
  expect(document.querySelector("main")?.getAttribute("aria-busy")).toBe("false");
  fireEvent.click(retry);
  expect(await screen.findByRole("textbox")).toBeTruthy();
  expect(mock.api).toHaveBeenCalledTimes(2);
});
it("only announces creation after submit and retains the entered name on failure", async () => {
  const create = deferred();
  mock.api.mockResolvedValueOnce({}).mockReturnValueOnce(create.promise);
  render(<App />);
  const name = await screen.findByRole("textbox");
  fireEvent.input(name, { target: { value: "Tester" } });
  fireEvent.submit(name.closest("form")!);
  expect(screen.getByRole("button", { name: "Criando…" }).hasAttribute("disabled")).toBe(true);
  fireEvent.submit(name.closest("form")!);
  expect(mock.api).toHaveBeenCalledTimes(2);
  await act(async () => create.reject(Error("STORAGE_UNAVAILABLE")));
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("Tester");
  expect(screen.getByRole("button", { name: /Criar uma mesa/ }).hasAttribute("disabled")).toBe(false);
});
it("shows a new invitation form only after metadata resolves", async () => {
  history.replaceState({}, "", "/t/new");
  const meta = deferred();
  mock.api.mockResolvedValueOnce({}).mockReturnValueOnce(meta.promise);
  render(<App />);
  await waitFor(() => expect(mock.api).toHaveBeenCalledTimes(2));
  expect(screen.queryByRole("textbox")).toBeNull();
  await act(async () => meta.resolve({ member: null }));
  expect(await screen.findByRole("button", { name: /Entrar na mesa/ })).toBeTruthy();
});
it("does not initialize a session for the privacy route", async () => {
  history.replaceState({}, "", "/privacy");
  render(<App />);
  await waitFor(() => expect(document.querySelector(".privacy-page")).not.toBeNull());
  expect(mock.api).not.toHaveBeenCalled();
});
