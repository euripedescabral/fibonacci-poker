import type { PublicState } from "../../../../packages/contracts/src/index.js";
import type { Translate } from "../i18n/index.js";
export function Result({ state, t }: { state: PublicState; t: Translate }) {
  const result = state.revealed?.result;
  return (
    <div class="result" aria-live="polite">
      <p class="eyebrow">
        {t(
          result?.kind === "mode" && result.values.length > 1 ? "tie" : "mode",
        )}
      </p>
      {result?.kind === "mode" ? (
        <>
          <div class="result-values">
            {result.values.map((v) => (
              <strong key={v}>{v}</strong>
            ))}
          </div>
          <p>
            {t(result.count === 1 ? "frequencyOne" : "frequency", {
              count: result.count,
            })}
          </p>
        </>
      ) : (
        <p>{t("noNumeric")}</p>
      )}
    </div>
  );
}
