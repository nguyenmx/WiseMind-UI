<script lang="ts">
	import { usePublicConfig } from "$lib/utils/PublicConfig.svelte";

	const publicConfig = usePublicConfig();

	interface Props {
		classNames?: string;
	}

	let { classNames = "" }: Props = $props();
</script>

<img
	width="32"
	height="32"
	class="dark:hidden {classNames}"
	alt="{publicConfig.PUBLIC_APP_NAME} logo"
	src="{publicConfig.assetPath}/logo.png"
/>
<img
	width="32"
	height="32"
	class="hidden dark:block {classNames}"
	alt="{publicConfig.PUBLIC_APP_NAME} logo"
	src="{publicConfig.assetPath}/logo-dark.png"
/>
