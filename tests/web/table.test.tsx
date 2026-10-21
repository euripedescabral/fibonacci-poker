// @vitest-environment jsdom
import { render, screen, cleanup, fireEvent } from "@testing-library/preact";
import { afterEach, it, expect, vi } from "vitest";
import { Table } from "../../apps/web/src/ui/table.js";
import { Settings } from "../../apps/web/src/ui/settings.js";
import { translator } from "../../apps/web/src/i18n/index.js";
import type { View } from "../../apps/web/src/connection/client.js";
afterEach(cleanup);
function fixture(): View {
  return {
    status: "live",
    pending: false,
    error: null,
    own: { id: "me", roundId: "round", value: null, lastSequence: 0 },
    state: {
      tableId: "table",
      roundId: "round",
      revision: 1,
      phase: "open",
      suit: "ember",
      members: [
        {
          id: "me",
          name: "Me",
          mode: "voter",
          connected: true,
          seat: 0,
          hasVoted: false,
        },
        {
          id: "other",
          name: "<img src=x onerror=alert(1)>",
          mode: "voter",
          connected: true,
          seat: 1,
          hasVoted: true,
        },
      ],
      activeVoters: 2,
      voted: 1,
      submitted: 1,
      revealed: null,
    },
  };
}
it("renders hostile names as text and never adds another hidden value to DOM", () => {
  render(
    <Table view={fixture()} onAction={() => undefined} t={translator("en")} />,
  );
  expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeTruthy();
  expect(document.querySelector("img")).toBeNull();
  expect(document.querySelector(".roster")?.textContent).not.toContain("13");
});
it("withdraws confirmed own card and keeps confirmed UI during pending/error", () => {
  const view = fixture();
  view.own!.value = 8;
  const action = vi.fn();
  const rendered = render(
    <Table view={view} onAction={action} t={translator("en")} />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Choose 8", exact: true }),
  );
  expect(action).toHaveBeenCalledWith({ type: "withdraw", payload: {} });
  expect(
    screen
      .getByRole("button", { name: "Choose 8", exact: true })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  rendered.rerender(
    <Table
      view={{ ...view, pending: true }}
      onAction={action}
      t={translator("en")}
    />,
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Choose 8",
        exact: true,
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(
    screen
      .getByRole("button", { name: "Choose 8", exact: true })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  rendered.rerender(
    <Table
      view={{ ...view, pending: false, error: "STORAGE_UNAVAILABLE" }}
      onAction={action}
      t={translator("en")}
    />,
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Choose 8",
        exact: true,
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
  expect(
    screen
      .getByRole("button", { name: "Choose 8", exact: true })
      .getAttribute("aria-pressed"),
  ).toBe("true");
});
it("observers can reveal but have no voting deck; disconnected controls disable", () => {
  const view = fixture();
  view.state!.members[0]!.mode = "observer";
  view.status = "disconnected";
  render(<Table view={view} onAction={() => undefined} t={translator("pt")} />);
  expect(screen.queryByRole("button", { name: "Escolher 8" })).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: /Revelar cartas/,
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});
it.each([
  { locale: "pt" as const, values: [5], text: "5" },
  { locale: "pt" as const, values: [5, 8], text: "5 e 8" },
  { locale: "pt" as const, values: [3, 5, 8], text: "3, 5 e 8" },
  { locale: "en" as const, values: [3, 5, 8], text: "3, 5 and 8" },
])("formats mode values as $text in $locale", ({ locale, values, text }) => {
  const view = fixture();
  view.state!.phase = "revealed";
  view.state!.revealed = {
    cards: [],
    result: { kind: "mode", values, count: 2 },
  };
  render(<Table view={view} onAction={() => undefined} t={translator(locale)} />);
  expect(document.querySelector(".result-values")?.textContent).toBe(text);
});
it("settings localize motion without nausea wording", () => {
  HTMLDialogElement.prototype.close = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn();
  render(
    <Settings
      open={false}
      onClose={() => undefined}
      preferences={{ locale: "pt", sound: false, reduceMotion: false }}
      onChange={() => undefined}
      disabled={false}
      t={translator("pt")}
    />,
  );
  expect(document.body.textContent).toContain("Reduzir movimento");
  expect(document.body.textContent).not.toMatch(/enjoo|náusea/i);
});
