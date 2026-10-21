import type { Translate } from "../i18n/index.js";
import { SuitIcon } from "./suits.js";
export function Loading({ message, pending, onRetry, t }: {
  message: string;
  pending: boolean;
  onRetry?: () => void;
  t: Translate;
}) {
  return (
    <main class="loading-page" aria-busy={pending}>
      <div class="loading-panel">
        <div class="loading-mark" aria-hidden="true"><SuitIcon suit="ember" /></div>
        <h1 class="loading-brand">{t("brand")}</h1>
        <p class="loading-message" role="status" aria-atomic="true">{message}</p>
        {!pending && <div class="loading-actions">
          {onRetry && <button class="secondary" onClick={onRetry}>{t("retryLoad")}</button>}
          <a href="/">{t("home")}</a>
        </div>}
      </div>
    </main>
  );
}
