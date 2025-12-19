// Force viewport refresh on mobile devices
function forceViewportRefresh() {
  // Force a reflow by temporarily changing viewport
  const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (viewport) {
    const originalContent = viewport.content;
    viewport.content = 'width=1';
    // Force reflow
    viewport.offsetHeight;
    viewport.content = originalContent;
  }
  
  // Also trigger a resize event
  window.dispatchEvent(new Event('resize'));
  
  // Force repaint
  document.body.style.display = 'none';
  document.body.offsetHeight; // Force reflow
  document.body.style.display = '';
}

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
            
            // Wait a bit for orientation to change, then refresh viewport
            setTimeout(() => {
              forceViewportRefresh();
            }, 500);
            
          } catch (orientationError) {
            // Orientation lock might fail, that's okay
            console.log('Could not lock orientation:', orientationError);
          }
        }
      }
      
      // Force viewport refresh for mobile
      setTimeout(() => {
        forceViewportRefresh();
      }, 300);
      
    } else {
      // Exit fullscreen
      await document.exitFullscreen();
      
      // Unlock orientation when exiting fullscreen
      if ('screen' in window && 'orientation' in screen) {
        const orientation = (screen as any).orientation;
        if (orientation && typeof orientation.unlock === 'function') {
          try {
            orientation.unlock();
            
            // Wait a bit for orientation to change, then refresh viewport
            setTimeout(() => {
              forceViewportRefresh();
            }, 500);
            
          } catch (orientationError) {
            // Orientation unlock might fail, that's okay
            console.log('Could not unlock orientation:', orientationError);
          }
        }
      }
      
      // Force viewport refresh for mobile
      setTimeout(() => {
        forceViewportRefresh();
      }, 300);
    }
  } catch (error) {
    // silently fail
    console.log('Fullscreen toggle failed:', error);
  }
}
