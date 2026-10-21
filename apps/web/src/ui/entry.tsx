import { useState } from "preact/hooks";
import type { Translate } from "../i18n/index.js";
import { Card } from "./card.js";
export function Entry({
  joining,
  busy,
  onSubmit,
  t,
}: {
  joining: boolean;
  busy: boolean;
  onSubmit: (name: string) => void;
  t: Translate;
}) {
  const [name, setName] = useState("");
  return (
    <main class="entry">
      <div class="entry-copy">
        <h1>{t(joining ? "inviteTitle" : "headline")}</h1>
        <p class="entry-intro">{t(joining ? "inviteIntro" : "intro")}</p>
        <form aria-busy={busy}
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy && name.trim()) onSubmit(name);
          }}
        >
          <label for="display-name">{t("name")}</label>
          <div class="entry-form">
            <input
              id="display-name"
              autoComplete="nickname"
              disabled={busy}
              placeholder={t("namePlaceholder")}
              value={name}
              maxLength={64}
              required
              onInput={(e) => setName(e.currentTarget.value)}
            />
            <button class="primary" disabled={busy || !name.trim()}>
              {t(
                busy
                  ? joining
                    ? "joining"
                    : "creating"
                  : joining
                    ? "join"
                    : "create",
              )}
              {!busy && <span aria-hidden="true">↗</span>}
            </button>
          </div>
        </form>
        <p class="entry-note">{t("entryNote")}</p>
        <a class="privacy-link" href="/privacy">
          {t("privacy")}
        </a>
      </div>
      <div class="entry-art" aria-hidden="true">
        <div class="art-ring" />
        <div class="art-card a">
          <Card value={5} suit="ember" t={t} />
        </div>
        <div class="art-card b">
          <Card value={8} suit="orbit" t={t} />
        </div>
        <div class="art-card c">
          <Card value={13} suit="claw" t={t} />
        </div>
        <span class="art-caption">0 · 1 · 2 · 3 · 5 · 8 · 13 · 21 · 34</span>
      </div>
    </main>
  );
}
