<script lang="ts">
	import { onMount, onDestroy } from "svelte";

	interface Props {
		classNames?: string;
	}

	let { classNames = "" }: Props = $props();

	const sayings = ["wi..", "mi..", "wi mi mi.."];

	let index = $state(0);
	let interval: ReturnType<typeof setInterval>;

	onMount(() => {
		index = Math.floor(Math.random() * sayings.length);
		interval = setInterval(() => {
			index = (index + 1) % sayings.length;
		}, 1200);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<span class={"inline-flex h-8 items-center text-sm italic text-gray-500 dark:text-gray-400 " + classNames}>
	{sayings[index]}
</span>
