/**
 * Check if we're in a secure context and clipboard API is available
 */
const isClipboardAPIAvailable = (): boolean => {
  return !!(navigator.clipboard && window.isSecureContext);
};

/**
 * Check if document.execCommand is available
 */
const isExecCommandAvailable = (): boolean => {
  return !!(document.execCommand);
};

/**
 * Utility function for copying text to clipboard with fallback support
 * Handles cases where Clipboard API is blocked by permissions policy
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Log environment info for debugging
  console.debug('Clipboard environment:', {
    isSecureContext: window.isSecureContext,
    hasNavigatorClipboard: !!navigator.clipboard,
    hasExecCommand: isExecCommandAvailable(),
    userAgent: navigator.userAgent.substring(0, 50)
  });

  // First try the legacy method as it's more reliable in restricted environments
  if (isExecCommandAvailable()) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Position off-screen but not too far to avoid issues
      textArea.style.cssText = `
        position: fixed;
        left: -1000px;
        top: -1000px;
        width: 2em;
        height: 2em;
        padding: 0;
        border: none;
        outline: none;
        box-shadow: none;
        background: transparent;
        opacity: 0;
        pointer-events: none;
      `;
      
      textArea.setAttribute('readonly', '');
      textArea.setAttribute('tabindex', '-1');
      textArea.setAttribute('aria-hidden', 'true');
      
      document.body.appendChild(textArea);
      
      // Focus and select the text
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.debug('Legacy copy method succeeded');
        return true;
      } else {
        console.warn('Legacy copy method returned false');
      }
    } catch (err) {
      console.warn('Legacy copy method failed:', err);
    }
  }

  // Try modern Clipboard API as fallback
  if (isClipboardAPIAvailable()) {
    try {
      await navigator.clipboard.writeText(text);
      console.debug('Modern Clipboard API succeeded');
      return true;
    } catch (err) {
      console.warn('Modern Clipboard API failed:', err);
      
      // Special handling for permission errors
      if (err.name === 'NotAllowedError') {
        console.error('Clipboard access denied by permissions policy');
      } else if (err.name === 'SecurityError') {
        console.error('Clipboard access denied by security policy');
      }
    }
  } else {
    console.warn('Modern Clipboard API not available');
  }

  // If both methods fail, return false
  console.error('All clipboard methods failed');
  return false;
};

/**
 * Alternative fallback that prompts user to copy manually
 */
export const promptManualCopy = (text: string): void => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
  
  if (isMobile) {
    // On mobile, show the text in a modal-like alert
    alert(`Clipboard access is blocked. Please copy this text manually:\n\n${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
  } else {
    // On desktop, create a temporary modal showing the text
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(2px);
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      max-width: 90vw;
      max-height: 80vh;
      overflow: hidden;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
    `;
    
    const title = document.createElement('h3');
    title.style.cssText = `
      margin: 0 0 16px 0;
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
    `;
    title.textContent = 'Clipboard Blocked - Copy Manually';
    
    const description = document.createElement('p');
    description.style.cssText = `
      margin: 0 0 16px 0;
      color: #6b7280;
      font-size: 14px;
      line-height: 1.5;
    `;
    description.textContent = `${getClipboardIssueMessage()} Please select all text below and copy it manually (Ctrl+C or Cmd+C):`;
    
    const textarea = document.createElement('textarea');
    textarea.style.cssText = `
      width: 100%;
      height: 300px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      resize: none;
      outline: none;
      margin-bottom: 16px;
      background: #f9fafb;
    `;
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    `;
    
    const selectAllBtn = document.createElement('button');
    selectAllBtn.style.cssText = `
      padding: 8px 16px;
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    `;
    selectAllBtn.textContent = 'Select All';
    
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
      padding: 8px 16px;
      background: #7c3aed;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    `;
    closeBtn.textContent = 'Close';
    
    // Hover effects
    selectAllBtn.addEventListener('mouseenter', () => {
      selectAllBtn.style.background = '#e5e7eb';
    });
    selectAllBtn.addEventListener('mouseleave', () => {
      selectAllBtn.style.background = '#f3f4f6';
    });
    
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#6d28d9';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = '#7c3aed';
    });
    
    // Event handlers
    selectAllBtn.addEventListener('click', () => {
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
    });
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Assemble the modal
    buttonContainer.appendChild(selectAllBtn);
    buttonContainer.appendChild(closeBtn);
    
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(textarea);
    content.appendChild(buttonContainer);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Auto-select the text and focus
    setTimeout(() => {
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
    }, 100);
  }
};

/**
 * Detect the type of clipboard issue for better user messaging
 */
export const detectClipboardIssue = (): string => {
  if (!window.isSecureContext) {
    return 'insecure-context';
  }
  if (!navigator.clipboard) {
    return 'api-not-supported';
  }
  if (!isExecCommandAvailable()) {
    return 'legacy-not-supported';
  }
  return 'permissions-blocked';
};

/**
 * Get user-friendly message based on clipboard issue
 */
export const getClipboardIssueMessage = (): string => {
  const issue = detectClipboardIssue();
  
  switch (issue) {
    case 'insecure-context':
      return 'Clipboard access requires HTTPS. Please copy the code manually.';
    case 'api-not-supported':
      return 'Your browser doesn\'t support clipboard access. Please copy the code manually.';
    case 'legacy-not-supported':
      return 'Clipboard functionality is disabled in this browser. Please copy the code manually.';
    case 'permissions-blocked':
      return 'Clipboard access is blocked by your browser settings. Please copy the code manually.';
    default:
      return 'Unable to copy to clipboard. Please copy the code manually.';
  }
};

/**
 * Higher-order function for creating copy handlers with state management
 */
export const createCopyHandler = (
  setCopiedCode: (id: string | null) => void,
  timeout: number = 2000
) => {
  return async (code: string, id: string) => {
    try {
      const success = await copyToClipboard(code);
      
      if (success) {
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), timeout);
      } else {
        // Show user-friendly manual copy interface with context
        console.info('Copy failed, showing manual interface:', getClipboardIssueMessage());
        promptManualCopy(code);
      }
    } catch (err) {
      console.error('Copy handler error:', err);
      // Still show manual copy interface even if there was an unexpected error
      promptManualCopy(code);
    }
  };
};