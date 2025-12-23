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

// Show landscape message for mobile devices
function showLandscapeMessage() {
  // Check if in portrait mode
  const isPortrait = window.innerHeight > window.innerWidth;
  
  if (isPortrait) {
    // Remove any existing message first
    const existingMessage = document.getElementById('landscape-message');
    if (existingMessage) {
      document.body.removeChild(existingMessage);
    }
    
    // Create message element
    const message = document.createElement('div');
    message.id = 'landscape-message';
    message.innerHTML = '� Rotate your device to landscape for the best experience';
    
    // Style the message
    Object.assign(message.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      maxWidth: '400px',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.85)',
      color: 'white',
      textAlign: 'center',
      borderRadius: '10px',
      zIndex: '9999',
      fontSize: '18px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px'
    });
    
    // Add icon
    const icon = document.createElement('div');
    icon.innerHTML = '🔄';
    icon.style.fontSize = '40px';
    icon.style.animation = 'spin 2s linear infinite';
    
    // Add text
    const text = document.createElement('div');
    text.textContent = 'Rotate your device to landscape for the best experience';
    
    // Add styles for animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    // Append elements
    message.appendChild(icon);
    message.appendChild(text);
    document.body.appendChild(message);
    
    // Add orientation change listener to remove message when landscape
    const handleOrientationChange = () => {
      if (!window.matchMedia('(orientation: portrait)').matches) {
        const messageToRemove = document.getElementById('landscape-message');
        if (messageToRemove && document.body.contains(messageToRemove)) {
          document.body.removeChild(messageToRemove);
          window.removeEventListener('orientationchange', handleOrientationChange);
          
          // Also remove the animation style
          const styleElement = document.querySelector('style[data-landscape-style]');
          if (styleElement) {
            document.head.removeChild(styleElement);
          }
        }
      }
    };
    
    // Add data attribute to style element for easy removal
    style.setAttribute('data-landscape-style', 'true');
    
    // Add event listener for orientation change
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Also check on window resize (for devices that don't fire orientationchange)
    const handleResize = () => {
      if (window.innerWidth > window.innerHeight) {
        handleOrientationChange();
        window.removeEventListener('resize', handleResize);
      }
    };
    
    window.addEventListener('resize', handleResize);
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
