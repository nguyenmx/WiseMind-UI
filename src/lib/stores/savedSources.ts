import { writable } from "svelte/store";
import { browser } from "$app/environment";
import type { WiseMindSource } from "$lib/utils/marked";

export type SavedSource = WiseMindSource & { savedAt: number; conversationId?: string };

const STORAGE_KEY = "wisemind_saved_sources";

function loadFromStorage(): SavedSource[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as SavedSource[]) : [];
	} catch {
		return [];
	}
}

function saveToStorage(list: SavedSource[]) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	} catch {
		// storage quota exceeded — ignore
	}
}

function createSavedSourcesStore() {
	const { subscribe, update } = writable<SavedSource[]>(loadFromStorage());

	return {
		subscribe,
		add(source: WiseMindSource, conversationId?: string) {
			update((list: SavedSource[]) => {
				const alreadySaved = list.some((s: SavedSource) => s.chunk_id === source.chunk_id);
				if (alreadySaved) return list;
				const next = [{ ...source, savedAt: Date.now(), conversationId }, ...list];
				saveToStorage(next);
				return next;
			});
		},
		remove(chunkId: string) {
			update((list: SavedSource[]) => {
				const next = list.filter((s: SavedSource) => s.chunk_id !== chunkId);
				saveToStorage(next);
				return next;
			});
		},
		clear() {
			update((_: SavedSource[]) => {
				saveToStorage([]);
				return [];
			});
		},
	};
}

export const savedSources = createSavedSourcesStore();
export const savedSourcesPanelOpen = writable(false);
