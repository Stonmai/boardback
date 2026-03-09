const NEW_TAB_PREFIXES = ['chrome://newtab', 'vivaldi://newtab', 'about:newtab'];

// Detect Vivaldi via user agent OR its exclusive chrome.vivaldi API
const isVivaldi = navigator.userAgent.includes('Vivaldi') || !!(globalThis as any).chrome?.vivaldi;

// Vivaldi exposes its internal vivaldi:// pages as chrome:// to extensions.
// Map them back so captured URLs reflect what the user actually sees.
const normalizeUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (isVivaldi && url.startsWith('chrome://')) {
    return 'vivaldi://' + url.slice('chrome://'.length);
  }
  return url;
};

const isNewTabUrl = (url: string) =>
  NEW_TAB_PREFIXES.some(prefix => url.startsWith(prefix));

chrome.tabs.onCreated.addListener(async (tab) => {
  const url = tab.pendingUrl || tab.url || '';
  // Empty URL on creation also means a fresh new tab in many Chromium browsers
  if (url !== '' && !isNewTabUrl(url)) return;
  const { boardbackNewTab } = await chrome.storage.local.get('boardbackNewTab');
  if (boardbackNewTab && tab.id !== undefined) {
    chrome.tabs.update(tab.id, { url: 'https://boardback-web.vercel.app' });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  const url = changeInfo.url || '';
  if (!isNewTabUrl(url)) return;
  const { boardbackNewTab } = await chrome.storage.local.get('boardbackNewTab');
  if (boardbackNewTab) {
    chrome.tabs.update(tabId, { url: 'https://boardback-web.vercel.app' });
  }
});

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message.type === 'BOARDBACK_PING') {
    sendResponse({ installed: true, version: chrome.runtime.getManifest().version });
  }

  if (message.type === 'GET_NEW_TAB') {
    chrome.storage.local.get('boardbackNewTab', ({ boardbackNewTab }) => {
      sendResponse({ enabled: !!boardbackNewTab });
    });
    return true;
  }

  if (message.type === 'SET_NEW_TAB') {
    chrome.storage.local.set({ boardbackNewTab: message.enabled }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_TAB') {
    captureTab(message.tags, message.roomId).then(sendResponse);
    return true; // Keep channel open for async response
  }

  if (message.type === 'CAPTURE_ALL_TABS') {
    captureAllTabs(message.roomId).then(sendResponse);
    return true;
  }

  if (message.type === 'GET_PENDING_CAPTURES') {
    getAndClearPendingCaptures().then(sendResponse);
    return true;
  }

  if (message.type === 'UPDATE_ROOMS') {
    chrome.storage.local.set({ boardbackRooms: message.rooms }).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === 'GET_ROOMS') {
    chrome.storage.local.get('boardbackRooms').then(({ boardbackRooms }) => {
      sendResponse(boardbackRooms || []);
    });
    return true;
  }
});

async function getAndClearPendingCaptures() {
  const result = await chrome.storage.local.get('pendingCaptures');
  const pendingCaptures: any[] = Array.isArray(result.pendingCaptures) ? result.pendingCaptures : [];
  if (pendingCaptures.length > 0) {
    console.log(`[Background] Sending ${pendingCaptures.length} captures to whiteboard.`);
    await chrome.storage.local.set({ pendingCaptures: [] });
  }
  return pendingCaptures;
}

async function captureTab(tags?: string[], roomId?: string) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('No active tab found');

    let screenshot = '';
    try {
      screenshot = await chrome.tabs.captureVisibleTab({ format: 'jpeg', quality: 80 });
    } catch (_) {
      // Screenshot unavailable (restricted page, window not focused, etc.) — capture metadata only
    }
    const metadata = await extractMetadata(tab.id!);

    const captureData = {
      title: tab.title,
      url: normalizeUrl(tab.url),
      favicon: tab.favIconUrl,
      screenshot,
      description: metadata?.description || '',
      ogImage: metadata?.ogImage || '',
      tags: tags || [],
      roomId: roomId || null,
      timestamp: new Date().toISOString()
    };

    // Store in storage.local for web app to pick up
    const r1 = await chrome.storage.local.get('pendingCaptures');
    const pendingCaptures: any[] = Array.isArray(r1.pendingCaptures) ? r1.pendingCaptures : [];
    const updatedCaptures = [...pendingCaptures, captureData];
    await chrome.storage.local.set({
      pendingCaptures: updatedCaptures
    });

    console.log('[Background] Capture successful. Pending count:', updatedCaptures.length);
    return { success: true, count: 1 };
  } catch (error: any) {
    console.error('Capture failed:', error);
    return { success: false, error: error.message };
  }
}

async function captureAllTabs(roomId?: string) {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    let count = 0;

    for (const tab of tabs) {
      // Some browsers (Vivaldi) return empty tab.url for internal pages — fall back to pendingUrl or title
      const rawUrl = tab.url || tab.pendingUrl || '';
      if (!rawUrl && !tab.title) continue;
      const normalizedTabUrl = rawUrl ? normalizeUrl(rawUrl) : '';
      if (normalizedTabUrl.includes('boardback-web.vercel.app')) continue;
      if (normalizedTabUrl.includes('whitebroawd-web.vercel.app')) continue;

      const metadata = await extractMetadata(tab.id!);

      const captureData = {
        title: tab.title || normalizedTabUrl || 'Untitled',
        url: normalizedTabUrl,
        favicon: tab.favIconUrl,
        description: metadata?.description || '',
        ogImage: metadata?.ogImage || '',
        roomId: roomId || null,
        timestamp: new Date().toISOString()
      };

      const r2 = await chrome.storage.local.get('pendingCaptures');
      const pendingCaptures: any[] = Array.isArray(r2.pendingCaptures) ? r2.pendingCaptures : [];
      await chrome.storage.local.set({
        pendingCaptures: [...pendingCaptures, captureData]
      });
      count++;
    }

    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function extractMetadata(tabId: number) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const getMeta = (name: string) =>
          document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ||
          document.querySelector(`meta[property="${name}"]`)?.getAttribute('content');

        return {
          description: getMeta('description') || getMeta('og:description') || '',
          ogImage: getMeta('og:image') || '',
        };
      }
    });

    return results[0].result;
  } catch (e) {
    return { description: '', ogImage: '' };
  }
}
