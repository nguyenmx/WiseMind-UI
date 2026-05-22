<script lang="ts">
	import { tick } from "svelte";
	import MarkdownRenderer from "./MarkdownRenderer.svelte";

	interface Props {
		content: string;
		loading?: boolean;
		hasNext?: boolean;
	}

	let { content, loading = false }: Props = $props();

	let isOpen = $state(false);
	let scrollEl: HTMLDivElement | undefined = $state();

	// Medical sources to surface as badges when detected in the thinking stream
	const MEDICAL_SOURCES = [
		"Greenberg",
		"Youmans",
		"Winn",
		"Rhoton",
		"Schmidek",
		"Bernstein",
		"Principles of Neurosurgery",
		"NEJM",
		"Lancet",
		"Neurosurgery",
		"JNS",
		"Stroke",
		"UpToDate",
		"PubMed",
		"Harrison",
	];

	let detectedSources = $derived(
		MEDICAL_SOURCES.filter((src) => content.toLowerCase().includes(src.toLowerCase()))
	);

	// Auto-scroll to bottom while streaming
	$effect(() => {
		if (loading && isOpen && content) {
			tick().then(() => {
				if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
			});
		}
	});
</script>

<div class="my-2 w-full overflow-hidden rounded-2xl border border-indigo-500/20 bg-[#1e2a5e]/40 backdrop-blur-sm">
	<!-- Header -->
	<button
		type="button"
		onclick={() => (isOpen = !isOpen)}
		class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
	>
		<!-- Brain icon -->
		<span class="flex size-7 flex-none items-center justify-center rounded-full
			{loading ? 'animate-pulse bg-indigo-500/30' : 'bg-indigo-500/20'}">
			<svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-indigo-300" viewBox="0 0 32 32">
				<path
					class="stroke-current"
					style="stroke-width: 1.9; fill: none; stroke-linecap: round; stroke-linejoin: round;"
					d="M16 6v3.33M16 6c0-2.65 3.25-4.3 5.4-2.62 1.2.95 1.6 2.65.95 4.04a3.63 3.63 0 0 1 4.61.16 3.45 3.45 0 0 1 .46 4.37 5.32 5.32 0 0 1 1.87 4.75c-.22 1.66-1.39 3.6-3.07 4.14M16 6c0-2.65-3.25-4.3-5.4-2.62a3.37 3.37 0 0 0-.95 4.04 3.65 3.65 0 0 0-4.6.16 3.37 3.37 0 0 0-.49 4.27 5.57 5.57 0 0 0-1.85 4.85 5.3 5.3 0 0 0 3.07 4.15M16 9.33v17.34m0-17.34c0 2.18 1.82 4 4 4m6.22 7.5c.67 1.3.56 2.91-.27 4.11a4.05 4.05 0 0 1-4.62 1.5c0 1.53-1.05 2.9-2.66 2.9A2.7 2.7 0 0 1 16 26.66m10.22-5.83a4.05 4.05 0 0 0-3.55-2.17m-16.9 2.18a4.05 4.05 0 0 0 .28 4.1c1 1.44 2.92 2.09 4.59 1.5 0 1.52 1.12 2.88 2.7 2.88A2.7 2.7 0 0 0 16 26.67M5.78 20.85a4.04 4.04 0 0 1 3.55-2.18"
				/>
			</svg>
		</span>

		<!-- Status + source badges -->
		<span class="flex min-w-0 flex-1 flex-col gap-1">
			<span class="text-xs font-medium text-indigo-200">
				{#if loading}
					Consulting sources&hellip;
				{:else}
					Reasoning complete
				{/if}
			</span>
			{#if detectedSources.length > 0}
				<span class="flex flex-wrap gap-1">
					{#each detectedSources as src}
						<span class="rounded-full border border-indigo-500/30 bg-indigo-900/40 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
							{src}
						</span>
					{/each}
				</span>
			{:else if loading}
				<span class="text-[10px] text-indigo-400/60">Parsing clinical literature&hellip;</span>
			{/if}
		</span>

		<!-- Chevron -->
		<span class="flex-none text-indigo-400 transition-transform duration-200" class:rotate-180={isOpen}>
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
				stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="6 9 12 15 18 9" />
			</svg>
		</span>
	</button>

	<!-- Expanded content -->
	{#if isOpen}
		<div class="border-t border-indigo-500/20 px-4 py-3">
			<div
				bind:this={scrollEl}
				class="scrollbar-custom max-h-72 overflow-y-auto pr-1 text-xs leading-relaxed text-indigo-200/70"
			>
				{#if loading && content.length === 0}
					<span class="animate-pulse">Thinking&hellip;</span>
				{:else}
					<div class="prose prose-sm max-w-none prose-p:text-indigo-200/70 prose-headings:text-indigo-200
						prose-strong:text-indigo-100 prose-code:text-indigo-300 prose-code:bg-indigo-900/40
						prose-ul:text-indigo-200/70 prose-ol:text-indigo-200/70">
						<MarkdownRenderer {content} {loading} />
					</div>
					{#if loading}
						<span class="ml-1 inline-block size-1.5 animate-pulse rounded-full bg-indigo-400"></span>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</div>
