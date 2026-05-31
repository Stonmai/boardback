// Signal to the web app that this extension is installed
document.documentElement.setAttribute('data-whiteboard-ext', 'true');

let contextInvalidated = false;

async function sendPendingCaptures() {
  if (contextInvalidated) return;
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PENDING_CAPTURES' });
    if (response && response.length > 0) {
      console.log(`[Content Script] Received ${response.length} captures, dispatching to app.`);
      window.dispatchEvent(new CustomEvent('WHITEBOARD_SYNC_RESPONSE', { detail: response }));
    }
  } catch (error: any) {
    if (error?.message?.includes('Extension context invalidated')) {
      contextInvalidated = true;
    }
  }
}

// Custom event listener for the web app to trigger a sync
window.addEventListener('WHITEBOARD_SYNC_REQUEST', sendPendingCaptures);

// Relay full data updates from the web app to extension storage
window.addEventListener('BOARDBACK_DATA_UPDATE', async (event: any) => {
  if (contextInvalidated) return;
  try {
    const data = event.detail;
    if (data && typeof data === 'object') {
      await chrome.runtime.sendMessage({ type: 'UPDATE_DATA', data });
    }
  } catch (error: any) {
    if (error?.message?.includes('Extension context invalidated')) {
      contextInvalidated = true;
    }
  }
});

// Relay theme updates from the web app to extension storage
window.addEventListener('BOARDBACK_THEME_UPDATE', async (event: any) => {
  if (contextInvalidated) return;
  try {
    const theme = event.detail;
    await chrome.runtime.sendMessage({ type: 'UPDATE_THEME', theme });
  } catch (error: any) {
    if (error?.message?.includes('Extension context invalidated')) {
      contextInvalidated = true;
    }
  }
});

// Notify the web app that the extension content script is ready.
// The web app listens for this event to trigger an immediate sync,
// handling the case where the content script loads after React has already mounted.
window.dispatchEvent(new CustomEvent('WHITEBOARD_EXT_READY'));
