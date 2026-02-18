<script lang="ts">
	import Logo from "$lib/components/icons/Logo.svelte";

	let { animating = false, classNames = "" } = $props();
</script>

<div class={"flex-none select-none max-sm:hidden " + (animating ? "animate-pulse" : "")}>
	<Logo classNames={classNames.replace("rounded-full", "").trim()} />
</div>
