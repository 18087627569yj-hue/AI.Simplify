import type { PendingImage } from '../src/shared/types';
import { STORAGE_KEYS } from '../src/shared/types';

const MENU_ID = 'prompt-lens-reverse';

function createContextMenu() {
  void browser.contextMenus
    .removeAll()
    .then(() => {
      browser.contextMenus.create({
        id: MENU_ID,
        title: '反推提示词',
        contexts: ['image'],
      });
    })
    .catch(console.error);
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    createContextMenu();
    browser.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch(console.error);
  });

  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== MENU_ID || !info.srcUrl) return;

    const image: PendingImage = {
      id: crypto.randomUUID(),
      src: info.srcUrl,
      source: 'web',
      createdAt: Date.now(),
      pageUrl: info.pageUrl ?? tab?.url,
      pageTitle: tab?.title,
    };

    void browser.storage.local.set({ [STORAGE_KEYS.pendingImage]: image });

    if (tab?.windowId !== undefined) {
      void browser.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
    }
  });
});
