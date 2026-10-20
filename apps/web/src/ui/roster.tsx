import type {
  PublicState,
  OwnState,
} from "../../../../packages/contracts/src/index.js";
import type { Translate } from "../i18n/index.js";
import { Card } from "./card.js";
export function Roster({
  state,
  own,
  t,
}: {
  state: PublicState;
  own: OwnState;
  t: Translate;
}) {
  return (
    <div class="roster" aria-label={t("players")}>
      {state.members
        .filter(
          (m) =>
            m.mode === "voter" ||
            state.revealed?.cards.some((c) => c.id === m.id),
        )
        .sort((a, b) => a.seat - b.seat)
        .map((m) => {
          const card = state.revealed?.cards.find((c) => c.id === m.id);
          const mine = m.id === own.id;
          const shown =
            card?.value ??
            (mine && own.roundId === state.roundId ? own.value : null);
          return (
            <div
              class={
                "seat " +
                (mine ? "own-seat " : "") +
                (!m.connected ? "offline" : "")
              }
              key={m.id}
            >
              <div class="seat-card">
                {card || m.hasVoted ? (
                  <Card
                    suit={state.suit}
                    t={t}
                    value={shown ?? undefined}
                    back={shown === null}
                  />
                ) : (
                  <div class="empty-card" aria-hidden="true">
                    ·
                  </div>
                )}
              </div>
              <span class="person-name" title={m.name}>
                {m.name}
                {mine && <small> · {t("you")}</small>}
              </span>
              <span class="person-status">
                {!m.connected
                  ? t("offline")
                  : card
                    ? t("revealed")
                    : m.hasVoted
                      ? t("chosen")
                      : t("waiting")}
              </span>
            </div>
          );
        })}
    </div>
  );
}
export function Observers({
  state,
  own,
  t,
}: {
  state: PublicState;
  own: OwnState;
  t: Translate;
}) {
  const people = state.members.filter(
    (m) => m.mode === "observer" && m.connected,
  );
  return (
    <div class="observers">
      <span class="observer-label">
        ◉ {t("observers")} <span class="count">{people.length}</span>
      </span>
      {people.map((m) => (
        <span class="observer-chip" key={m.id}>
          {m.name}
          {m.id === own.id ? " · " + t("you") : ""}
        </span>
      ))}
    </div>
  );
}
