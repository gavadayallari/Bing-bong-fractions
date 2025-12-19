export async function handleFullscreenToggle(target?: HTMLElement) {
  if (typeof document === "undefined") return;

  const element = target ?? document.documentElement;

  try {
    if (!document.fullscreenElement) {
      // Request fullscreen
      await element.requestFullscreen();
      
      // On mobile devices, also try to lock orientation to landscape
      if ('screen' in window && 'orientation' in screen) {
        const orientation = (screen as any).orientation;
        if (orientation && typeof orientation.lock === 'function') {
          try {
            await orientation.lock('landscape');
          } catch (orientationError) {
            // Orientation lock might fail, that's okay
            console.log('Could not lock orientation:', orientationError);
          }
        }
      }
    } else {
      // Exit fullscreen
      await document.exitFullscreen();
      
      // Unlock orientation when exiting fullscreen
      if ('screen' in window && 'orientation' in screen) {
        const orientation = (screen as any).orientation;
        if (orientation && typeof orientation.unlock === 'function') {
          try {
            orientation.unlock();
          } catch (orientationError) {
            // Orientation unlock might fail, that's okay
            console.log('Could not unlock orientation:', orientationError);
          }
        }
      }
    }
  } catch (error) {
    // silently fail
    console.log('Fullscreen toggle failed:', error);
  }
}
