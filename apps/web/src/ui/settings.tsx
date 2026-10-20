import { useLayoutEffect, useRef } from "preact/hooks";
import { SUITS, type Suit } from "../../../../packages/contracts/src/index.js";
import type { Preferences } from "../preferences/store.js";
import type { Translate } from "../i18n/index.js";
import { SuitIcon } from "./suits.js";
export function Settings({
  open,
  onClose,
  preferences,
  onChange,
  suit,
  onSuit,
  disabled,
  t,
}: {
  open: boolean;
  onClose: () => void;
  preferences: Preferences;
  onChange: (value: Preferences) => void;
  suit?: Suit;
  onSuit?: (suit: Suit) => void;
  disabled: boolean;
  t: Translate;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open) {
      opener.current = document.activeElement as HTMLElement | null;
      ref.current?.showModal();
    } else if (ref.current?.open) {
      ref.current.close();
      opener.current?.focus();
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      class="settings"
      aria-labelledby="settings-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const elements = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), select:not(:disabled), input:not(:disabled), a[href]')];
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onClose={onClose}
    >
      <div class="dialog-heading">
        <h2 id="settings-title">{t("settings")}</h2>
        <button class="icon-button" aria-label={t("close")} onClick={onClose}>
          ×
        </button>
      </div>
      <label class="setting-row">
        {t("language")}
        <select
          aria-label={t("language")}
          value={preferences.locale}
          onChange={(e) =>
            onChange({
              ...preferences,
              locale: e.currentTarget.value as "pt" | "en",
            })
          }
        >
          <option value="pt">{t("portuguese")}</option>
          <option value="en">{t("english")}</option>
        </select>
      </label>
      <label class="setting-row">
        <span>
          {t("sound")}
          <small>{t("soundHint")}</small>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={preferences.sound}
          onChange={(e) =>
            onChange({ ...preferences, sound: e.currentTarget.checked })
          }
        />
      </label>
      <label class="setting-row">
        <span>
          {t("reduceMotion")}
          <small>{t("motionHint")}</small>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={preferences.reduceMotion}
          onChange={(e) =>
            onChange({ ...preferences, reduceMotion: e.currentTarget.checked })
          }
        />
      </label>
      {suit && (
        <fieldset disabled={disabled}>
          <legend>{t("suit")}</legend>
          <p>{t("sharedSuit")}</p>
          <div class="suit-choices">
            {SUITS.map((value) => (
              <label class={value === suit ? "active" : ""} key={value}>
                <input
                  type="radio"
                  name="suit"
                  value={value}
                  checked={value === suit}
                  onChange={() => onSuit?.(value)}
                />
                <SuitIcon suit={value} />
                <span>{t(value)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <a class="privacy-link" href="/privacy">
        {t("privacy")}
      </a>
    </dialog>
  );
}
