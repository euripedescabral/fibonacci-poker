import { useState } from "preact/hooks";
import type { Action } from "../../../../packages/contracts/src/index.js";
import type { View } from "../connection/client.js";
import type { Translate } from "../i18n/index.js";
import { Roster, Observers } from "./roster.js";
import { Deck } from "./deck.js";
import { Result } from "./result.js";
import { SuitIcon } from "./suits.js";
export function Table({
  view,
  onAction,
  t,
}: {
  view: View;
  onAction: (action: Action) => void;
  t: Translate;
}) {
  const [copied, setCopied] = useState(false),
    [fallback, setFallback] = useState(false);
  const { state, own } = view;
  if (!state || !own) return null;
  const disabled = view.status !== "live" || view.pending;
  const observer =
    state.members.find((m) => m.id === own.id)?.mode === "observer";
  const choose = (value: Parameters<typeof Deck>[0]["value"]) => {
    if (value !== null)
      onAction(
        value === own.value
          ? { type: "withdraw", payload: {} }
          : { type: "vote", payload: { value } },
      );
  };
  return (
    <main class="table-page">
      <div class="table-heading">
        <div>
          <p class="eyebrow">
            {t("brand")} / {t(view.status)}
          </p>
          <h1>{t("tableTitle")}</h1>
        </div>
        <div class="table-tools">
          <label class="observe-switch">
            <input
              type="checkbox"
              role="switch"
              checked={observer}
              disabled={disabled}
              onChange={(e) =>
                onAction({
                  type: "setMode",
                  payload: {
                    mode: e.currentTarget.checked ? "observer" : "voter",
                  },
                })
              }
            />
            {t("observing")}
          </label>
          <button
            class="secondary"
            onClick={() => {
              void navigator.clipboard
                ?.writeText(location.href)
                .then(() => setCopied(true))
                .catch(() => setFallback(true));
              if (!navigator.clipboard) setFallback(true);
            }}
          >
            {t(copied ? "copied" : "invite")} <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
      {fallback && (
        <label class="copy-fallback">
          {t("copyFallback")}
          <input
            readOnly
            value={location.href}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
      )}
      <section class="felt" aria-label={t("players")}>
        <div class="felt-top">
          <span class="table-mark">
            <SuitIcon suit={state.suit} />
            {t(state.suit)}
          </span>
          <span class="people-count">
            {state.members.filter((m) => m.connected).length} / 20
          </span>
        </div>
        <Roster state={state} own={own} t={t} />
        <div class="table-center">
          {state.phase === "revealed" ? (
            <Result state={state} t={t} />
          ) : (
            <>
              <p class="eyebrow">
                {t("progress", {
                  voted: state.voted,
                  total: state.activeVoters,
                })}
              </p>
              <h2>
                {t(
                  !state.activeVoters
                    ? "noVoters"
                    : state.voted === state.activeVoters
                      ? "allReady"
                      : "noVotes",
                )}
              </h2>
              <p>{t("pending", { count: state.activeVoters - state.voted })}</p>
            </>
          )}
          <div class="round-actions">
            <button
              class="primary"
              disabled={
                disabled || (!state.submitted && state.phase === "open")
              }
              onClick={() =>
                onAction({
                  type: state.phase === "open" ? "reveal" : "hide",
                  payload: {},
                })
              }
            >
              {t(state.phase === "open" ? "reveal" : "hide")}
              <span aria-hidden="true">
                {state.phase === "open" ? "↗" : "↻"}
              </span>
            </button>
            {(state.phase === "revealed" || state.submitted > 0) && (
              <button
                class="text-button"
                disabled={disabled}
                onClick={() => onAction({ type: "clear", payload: {} })}
              >
                {t("clear")}
              </button>
            )}
          </div>
          <p class="table-hint">
            {t(state.phase === "open" ? "revealHint" : "nextRoundHint")}
          </p>
        </div>
      </section>
      <Observers state={state} own={own} t={t} />
      {observer ? (
        <p class="deck-notice">{t("observerHint")}</p>
      ) : (
        <Deck
          value={own.roundId === state.roundId ? own.value : null}
          suit={state.suit}
          disabled={disabled}
          pending={view.pending}
          onChoose={choose}
          t={t}
        />
      )}
    </main>
  );
}
