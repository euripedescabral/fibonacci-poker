export function applyMotion(reduced: boolean): () => void {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const update = () => {
    document.documentElement.dataset.reducedMotion = String(
      reduced || media.matches,
    );
  };
  update();
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
}
