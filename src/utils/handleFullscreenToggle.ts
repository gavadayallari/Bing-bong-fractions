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

// Show portrait mode message for all mobile devices
function showLandscapeMessage() {
  // Check if in landscape mode
  const isLandscape = window.innerWidth > window.innerHeight;
  
  if (isLandscape) {
    // Remove any existing message first
    const existingMessage = document.getElementById('portrait-message');
    if (existingMessage) {
      document.body.removeChild(existingMessage);
    }
    
    // Create and style the overlay
    const overlay = document.createElement('div');
    overlay.id = 'portrait-message';
    
    // Create message container
    const messageContainer = document.createElement('div');
    
    // Create icon
    const icon = document.createElement('div');
    icon.innerHTML = '📱';
    
    // Create message text
    const message = document.createElement('div');
    message.textContent = 'Please rotate your device to portrait mode to play';
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #portrait-message {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #4a6bff 0%, #2a3f9d 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
        text-align: center;
        padding: 20px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      #portrait-message div:first-child {
        font-size: 64px;
        margin-bottom: 30px;
        animation: pulse 2s infinite;
      }
      
      #portrait-message div:last-child {
        font-size: 20px;
        font-weight: 500;
        max-width: 280px;
        line-height: 1.5;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    
    // Append elements
    messageContainer.appendChild(icon);
    messageContainer.appendChild(message);
    overlay.appendChild(messageContainer);
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    // Add data attribute to style element for easy removal
    style.setAttribute('data-portrait-style', 'true');
    
    // Function to check orientation and update UI
    const checkOrientation = () => {
      const isNowPortrait = window.innerHeight > window.innerWidth;
      
      if (isNowPortrait) {
        const messageToRemove = document.getElementById('portrait-message');
        const styleElement = document.querySelector('style[data-portrait-style]');
        
        if (messageToRemove && document.body.contains(messageToRemove)) {
          document.body.removeChild(messageToRemove);
        }
        
        if (styleElement) {
          document.head.removeChild(styleElement);
        }
        
        // Clean up event listeners
        window.removeEventListener('orientationchange', checkOrientation);
        window.removeEventListener('resize', checkOrientation);
      }
    };
    
    // Add event listeners
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);
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
