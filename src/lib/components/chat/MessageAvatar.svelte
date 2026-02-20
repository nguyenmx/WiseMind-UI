<script lang="ts">
	import { usePublicConfig } from "$lib/utils/PublicConfig.svelte";

	const publicConfig = usePublicConfig();

	let { animating = false, classNames = "" } = $props();
</script>

<div class={"flex-none select-none max-sm:hidden " + (animating ? "animate-pulse" : "")}>
	<div class={"overflow-hidden bg-white dark:bg-white/90 dark:shadow-white/25 flex items-center justify-center " + classNames}>
		<img
			src="{publicConfig.assetPath}/wisemind-no-name.png"
			alt="WiseMind"
			class="scale-[1.18] translate-x-[-0.5px] translate-y-[3px] h-full w-full object-contain"
		/>
	</div>
</div>
