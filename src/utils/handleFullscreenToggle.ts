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

// iPhone-specific orientation handling
function handleiOSOrientation() {
  if (!isIOS()) return;
  
  // Force iOS to show rotation prompt
  const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (meta) {
    const originalContent = meta.content;
    
    // Temporarily change viewport to trigger orientation
    meta.content = 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover';
    
    // Add iOS-specific meta tags if not present
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const appleMeta = document.createElement('meta');
      appleMeta.name = 'apple-mobile-web-app-capable';
      appleMeta.content = 'yes';
      document.head.appendChild(appleMeta);
    }
    
    if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
      const statusMeta = document.createElement('meta');
      statusMeta.name = 'apple-mobile-web-app-status-bar-style';
      statusMeta.content = 'black-translucent';
      document.head.appendChild(statusMeta);
    }
    
    // Force reflow
    setTimeout(() => {
      meta.content = originalContent;
      quickViewportRefresh();
    }, 100);
  }
  
  // Show iOS rotation instruction
  showRotationPrompt();
}

// Show rotation instruction for iOS users
function showRotationPrompt() {
  if (!isIOS()) return;
  
  const existingPrompt = document.getElementById('ios-rotation-prompt');
  if (existingPrompt) return;
  
  const prompt = document.createElement('div');
  prompt.id = 'ios-rotation-prompt';
  prompt.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
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
        font-size: 3rem;
        margin-bottom: 1rem;
        animation: rotate 2s infinite linear;
      ">📱</div>
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Please Rotate Your Device</h2>
      <p style="font-size: 1rem; opacity: 0.8;">Turn your phone to landscape mode for the best gaming experience</p>
      <button onclick="this.parentElement.parentElement.remove()" style="
        margin-top: 2rem;
        padding: 0.75rem 1.5rem;
        background: #007AFF;
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-size: 1rem;
        cursor: pointer;
      ">Continue Anyway</button>
    </div>
    <style>
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(90deg); }
      }
    </style>
  `;
  
  document.body.appendChild(prompt);
  
  // Auto-remove when orientation changes to landscape
  const checkOrientation = () => {
    if (window.orientation === 90 || window.orientation === -90) {
      prompt.remove();
      window.removeEventListener('orientationchange', checkOrientation);
    }
  };
  
  window.addEventListener('orientationchange', checkOrientation);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.getElementById('ios-rotation-prompt')) {
      prompt.remove();
    }
  }, 10000);
}

export async function handleFullscreenToggle(target?: HTMLElement) {
  if (typeof document === "undefined") return;

  const element = target ?? document.documentElement;

  try {
    if (!document.fullscreenElement) {
      // Request fullscreen
      await element.requestFullscreen();
      
      // Special handling for iOS devices
      if (isIOS()) {
        handleiOSOrientation();
      } else {
        // Standard orientation lock for other devices
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
      
      // Remove iOS prompt if exists
      const prompt = document.getElementById('ios-rotation-prompt');
      if (prompt) prompt.remove();
      
      // Standard orientation unlock for non-iOS devices
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
