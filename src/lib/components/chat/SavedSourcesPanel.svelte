<script lang="ts">
	import { savedSources, savedSourcesPanelOpen, type SavedSource } from "$lib/stores/savedSources";
	import SourcePanel from "./SourcePanel.svelte";

	let activeSource: SavedSource | null = $state(null);

	function openSource(source: SavedSource) {
		activeSource = source;
	}

	function formatDate(ts: number): string {
		const d = new Date(ts);
		return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
	}
</script>

{#if $savedSourcesPanelOpen}
	<!-- Backdrop (only when no inner source panel is open) -->
	{#if !activeSource}
		<button
			class="fixed inset-0 z-40 bg-black/10"
			onclick={() => savedSourcesPanelOpen.set(false)}
			aria-label="Close saved sources"
			style="border:none;cursor:default;"
		></button>
	{/if}

	<!-- Panel -->
	<aside
		class="fixed right-0 top-0 z-50 flex h-full w-full max-w-[340px] flex-col shadow-2xl"
		style="background: var(--color-surface-primary, #fff); border-left: 1px solid var(--color-border-primary, #e5e7eb);"
	>
		<!-- Header -->
		<div
			class="flex shrink-0 items-center justify-between border-b px-4 py-3"
			style="border-color: var(--color-border-primary, #e5e7eb);"
		>
			<div class="flex items-center gap-2">
				<span class="text-base">🔖</span>
				<span class="text-sm font-semibold" style="color: var(--color-text-primary, #111827);">
					Saved Sources
				</span>
				{#if $savedSources.length > 0}
					<span
						class="rounded-full px-2 py-0.5 text-xs font-medium"
						style="background:rgb(239,246,255);color:rgb(37,99,235);border:1px solid rgb(147,197,253);"
					>
						{$savedSources.length}
					</span>
				{/if}
			</div>
			<div class="flex items-center gap-1">
				{#if $savedSources.length > 0}
					<button
						onclick={() => savedSources.clear()}
						class="rounded px-2 py-1 text-xs transition-colors hover:bg-red-50"
						style="color:#dc2626;"
						title="Clear all saved sources"
					>
						Clear all
					</button>
				{/if}
				<button
					onclick={() => savedSourcesPanelOpen.set(false)}
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
						width="16"
						height="16"
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

		<!-- Source list -->
		<div class="min-h-0 flex-1 overflow-y-auto">
			{#if $savedSources.length === 0}
				<div class="flex flex-col items-center justify-center px-6 py-16 text-center">
					<span class="mb-3 text-4xl opacity-30">🔖</span>
					<p class="text-sm font-medium" style="color: var(--color-text-secondary, #6b7280);">
						No saved sources yet
					</p>
					<p class="mt-1 text-xs" style="color: var(--color-text-tertiary, #9ca3af);">
						Click the bookmark icon on any source to save it here.
					</p>
				</div>
			{:else}
				<ul class="divide-y" style="border-color: var(--color-border-primary, #e5e7eb);">
					{#each $savedSources as source (source.chunk_id)}
						{@const isGuideline = source.source_type === "middle"}
						<li>
							<button
								class="group w-full px-4 py-3 text-left transition-colors"
								style="background:transparent;"
								onmouseenter={(e) =>
									((e.currentTarget as HTMLElement).style.background =
										"var(--color-surface-secondary, #f9fafb)")}
								onmouseleave={(e) =>
									((e.currentTarget as HTMLElement).style.background = "transparent")}
								onclick={() => openSource(source)}
							>
								<div class="flex items-start justify-between gap-2">
									<div class="min-w-0 flex-1">
										<div class="mb-0.5 flex items-center gap-1.5">
											<span class="text-sm">{isGuideline ? "📋" : "📖"}</span>
											<span
												class="truncate text-xs font-semibold"
												style="color: var(--color-text-primary, #111827);"
											>
												{source.section || source.doc_title}
											</span>
										</div>
										<p class="text-xs" style="color: var(--color-text-tertiary, #9ca3af);">
											{#if !isGuideline && source.page}
												p. {source.page + 12} · {formatDate(source.savedAt)}
											{:else}
												{formatDate(source.savedAt)}
											{/if}
										</p>
									</div>
									<button
										onclick={(e) => {
											e.stopPropagation();
											savedSources.remove(source.chunk_id);
										}}
										class="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
										style="color:#9ca3af;"
										title="Remove"
										onmouseenter={(e) =>
											((e.currentTarget as HTMLElement).style.color = "#dc2626")}
										onmouseleave={(e) =>
											((e.currentTarget as HTMLElement).style.color = "#9ca3af")}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="13"
											height="13"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="3 6 5 6 21 6" /><path
												d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
											/><path d="M10 11v6" /><path d="M14 11v6" /><path
												d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
											/>
										</svg>
									</button>
								</div>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</aside>

	<!-- Inner source detail panel (renders on top when a saved source is clicked) -->
	<SourcePanel source={activeSource} onclose={() => (activeSource = null)} />
{/if}
