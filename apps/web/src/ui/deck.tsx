import {
  DECK,
  type Vote,
  type Suit,
} from "../../../../packages/contracts/src/index.js";
import type { Translate } from "../i18n/index.js";
import { SuitIcon } from "./suits.js";
export function Deck({
  value,
  suit,
  disabled,
  pending,
  onChoose,
  t,
}: {
  value: Vote | null;
  suit: Suit;
  disabled: boolean;
  pending: boolean;
  onChoose: (value: Vote) => void;
  t: Translate;
}) {
  return (
    <section class="deck-section" aria-busy={pending}>
      <h2>{t("choose")}</h2>
      <p>{t("deckHint")}</p>
      <div class="deck">
        {DECK.map((n) => (
          <button
            key={n}
            class={"deck-card " + (value === n ? "selected" : "")}
            aria-label={t("cardLabel", { value: n })}
            aria-pressed={value === n}
            disabled={disabled}
            onClick={() => onChoose(n)}
          >
            <span>{n}</span>
            <SuitIcon suit={suit} />
          </button>
        ))}
      </div>
      <div class="pending-text" role="status">
        {pending ? t("sending") : ""}
      </div>
    </section>
  );
}
