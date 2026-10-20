import type { Translate } from "../i18n/index.js";
export function Privacy({ t }: { t: Translate }) {
  return (
    <main class="privacy-page">
      <a href="/">← {t("home")}</a>
      <h1>{t("privacyTitle")}</h1>
      <p>{t("privacyBody")}</p>
      <p>{t("privacyLink")}</p>
      <p>{t("privacyRetention")}</p>
      <p class="notice">{t("privacyUnreleased")}</p>
    </main>
  );
}
