import "./styles/app.css";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import {
  ERROR_CODES,
  type ErrorCode,
} from "../../../packages/contracts/src/index.js";
import { translator } from "./i18n/index.js";
import {
  readPreferences,
  savePreferences,
  type Preferences,
} from "./preferences/store.js";
import { CompletionAudio } from "./preferences/audio.js";
import { applyMotion } from "./preferences/motion.js";
import { LiveClient, api, type View } from "./connection/client.js";
import { watchActivity } from "./connection/activity.js";
import { Entry } from "./ui/entry.js";
import { Table } from "./ui/table.js";
import { Settings } from "./ui/settings.js";
import { Privacy } from "./ui/privacy.js";
import { SuitIcon } from "./ui/suits.js";
import { Loading } from "./ui/loading.js";
export function App() {
  const [preferences, setPreferences] = useState(readPreferences),
    [settings, setSettings] = useState(false),
    [busy, setBusy] = useState(false),
    [boot, setBoot] = useState<"loading" | "ready" | "error">("loading"),
    [bootAttempt, setBootAttempt] = useState(0),
    [restoring, setRestoring] = useState(false),
    [error, setError] = useState<ErrorCode | null>(null),
    [audioBlocked, setAudioBlocked] = useState(false),
    [view, setView] = useState<View | null>(null);
  const client = useRef<LiveClient | null>(null),
    audio = useRef(new CompletionAudio()),
    prefs = useRef(preferences);
  prefs.current = preferences;
  const t = translator(preferences.locale);
  const tableId = /^\/t\/([^/]+)$/.exec(location.pathname)?.[1];
  const privacy = location.pathname === "/privacy";
  const join = (id: string, name?: string) => {
    client.current?.stop();
    client.current = new LiveClient(id, name, setView, (event) =>
      audio.current.play(event, prefs.current.sound),
    );
    void client.current.connect();
  };
  useLayoutEffect(() => {
    document.documentElement.lang = preferences.locale;
    return applyMotion(preferences.reduceMotion);
  }, [preferences.locale, preferences.reduceMotion]);
  useEffect(() => savePreferences(preferences), [preferences]);
  useEffect(() => {
    let alive = true;
    if (!privacy)
      void (async () => {
        setBoot("loading");
        setError(null);
        try {
          await api("session", {});
          if (!alive) return;
          if (tableId) {
            const meta = await api("tables/" + tableId);
            if (alive && meta.member) {
              setRestoring(true);
              join(tableId, (meta.member as { name: string }).name);
            }
          }
          if (alive) setBoot("ready");
        } catch (e) {
          if (alive) {
            setBoot("error");
            setError(
              ERROR_CODES.find(
                (c) => c === (e instanceof Error ? e.message : ""),
              ) ?? "STORAGE_UNAVAILABLE",
            );
          }
        }
      })();
    else setBoot("ready");
    return () => { alive = false; };
  }, [bootAttempt]);
  useEffect(() => {
    const unwatch = watchActivity(() => {
      client.current?.activity();
      if (prefs.current.sound) void audio.current.unlock();
    });
    return () => {
      unwatch();
      client.current?.stop();
    };
  }, []);
  const changePreferences = (next: Preferences) => {
    setPreferences(next);
    if (next.sound)
      void audio.current.unlock().then((ok) => setAudioBlocked(!ok));
  };
  const submit = async (name: string) => {
    if (busy || view?.status === "connecting" || view?.status === "reconnecting") return;
    setBusy(true);
    setError(null);
    try {
      if (tableId) join(tableId, name);
      else {
        const data = await api("tables", {});
        history.pushState({}, "", String(data.path));
        join(String(data.tableId), name);
      }
    } catch (e) {
      setError(
        ERROR_CODES.find((c) => c === (e instanceof Error ? e.message : "")) ??
          "STORAGE_UNAVAILABLE",
      );
    } finally {
      setBusy(false);
    }
  };
  const failure = view?.error ?? error;
  const loadingScreen = !privacy && (boot !== "ready" || (restoring && !view?.own));
  const connecting = view?.status === "connecting" || view?.status === "reconnecting";
  const loadingMessage = boot === "loading"
    ? t(tableId ? "loading" : "preparing")
    : connecting ? t(view.status)
      : failure ? t(failure) : t(view?.status ?? "loading");
  const retryLoading = () => {
    if (failure === "CLIENT_OUTDATED" || failure === "SESSION_EXPIRED") {
      location.reload();
    } else if (boot === "error") {
      setBootAttempt((attempt) => attempt + 1);
    } else {
      client.current?.retry();
    }
  };
  return (
    <>
      <header class="site-header">
        <a class="brand" href="/">
          <SuitIcon suit="ember" />
          <span>{t("brand")}</span>
        </a>
        <button
          class="settings-button"
          onClick={() => setSettings(true)}
          aria-label={t("settings")}
        >
          <span aria-hidden="true">⚙</span>
          <span>{t("settings")}</span>
        </button>
      </header>
      {failure && !loadingScreen && (
        <div class="error-banner" role="alert">
          {t(failure)}
          {failure === "CLIENT_OUTDATED" && (
            <button onClick={() => location.reload()}>{t("reload")}</button>
          )}
        </div>
      )}
      {audioBlocked && (
        <div class="notice" role="status">
          {t("audioBlocked")}
        </div>
      )}
      {view?.state && view.status !== "live" && (
        <div class="connection-banner" role="status">
          <span>
            {t(view.status)}
            {view.state && <small>{t("readonly")}</small>}
          </span>
          {["idle", "replaced", "disconnected"].includes(view.status) && (
            <button class="secondary" onClick={() => client.current?.retry()}>
              {t(view.status === "idle" ? "resume" : "retry")}
            </button>
          )}
          {view.status === "CLIENT_OUTDATED" && (
            <button onClick={() => location.reload()}>{t("reload")}</button>
          )}
        </div>
      )}
      {privacy ? (
        <Privacy t={t} />
      ) : loadingScreen ? (
        <Loading
          pending={boot === "loading" || (boot === "ready" && !!connecting)}
          message={loadingMessage}
          onRetry={failure === "TABLE_NOT_FOUND" ? undefined : retryLoading}
          t={t}
        />
      ) : view?.state && view.own ? (
        <Table
          view={view}
          onAction={(action) => client.current?.send(action)}
          t={t}
        />
      ) : (
        <Entry
          joining={!!tableId}
          busy={
            busy ||
            view?.status === "connecting" ||
            view?.status === "reconnecting"
          }
          onSubmit={(name) => {
            void submit(name);
          }}
          t={t}
        />
      )}
      <footer>
        <span>{t("brand")}</span>
        <a href="/privacy">{t("privacy")}</a>
      </footer>
      <Settings
        open={settings}
        onClose={() => setSettings(false)}
        preferences={preferences}
        onChange={changePreferences}
        suit={view?.state?.suit}
        onSuit={(suit) =>
          client.current?.send({ type: "setSuit", payload: { suit } })
        }
        disabled={!view || view.status !== "live" || view.pending}
        t={t}
      />
    </>
  );
}
