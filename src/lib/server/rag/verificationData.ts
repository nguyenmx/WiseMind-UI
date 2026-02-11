import { readFileSync, existsSync } from "fs";
import { logger } from "$lib/server/logger";
import type { VerificationEntry, SearchResult } from "./types";

const VERIFICATION_DATA_PATH =
	process.env.RAG_DATA_PATH ||
	"/mmfs1/gscratch/scrubbed/maryxn/wisefind/verification_data/verification_data/verification_data.json";

class VerificationDataLoader {
	private data: VerificationEntry[] = [];
	private queryIndex: Map<string, VerificationEntry> = new Map();
	private loaded = false;

	load(): void {
		if (this.loaded) return;

		if (!existsSync(VERIFICATION_DATA_PATH)) {
			logger.warn(`[RAG] Verification data not found at ${VERIFICATION_DATA_PATH}`);
			return;
		}

		try {
			const raw = readFileSync(VERIFICATION_DATA_PATH, "utf-8");
			this.data = JSON.parse(raw) as VerificationEntry[];

			// Build query index for exact matching
			for (const entry of this.data) {
				const normalizedQuery = entry.query.toLowerCase().trim();
				this.queryIndex.set(normalizedQuery, entry);
			}

			this.loaded = true;
			logger.info(`[RAG] Loaded ${this.data.length} verification entries`);
		} catch (error) {
			logger.error(error, "[RAG] Failed to load verification data");
		}
	}

	search(query: string, topK: number = 3): SearchResult[] {
		if (!this.loaded) {
			this.load();
		}

		const normalized = query.toLowerCase().trim();

		// Try exact match first
		const exact = this.queryIndex.get(normalized);
		if (exact) {
			logger.info(`[RAG] Exact match found for: "${query}"`);
			return exact.search_results.slice(0, topK);
		}

		// Fuzzy match using keyword overlap
		const queryWords = new Set(normalized.split(/\s+/).filter((w) => w.length > 1));
		let bestMatch: VerificationEntry | null = null;
		let bestScore = 0;

		for (const entry of this.data) {
			const entryWords = new Set(
				entry.query.toLowerCase().split(/\s+/).filter((w) => w.length > 1)
			);
			const overlap = [...queryWords].filter((w) => entryWords.has(w)).length;
			const score = overlap / Math.max(queryWords.size, entryWords.size, 1);

			if (score > bestScore) {
				bestScore = score;
				bestMatch = entry;
			}
		}

		// Only return results if there's decent overlap (>30%)
		if (bestMatch && bestScore > 0.3) {
			logger.info(
				`[RAG] Fuzzy matched "${query}" to "${bestMatch.query}" (score: ${bestScore.toFixed(2)})`
			);
			return bestMatch.search_results.slice(0, topK);
		}

		logger.info(`[RAG] No matching verification data for query: "${query}"`);
		return [];
	}

	getDescription(query: string): string {
		if (!this.loaded) {
			this.load();
		}

		const normalized = query.toLowerCase().trim();
		const exact = this.queryIndex.get(normalized);
		if (exact) {
			return exact.description || "";
		}

		return "";
	}

	isLoaded(): boolean {
		return this.loaded;
	}
}

// Singleton instance
export const verificationDataLoader = new VerificationDataLoader();
