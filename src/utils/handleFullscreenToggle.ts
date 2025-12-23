// Quick viewport refresh for mobile
function quickViewportRefresh() {
  // Trigger resize event immediately
  window.dispatchEvent(new Event('resize'));
  
  // Quick DOM refresh
  const body = document.body;
  const display = body.style.display;
  body.style.display = 'none';
  body.offsetHeight; // Force reflow
  body.style.display = display || '';
}

// Show landscape message for iPhone users
function showLandscapeMessage() {
  // Check if iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  if (!isIOS) return;
  
  // Check if in portrait mode
  const isPortrait = window.innerHeight > window.innerWidth;
  
  if (isPortrait) {
    // Create message element if it doesn't exist
    let message = document.getElementById('landscape-message');
    
    if (!message) {
      message = document.createElement('div');
      message.id = 'landscape-message';
      message.innerHTML = '🔁 Rotate your device to landscape for the best experience';
      message.style.position = 'fixed';
      message.style.top = '0';
      message.style.left = '0';
      message.style.width = '100%';
      message.style.padding = '15px';
      message.style.background = 'rgba(0, 0, 0, 0.8)';
      message.style.color = 'white';
      message.style.textAlign = 'center';
      message.style.zIndex = '9999';
      message.style.fontSize = '16px';
      document.body.appendChild(message);
      
      // Add orientation change listener to remove message when landscape
      const handleOrientationChange = () => {
        if (!window.matchMedia('(orientation: portrait)').matches) {
          if (message && document.body.contains(message)) {
            document.body.removeChild(message);
            window.removeEventListener('orientationchange', handleOrientationChange);
          }
        }
      };
      
      window.addEventListener('orientationchange', handleOrientationChange);
    }
  }
}

export async function handleFullscreenToggle(target?: HTMLElement) {
  if (typeof document === "undefined") return;
  
  // Show landscape message for iPhone users
  if (typeof window !== 'undefined') {
    showLandscapeMessage();
  }

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
      if ('screen' in window && 'orientation' in screen) {
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
