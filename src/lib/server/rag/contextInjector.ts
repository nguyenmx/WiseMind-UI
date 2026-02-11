import { logger } from "$lib/server/logger";
import { verificationDataLoader } from "./verificationData";
import type { SearchResult } from "./types";
import type { EndpointMessage } from "../endpoints/endpoints";

const DEFAULT_TOP_K = 3;

/**
 * Format search results into context string matching qwen_evaluate.py format
 */
function formatContext(results: SearchResult[]): string {
	return results
		.map((r, i) => `[Source ${i + 1}: ${r.location}]\n${r.full_content}`)
		.join("\n\n");
}

/**
 * Build RAG-augmented user message matching qwen_evaluate.py template
 */
function buildRAGUserMessage(query: string, description: string, context: string): string {
	return `[Context]
${context}

[User Query]
Question: ${query}
${description ? `Specific Aspect: ${description}\n` : ""}
Answer:`;
}

/**
 * Inject RAG context into messages before sending to the model.
 * This modifies the last user message to include retrieved context.
 */
export async function injectRAGContext(
	messages: EndpointMessage[],
	topK: number = DEFAULT_TOP_K
): Promise<EndpointMessage[]> {
	// Find the last user message
	let lastUserIndex = -1;
	for (let i = messages.length - 1; i >= 0; i--) {
		if (messages[i].from === "user") {
			lastUserIndex = i;
			break;
		}
	}

	if (lastUserIndex === -1) {
		logger.info("[RAG] No user message found, skipping context injection");
		return messages;
	}

	const lastUserMessage = messages[lastUserIndex];
	const query = typeof lastUserMessage.content === "string" ? lastUserMessage.content : "";

	if (!query.trim()) {
		return messages;
	}

	// Search for relevant context
	const results = verificationDataLoader.search(query, topK);

	if (results.length === 0) {
		logger.info(`[RAG] No context found for query: "${query}"`);
		return messages;
	}

	// Format context and build augmented message
	const context = formatContext(results);
	const description = verificationDataLoader.getDescription(query);
	const augmentedContent = buildRAGUserMessage(query, description, context);

	logger.info(`[RAG] Injected ${results.length} context chunks for query: "${query}"`);

	// Create new messages array with augmented user message
	const newMessages = [...messages];
	newMessages[lastUserIndex] = {
		...lastUserMessage,
		content: augmentedContent,
	};

	return newMessages;
}
