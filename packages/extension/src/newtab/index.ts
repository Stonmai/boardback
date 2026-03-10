import { APP_URL } from '../config';

chrome.storage.local.get('boardbackNewTab', ({ boardbackNewTab }) => {
  if (boardbackNewTab) {
    window.location.replace(APP_URL);
  }
});
