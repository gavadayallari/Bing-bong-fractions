export async function handleFullscreenToggle(target?: HTMLElement) {
  if (typeof document === "undefined") return;

  const element = target ?? document.documentElement;

  try {
    if (!document.fullscreenElement) {
      await element.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {
    // silently fail
  }
}
