// Quick viewport refresh for mobile
function quickViewportRefresh() {
  // Trigger resize event immediately
  window.dispatchEvent(new Event('resize'));
  
  // Quick DOM refresh
  const body = document.body;
  const display = body.style.display;
  body.style.display = 'none';
  void body.offsetHeight; // Force reflow
  body.style.display = display || '';
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOSUA = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isIOSUA || isIPadOS;
}

export async function handleFullscreenToggle(target?: HTMLElement) {
  if (typeof document === "undefined") return;

  const element = target ?? document.documentElement;

  try {
    if (!document.fullscreenElement) {
      // Request fullscreen
      await element.requestFullscreen();
      
      // On mobile devices, also try to lock orientation to landscape
      if (!isIOS() && 'screen' in window && 'orientation' in screen) {
        const orientation = (screen as any).orientation;
        if (orientation && typeof orientation.lock === 'function') {
          try {
            await orientation.lock('landscape');
            
            // Quick refresh after orientation lock
            setTimeout(quickViewportRefresh, 100);
            
          } catch (orientationError) {
            console.log('Could not lock orientation:', orientationError);
          }
        }
      }
      
      // Immediate viewport refresh for mobile
      setTimeout(quickViewportRefresh, 50);
      
    } else {
      // Exit fullscreen
      await document.exitFullscreen();
      
      // Unlock orientation when exiting fullscreen
      if (!isIOS() && 'screen' in window && 'orientation' in screen) {
        const orientation = (screen as any).orientation;
        if (orientation && typeof orientation.unlock === 'function') {
          try {
            orientation.unlock();
            
            // Quick refresh after orientation unlock
            setTimeout(quickViewportRefresh, 100);
            
          } catch (orientationError) {
            console.log('Could not unlock orientation:', orientationError);
          }
        }
      }
      
      // Immediate viewport refresh for mobile
      setTimeout(quickViewportRefresh, 50);
    }
  } catch (error) {
    console.log('Fullscreen toggle failed:', error);
  }
}
