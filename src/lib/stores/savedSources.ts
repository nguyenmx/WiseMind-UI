import { writable } from "svelte/store";
import type { WiseMindSource } from "$lib/utils/marked";

export type SavedSource = WiseMindSource & { savedAt: number; conversationId?: string };

function createSavedSourcesStore() {
	const { subscribe, update } = writable<SavedSource[]>([]);

	return {
		subscribe,
		add(source: WiseMindSource, conversationId?: string) {
			update((list: SavedSource[]) => {
				const alreadySaved = list.some((s: SavedSource) => s.chunk_id === source.chunk_id);
				if (alreadySaved) return list;
				return [{ ...source, savedAt: Date.now(), conversationId }, ...list];
			});
		},
		remove(chunkId: string) {
			update((list: SavedSource[]) => list.filter((s: SavedSource) => s.chunk_id !== chunkId));
		},
		clear() {
			update((_: SavedSource[]) => []);
		},
	};
}

export const savedSources = createSavedSourcesStore();
export const savedSourcesPanelOpen = writable(false);
