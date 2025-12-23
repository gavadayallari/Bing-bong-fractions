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

// Detect if device is iPhone/iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Detect if device is Android
function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

// Show portrait-only message for iPhone users
function showiOSPortraitMessage() {
  const existingMessage = document.getElementById('ios-portrait-message');
  if (existingMessage) return;
  
  const message = document.createElement('div');
  message.id = 'ios-portrait-message';
  message.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      text-align: center;
      padding: 2rem;
    ">
      <div style="
        font-size: 4rem;
        margin-bottom: 1.5rem;
        animation: bounce 1s infinite;
      ">📱</div>
      <h2 style="font-size: 1.8rem; margin-bottom: 1rem; font-weight: 600;">Please Use Portrait Mode</h2>
      <p style="font-size: 1.1rem; opacity: 0.9; line-height: 1.5; max-width: 300px;">
        This game is designed for portrait orientation on iPhone. Please rotate your device back to portrait mode.
      </p>
      <div style="
        margin-top: 2rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
      ">
        <p style="font-size: 0.9rem; opacity: 0.8;">
          🔄 Rotate your phone to portrait<br>
          📱 Hold vertically for best experience
        </p>
      </div>
    </div>
    <style>
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
    </style>
  `;
  
  document.body.appendChild(message);
  
  // Auto-remove when orientation changes to portrait
  const checkOrientation = () => {
    if (window.orientation === 0 || window.orientation === 180) {
      message.remove();
      window.removeEventListener('orientationchange', checkOrientation);
    }
  };
  
  window.addEventListener('orientationchange', checkOrientation);
}

export async function handleFullscreenToggle(target?: HTMLElement) {
  if (typeof document === "undefined") return;

  const element = target ?? document.documentElement;

  try {
    if (!document.fullscreenElement) {
      // Request fullscreen
      await element.requestFullscreen();
      
      // Different behavior for iOS vs Android
      if (isIOS()) {
        // iPhone: Keep in portrait, don't rotate
        console.log('iPhone detected: Staying in portrait mode');
        // No orientation lock for iOS - let it stay in current orientation
        
      } else if (isAndroid()) {
        // Android: Try to rotate to landscape
        console.log('Android detected: Attempting landscape rotation');
        if ('screen' in window && 'orientation' in screen) {
          const orientation = (screen as any).orientation;
          if (orientation && typeof orientation.lock === 'function') {
            try {
              await orientation.lock('landscape');
              setTimeout(quickViewportRefresh, 100);
            } catch (orientationError) {
              console.log('Could not lock orientation:', orientationError);
            }
          }
        }
      } else {
        // Other devices: Try landscape
        if ('screen' in window && 'orientation' in screen) {
          const orientation = (screen as any).orientation;
          if (orientation && typeof orientation.lock === 'function') {
            try {
              await orientation.lock('landscape');
              setTimeout(quickViewportRefresh, 100);
            } catch (orientationError) {
              console.log('Could not lock orientation:', orientationError);
            }
          }
        }
      }
      
      // Immediate viewport refresh for mobile
      setTimeout(quickViewportRefresh, 50);
      
    } else {
      // Exit fullscreen
      await document.exitFullscreen();
      
      // Remove iOS message if exists
      const message = document.getElementById('ios-portrait-message');
      if (message) message.remove();
      
      // Unlock orientation for non-iOS devices
      if (!isIOS() && 'screen' in window && 'orientation' in screen) {
        const orientation = (screen as any).orientation;
        if (orientation && typeof orientation.unlock === 'function') {
          try {
            orientation.unlock();
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
