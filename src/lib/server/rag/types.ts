export interface SearchResult {
	rank: number;
	location: string;
	chapter?: string;
	section_num?: string;
	page?: number;
	block_type?: string;
	chunk_id?: string;
	score: number;
	content_preview?: string;
	full_content: string;
}

export interface VerificationEntry {
	query: string;
	description: string;
	expected_keywords?: string[];
	answer?: string;
	search_results: SearchResult[];
}
