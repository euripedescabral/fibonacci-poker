import type { Suit, Vote } from "../../../../packages/contracts/src/index.js";
import type { Translate } from "../i18n/index.js";
import { SuitIcon } from "./suits.js";
export function Card({
  value,
  suit,
  back = false,
  t,
}: {
  value?: Vote;
  suit: Suit;
  back?: boolean;
  t: Translate;
}) {
  return (
    <div
      class={"playing-card " + (back ? "card-back" : "card-front")}
      aria-label={back ? t("backLabel") : String(value ?? "")}
    >
      <span class="corner">{back ? "" : value}</span>
      <SuitIcon suit={suit} />
      {!back && <strong>{value}</strong>}
      <span class="corner bottom">{back ? "" : value}</span>
    </div>
  );
}
