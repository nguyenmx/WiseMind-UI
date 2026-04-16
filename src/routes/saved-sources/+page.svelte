<script lang="ts">
	import { savedSources } from "$lib/stores/savedSources";
	import SourcePanel from "$lib/components/chat/SourcePanel.svelte";
	import type { SavedSource } from "$lib/stores/savedSources";

	let activeSource: SavedSource | null = $state(null);

	function formatDate(ts: number): string {
		return new Date(ts).toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	}
</script>

<svelte:head>
	<title>Saved Sources — WiseMind</title>
</svelte:head>

<div class="mx-auto flex h-full max-w-3xl flex-col px-5 pt-10">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div>
				<h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Saved Sources</h1>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{$savedSources.length} saved {$savedSources.length === 1 ? "source" : "sources"}
				</p>
			</div>
		</div>
		{#if $savedSources.length > 0}
			<button
				onclick={() => savedSources.clear()}
				class="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
			>
				Clear all
			</button>
		{/if}
	</div>

	<!-- List -->
	{#if $savedSources.length === 0}
		<div class="flex flex-1 flex-col items-center justify-center text-center">
			<span class="mb-4 text-6xl opacity-20">🔖</span>
			<p class="text-base font-medium text-gray-500 dark:text-gray-400">No saved sources yet</p>
			<p class="mt-1 text-sm text-gray-400 dark:text-gray-500">
				Bookmark sources from the chat by clicking the 🔖 icon in any source panel.
			</p>
		</div>
	{:else}
		<ul class="divide-y divide-gray-100 dark:divide-gray-800">
			{#each $savedSources as source (source.chunk_id)}
				{@const isGuideline = source.source_type === "middle"}
				<li class="group flex items-start gap-4 py-4">
					<!-- Click area -->
					<button
						class="min-w-0 flex-1 text-left"
						onclick={() => (activeSource = source)}
					>
						<div class="flex items-center gap-2">
							<span class="text-base">{isGuideline ? "📋" : "📖"}</span>
							<span class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
								{isGuideline ? "Clinical Guideline" : "Greenberg — Neurosurgery"}
							</span>
						</div>
						<p class="mt-0.5 truncate font-medium text-gray-900 dark:text-gray-100">
							{source.section || source.doc_title}
						</p>
						<p class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
							{#if !isGuideline && source.page}
								p. {source.page + 12} ·
							{/if}
							Saved {formatDate(source.savedAt)}
						</p>
					</button>

					<!-- Remove button -->
					<button
						onclick={() => savedSources.remove(source.chunk_id)}
						class="mt-1 shrink-0 rounded p-1.5 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
						title="Remove"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="3 6 5 6 21 6" />
							<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
							<path d="M10 11v6" /><path d="M14 11v6" />
							<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
						</svg>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<!-- Source detail panel -->
<SourcePanel source={activeSource} onclose={() => (activeSource = null)} />
