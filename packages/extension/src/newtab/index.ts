chrome.storage.local.get('boardbackNewTab', ({ boardbackNewTab }) => {
  if (boardbackNewTab) {
    window.location.replace('https://boardback-web.vercel.app');
  }
});
