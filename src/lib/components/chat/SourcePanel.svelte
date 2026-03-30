<script lang="ts">
	import type { WiseMindSource } from "$lib/utils/marked";
	import { savedSources } from "$lib/stores/savedSources";

	interface LayoutBlock {
		type: string;
		bbox: [number, number, number, number];
		normalized_bbox: [number, number, number, number];
	}

	interface HighlightBbox {
		0: number; // x0 (0-1)
		1: number; // y0 (0-1)
		2: number; // x1 (0-1)
		3: number; // y1 (0-1)
	}

	interface PageData {
		page: number;
		image_url: string;
		image_size: [number, number];
		layouts: LayoutBlock[];
		highlight_bboxes: HighlightBbox[];
	}

	interface Props {
		source: WiseMindSource | null;
		onclose: () => void;
	}

	let { source, onclose }: Props = $props();

	// ── Tab state ──
	let activeTab: "page" | "excerpt" = $state("page");

	// ── Page view state ──
	let pageData: PageData | null = $state(null);
	let pageLoading = $state(false);
	let pageError = $state("");

	// Fetch page layout when source changes (Greenberg only)
	$effect(() => {
		if (!source || source.source_type === "middle") {
			pageData = null;
			activeTab = "excerpt";
			return;
		}
		const page = source.page;
		if (!page) {
			activeTab = "excerpt";
			return;
		}
		activeTab = "page";
		pageLoading = true;
		pageError = "";
		pageData = null;

		// Pass chunk content as search param so backend can return highlight bboxes
		const searchParam = source.content
			? `?search=${encodeURIComponent(source.content.slice(0, 300))}`
			: "";

		fetch(`/api/source-page/${page}${searchParam}`)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.json();
			})
			.then((d: PageData) => {
				pageData = d;
				pageLoading = false;
			})
			.catch((e: Error) => {
				pageError = e.message;
				pageLoading = false;
				activeTab = "excerpt";
			});
	});

	// ── Text excerpt helpers ──
	function highlightKeywords(text: string, keywords: string[]): string {
		if (!keywords.length) return escapeHtml(text);
		let result = escapeHtml(text);
		const sorted = [...keywords].sort((a, b) => b.length - a.length);
		for (const kw of sorted) {
			if (!kw.trim()) continue;
			const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			result = result.replace(
				new RegExp(`(${esc})`, "gi"),
				'<mark style="background:rgba(250,204,21,0.5);border-radius:2px;padding:0 1px">$1</mark>'
			);
		}
		return result;
	}

	function escapeHtml(s: string): string {
		return s
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	function getKeywords(src: WiseMindSource): string[] {
		const words: string[] = [];
		if (src.section) words.push(...src.section.split(/[\s\-\/]+/).filter((w) => w.length > 3));
		if (src.doc_title)
			words.push(...src.doc_title.split(/[\s\-\/]+/).filter((w) => w.length > 3));
		return [...new Set(words)].slice(0, 8);
	}

	let highlightedContent = $derived(
		source ? highlightKeywords(source.content, getKeywords(source)) : ""
	);

	// ── Source type helpers ──
	let isGuideline = $derived(source?.source_type === "middle");
	let typeLabel = $derived(isGuideline ? "Clinical Guideline" : "Greenberg — Neurosurgery");
	let icon = $derived(isGuideline ? "📋" : "📖");

	// ── Save state ──
	let isSaved = $derived.by(() => {
		if (!source) return false;
		const chunkId = source.chunk_id;
		return $savedSources.some((s) => s.chunk_id === chunkId);
	});

	function toggleSave() {
		if (!source) return;
		if (isSaved) {
			savedSources.remove(source.chunk_id);
		} else {
			savedSources.add(source);
		}
	}

	// Layout data is fetched but overlays are not rendered — plain page view only.
</script>

{#if source}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
		onclick={onclose}
		aria-label="Close source panel"
		style="border:none;cursor:default;"
	></button>

	<!-- Panel -->
	<aside
		class="fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col shadow-2xl"
		style="background: var(--color-surface-primary, #fff); border-left: 1px solid var(--color-border-primary, #e5e7eb);"
	>
		<!-- Header -->
		<div
			class="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4"
			style="border-color: var(--color-border-primary, #e5e7eb);"
		>
			<div class="min-w-0 flex-1">
				<div class="mb-1 flex items-center gap-2">
					<span class="text-base">{icon}</span>
					<span
						class="text-xs font-semibold uppercase tracking-wide"
						style="color: var(--color-text-tertiary, #6b7280);">{typeLabel}</span
					>
					<span
						class="rounded px-1.5 py-0.5 text-xs font-bold"
						style="background:rgb(239,246,255);color:rgb(37,99,235);border:1px solid rgb(147,197,253);"
					>
						[{source.ref_index}]
					</span>
				</div>
				<h2
					class="truncate text-sm font-semibold leading-snug"
					style="color: var(--color-text-primary, #111827);"
					title={source.section || source.doc_title}
				>
					{source.section || source.doc_title}
				</h2>
				{#if !isGuideline && source.page}
					<p class="mt-0.5 text-xs" style="color: var(--color-text-tertiary, #6b7280);">
						p. {source.page + 12}
					</p>
				{:else if isGuideline && source.doc_title}
					<p
						class="mt-0.5 truncate text-xs"
						style="color: var(--color-text-tertiary, #6b7280);"
						title={source.doc_title}
					>
						{source.doc_title}
					</p>
				{/if}
			</div>
			<div class="flex shrink-0 items-center gap-1">
				<!-- Bookmark / save button -->
				<button
					onclick={toggleSave}
					class="rounded-lg p-1.5 transition-colors"
					style="color: {isSaved ? 'rgb(37,99,235)' : 'var(--color-text-secondary, #374151)'};"
					aria-label={isSaved ? "Remove from saved sources" : "Save source"}
					title={isSaved ? "Remove from saved sources" : "Save to bookmarks"}
					onmouseenter={(e) =>
						((e.currentTarget as HTMLElement).style.background =
							"var(--color-surface-secondary, #f3f4f6)")}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill={isSaved ? "currentColor" : "none"}
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
					</svg>
				</button>
				<!-- Close button -->
				<button
					onclick={onclose}
					class="rounded-lg p-1.5 transition-colors"
					style="color: var(--color-text-secondary, #374151);"
					aria-label="Close"
					onmouseenter={(e) =>
						((e.currentTarget as HTMLElement).style.background =
							"var(--color-surface-secondary, #f3f4f6)")}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Tabs (Greenberg only) -->
		{#if !isGuideline}
			<div
				class="flex shrink-0 border-b"
				style="border-color: var(--color-border-primary, #e5e7eb);"
			>
				<button
					onclick={() => (activeTab = "page")}
					class="px-4 py-2 text-xs font-medium transition-colors"
					style="border-bottom: 2px solid {activeTab === 'page'
						? 'rgb(37,99,235)'
						: 'transparent'}; color: {activeTab === 'page'
						? 'rgb(37,99,235)'
						: 'var(--color-text-secondary, #6b7280)'};"
				>
					📄 Page View
				</button>
				<button
					onclick={() => (activeTab = "excerpt")}
					class="px-4 py-2 text-xs font-medium transition-colors"
					style="border-bottom: 2px solid {activeTab === 'excerpt'
						? 'rgb(37,99,235)'
						: 'transparent'}; color: {activeTab === 'excerpt'
						? 'rgb(37,99,235)'
						: 'var(--color-text-secondary, #6b7280)'};"
				>
					📝 Excerpt
				</button>
			</div>
		{/if}

		<!-- Content -->
		<div class="min-h-0 flex-1 overflow-y-auto">
			<!-- PAGE VIEW TAB -->
			{#if activeTab === "page" && !isGuideline}
				<div class="p-4">
					{#if pageLoading}
						<div class="flex items-center justify-center py-16">
							<div
								class="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
							></div>
							<span class="ml-3 text-sm" style="color: var(--color-text-secondary, #6b7280);"
								>Loading page {source.page}…</span
							>
						</div>
					{:else if pageError}
						<div class="rounded-lg p-4 text-sm" style="background:#fef2f2;color:#991b1b;">
							Could not load page: {pageError}
						</div>
					{:else if pageData}
						<!-- Page image with optional highlight overlays -->
						<div
							class="relative w-full overflow-hidden rounded-lg border"
							style="border-color: var(--color-border-primary, #e5e7eb);"
						>
							<img
								src={pageData.image_url}
								alt="Greenberg p.{source.page}"
								class="block w-full"
								loading="lazy"
							/>
							{#if pageData.highlight_bboxes && pageData.highlight_bboxes.length > 0}
								{#each pageData.highlight_bboxes as bbox}
									<div
										class="pointer-events-none absolute"
										style="
											left: {bbox[0] * 100}%;
											top: {bbox[1] * 100}%;
											width: {(bbox[2] - bbox[0]) * 100}%;
											height: {(bbox[3] - bbox[1]) * 100}%;
											background: rgba(253, 224, 71, 0.45);
											border: 1.5px solid rgba(234, 179, 8, 0.7);
											border-radius: 2px;
											mix-blend-mode: multiply;
										"
									></div>
								{/each}
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			<!-- EXCERPT TAB (or guideline) -->
			{#if activeTab === "excerpt" || isGuideline}
				<div class="px-5 py-4">
					<p
						class="mb-2 text-xs font-medium uppercase tracking-wide"
						style="color: var(--color-text-tertiary, #6b7280);"
					>
						Excerpt
					</p>
					<div
						class="rounded-lg p-4 text-sm leading-relaxed"
						style="background: var(--color-surface-secondary, #f9fafb); color: var(--color-text-primary, #111827); white-space: pre-wrap; word-break: break-word;"
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html highlightedContent}
					</div>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		{#if source.source_url}
			<div
				class="shrink-0 border-t px-5 py-3"
				style="border-color: var(--color-border-primary, #e5e7eb);"
			>
				<a
					href={source.source_url}
					target="_blank"
					rel="noreferrer"
					class="inline-flex items-center gap-1.5 text-xs font-medium"
					style="color: rgb(37,99,235);"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline
							points="15 3 21 3 21 9"
						/><line x1="10" y1="14" x2="21" y2="3" />
					</svg>
					Open source document
				</a>
			</div>
		{/if}
	</aside>
{/if}
