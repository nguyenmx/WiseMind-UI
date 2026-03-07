<script lang="ts">
	import {
		processBlocks,
		processBlocksSync,
		type BlockToken,
		type WiseMindSource
	} from "$lib/utils/marked";
	import MarkdownWorker from "$lib/workers/markdownWorker?worker";
	import MarkdownBlock from "./MarkdownBlock.svelte";
	import { browser } from "$app/environment";

	import { onMount, onDestroy } from "svelte";
	import { updateDebouncer } from "$lib/utils/updates";

	interface Props {
		content: string;
		sources?: { title?: string; link: string }[];
		wisemindSources?: WiseMindSource[];
		loading?: boolean;
	}

	let { content, sources = [], wisemindSources = [], loading = false }: Props = $props();

	let blocks: BlockToken[] = $state(processBlocksSync(content, sources, wisemindSources));
	let worker: Worker | null = null;
	let latestRequestId = 0;

	function handleBlocks(result: BlockToken[], requestId: number) {
		if (requestId !== latestRequestId) return;
		blocks = result;
		updateDebouncer.endRender();
	}

	$effect(() => {
		if (!browser) {
			blocks = processBlocksSync(content, sources, wisemindSources);
			return;
		}

		const requestId = ++latestRequestId;

		// Worker path: only use for non-wisemind content (worker can't transfer WiseMindSource)
		if (worker && !wisemindSources.length) {
			updateDebouncer.startRender();
			worker.postMessage({ type: "process", content, sources, requestId });
			return;
		}

		(async () => {
			updateDebouncer.startRender();
			const processed = await processBlocks(content, sources, wisemindSources);
			handleBlocks(processed, requestId);
		})();
	});

	onMount(() => {
		if (typeof Worker !== "undefined") {
			worker = new MarkdownWorker();
			worker.onmessage = (event: MessageEvent) => {
				const data = event.data as { type?: string; blocks?: BlockToken[]; requestId?: number };
				if (data?.type !== "processed" || !data.blocks || data.requestId === undefined) return;
				handleBlocks(data.blocks, data.requestId);
			};
		}
	});

	onDestroy(() => {
		worker?.terminate();
		worker = null;
	});
</script>

{#each blocks as block, index (loading && index === blocks.length - 1 ? `stream-${index}` : block.id)}
	<MarkdownBlock tokens={block.tokens} {loading} />
{/each}
