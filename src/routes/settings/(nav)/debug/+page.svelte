<script lang="ts">
	import { base } from "$app/paths";
	import { useAPIClient, handleResponse } from "$lib/APIClient";
	import { onMount } from "svelte";

	const client = useAPIClient();

	type DebugConfig = {
		OPENAI_BASE_URL?: string;
		OPENAI_API_KEY_SET?: boolean;
		LEGACY_HF_TOKEN_SET?: boolean;
		MODELS_COUNT?: number;
		NODE_VERSION?: string;
	};

	type RefreshResult = {
		status: number;
		ok: boolean;
		base: string;
		length: number | null;
		sample: string;
	};

	let config = $state<DebugConfig | null>(null);
	let configError = $state<string | null>(null);
	let refreshResult = $state<RefreshResult | null>(null);
	let refreshing = $state(false);

	onMount(async () => {
		try {
			const cfg = await client.debug.config.get().then(handleResponse);
			config = cfg as DebugConfig;
		} catch (e) {
			configError = e instanceof Error ? e.message : "Failed to load debug config";
		}
	});

	async function doRefresh() {
		refreshing = true;
		refreshResult = null;
		try {
			const res = await client.debug.refresh.get().then(handleResponse);
			refreshResult = res as RefreshResult;
		} catch (e) {
			refreshResult = {
				status: 0,
				ok: false,
				base: "",
				length: null,
				sample: e instanceof Error ? e.message : "Request failed",
			};
		} finally {
			refreshing = false;
		}
	}
</script>

<div class="flex w-full flex-col gap-4">
	<h2 class="text-center text-lg font-semibold text-gray-800 dark:text-gray-200 md:text-left">
		Debug
	</h2>
	<p class="text-sm text-gray-500 dark:text-gray-400">
		Server and environment info for troubleshooting.
	</p>

	{#if configError}
		<div
			class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
		>
			{configError}
		</div>
	{:else if config}
		<div
			class="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<dl class="space-y-2 text-[13px]">
				<div class="flex justify-between gap-2">
					<dt class="font-medium text-gray-600 dark:text-gray-400">API Base URL</dt>
					<dd class="font-mono text-right text-gray-800 dark:text-gray-200">
						{config.OPENAI_BASE_URL ?? "—"}
					</dd>
				</div>
				<div class="flex justify-between gap-2">
					<dt class="font-medium text-gray-600 dark:text-gray-400">API key set</dt>
					<dd class="text-gray-800 dark:text-gray-200">{config.OPENAI_API_KEY_SET ? "Yes" : "No"}</dd>
				</div>
				{#if config.LEGACY_HF_TOKEN_SET}
					<div class="flex justify-between gap-2">
						<dt class="font-medium text-gray-600 dark:text-gray-400">Legacy HF token</dt>
						<dd class="text-gray-800 dark:text-gray-200">Yes</dd>
					</div>
				{/if}
				<div class="flex justify-between gap-2">
					<dt class="font-medium text-gray-600 dark:text-gray-400">Models loaded</dt>
					<dd class="text-gray-800 dark:text-gray-200">{config.MODELS_COUNT ?? "—"}</dd>
				</div>
				<div class="flex justify-between gap-2">
					<dt class="font-medium text-gray-600 dark:text-gray-400">Node version</dt>
					<dd class="font-mono text-gray-800 dark:text-gray-200">{config.NODE_VERSION ?? "—"}</dd>
				</div>
			</dl>
		</div>

		<div class="flex flex-col gap-2">
			<button
				type="button"
				class="btn w-fit rounded-md text-sm"
				disabled={refreshing}
				onclick={doRefresh}
			>
				{refreshing ? "Refreshing…" : "Refresh router /models"}
			</button>
			{#if refreshResult}
				<div
					class="rounded-lg border px-3 py-2 font-mono text-[12px] text-gray-700 dark:text-gray-300"
					class:border-green-200={refreshResult.ok}
					class:bg-green-50={refreshResult.ok}
					class:dark:border-green-800={refreshResult.ok}
					class:dark:bg-green-900/20={refreshResult.ok}
					class:border-red-200={!refreshResult.ok}
					class:bg-red-50={!refreshResult.ok}
					class:dark:border-red-800={!refreshResult.ok}
					class:dark:bg-red-900/20={!refreshResult.ok}
				>
					<p>status: {refreshResult.status} · ok: {refreshResult.ok}</p>
					{#if refreshResult.base}
						<p>base: {refreshResult.base}</p>
					{/if}
					{#if refreshResult.length !== null}
						<p>models length: {refreshResult.length}</p>
					{/if}
					{#if refreshResult.sample}
						<pre class="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all">{refreshResult.sample}</pre>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
