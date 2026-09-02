import type { HistoryItem } from '../shared/types';
import { STORAGE_KEYS } from '../shared/types';

const MAX_HISTORY = 20;

export async function getHistory(): Promise<HistoryItem[]> {
  const stored = await browser.storage.local.get(STORAGE_KEYS.history);
  return (stored[STORAGE_KEYS.history] as HistoryItem[] | undefined) ?? [];
}

export async function addHistory(item: HistoryItem) {
  const current = await getHistory();
  const next = [item, ...current.filter((entry) => entry.id !== item.id)].slice(
    0,
    MAX_HISTORY,
  );
  await browser.storage.local.set({ [STORAGE_KEYS.history]: next });
  return next;
}

export async function deleteHistory(id: string) {
  const current = await getHistory();
  const next = current.filter((item) => item.id !== id);
  await browser.storage.local.set({ [STORAGE_KEYS.history]: next });
  return next;
}

export async function clearHistory() {
  await browser.storage.local.remove(STORAGE_KEYS.history);
  return [] as HistoryItem[];
}
