import { publicNotice } from "../public-notice.js";
import type { Translate } from "../i18n/index.js";
export function Privacy({ t }: { t: Translate }) {
  return (
    <main class="privacy-page">
      <a href="/">← {t("home")}</a>
      <h1>{t("privacyTitle")}</h1>
      <p>{t("privacyBody")}</p>
      <p>{t("privacyLink")}</p>
      <p>{t("privacyRetention")}</p>
      <p>
        {t("privacyOperator")}: {publicNotice.operator}.{" "}
        <a href={publicNotice.contact} rel="noreferrer">
          {t("privacyContact")}
        </a>
      </p>
      {publicNotice.region && (
        <p>
          {t("privacyRegion")}: {publicNotice.region}
        </p>
      )}
      <p>{t("privacyBackup")}</p>
      <p>
        <a href="/assets/third-party-notices.txt">{t("privacyLicenses")}</a>
      </p>
      {(!publicNotice.published || !publicNotice.region) && (
        <p class="notice">{t("privacyUnreleased")}</p>
      )}
    </main>
  );
}
