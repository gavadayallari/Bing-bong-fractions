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

// Show landscape message for all mobile devices
function showLandscapeMessage() {
  // Check if in portrait mode
  const isPortrait = window.innerHeight > window.innerWidth;
  
  if (isPortrait) {
    // Remove any existing message first
    const existingMessage = document.getElementById('landscape-message');
    if (existingMessage) {
      document.body.removeChild(existingMessage);
    }
    
    // Create and style the overlay
    const overlay = document.createElement('div');
    overlay.id = 'landscape-message';
    
    // Create message container
    const messageContainer = document.createElement('div');
    
    // Create icon
    const icon = document.createElement('div');
    icon.innerHTML = '';
    
    // Create message text
    const message = document.createElement('div');
    message.textContent = 'Please rotate your device to landscape mode for the best experience';
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #landscape-message {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
        text-align: center;
        padding: 20px;
        box-sizing: border-box;
      }
      
      #landscape-message div:first-child {
        font-size: 48px;
        margin-bottom: 20px;
        animation: spin 2s linear infinite;
      }
      
      #landscape-message div:last-child {
        font-size: 18px;
        max-width: 300px;
        line-height: 1.5;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    
    // Append elements
    messageContainer.appendChild(icon);
    messageContainer.appendChild(message);
    overlay.appendChild(messageContainer);
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    // Add data attribute to style element for easy removal
    style.setAttribute('data-landscape-style', 'true');
    
    // Function to handle orientation change
    const handleOrientationChange = () => {
      if (!window.matchMedia('(orientation: portrait)').matches) {
        const messageToRemove = document.getElementById('landscape-message');
        const styleElement = document.querySelector('style[data-landscape-style]');
        
        if (messageToRemove && document.body.contains(messageToRemove)) {
          document.body.removeChild(messageToRemove);
        }
        
        if (styleElement) {
          document.head.removeChild(styleElement);
        }
        
        // Clean up event listeners
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleResize);
      }
    };
    
    // Handle resize for devices that might not fire orientationchange
    const handleResize = () => {
      if (window.innerWidth > window.innerHeight) {
        handleOrientationChange();
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
