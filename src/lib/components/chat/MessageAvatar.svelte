<script lang="ts">
	import logoSrc from "$lib/assets/WiseFind-logo.png";

	let { animating = false, classNames = "" } = $props();
</script>

<div class={"flex-none select-none max-sm:hidden " + (animating ? "animate-pulse" : "")}>
	<div class={"overflow-hidden bg-white dark:bg-white/90 dark:shadow-white/25 flex items-center justify-center " + classNames}>
		<img
			src={logoSrc}
			alt="WiseFind AI"
			class="h-full w-full object-contain"
		/>
	</div>
</div>
