import { render } from "preact";
import { readPreferences } from "./preferences/store.js";
import { translator } from "./i18n/index.js";

const preferences = readPreferences();
const t = translator(preferences.locale);
document.documentElement.lang = preferences.locale;
document.documentElement.dataset.reducedMotion = String(preferences.reduceMotion);
for (const [id, key] of [["boot-status", "preparing"], ["boot-hint", "loadFailure"], ["boot-reload", "reload"]] as const) {
  const element = document.getElementById(id);
  if (element) element.textContent = t(key);
}
// Keep the small recovery shell available if the application chunk cannot load.
void import("./app.js").then(({ App }) => {
  render(<App />, document.getElementById("app")!);
}).catch(() => {
  document.querySelector(".boot-shell")?.setAttribute("aria-busy", "false");
  const status = document.getElementById("boot-status");
  if (status) status.textContent = t("loadFailure");
});
