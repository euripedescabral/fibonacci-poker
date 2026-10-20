export function watchActivity(active: () => void): () => void {
  let last = 0;
  const onActivity = (event: Event) => {
    if (!event.isTrusted) return;
    const now = Date.now();
    if (now - last < 1000) return;
    last = now;
    active();
  };
  for (const name of ["pointerdown", "keydown", "touchstart"])
    window.addEventListener(name, onActivity, { passive: true });
  return () => {
    for (const name of ["pointerdown", "keydown", "touchstart"])
      window.removeEventListener(name, onActivity);
  };
}
