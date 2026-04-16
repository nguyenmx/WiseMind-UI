<script lang="ts">
	import logoSrc from "$lib/assets/WiseFind-logo.png";

	interface Props {
		classNames?: string;
	}

	let { classNames = "" }: Props = $props();
</script>

<img
	width="32"
	height="32"
	class="dark:hidden {classNames}"
	alt="WiseFind AI logo"
	src={logoSrc}
/>
<img
	width="32"
	height="32"
	class="hidden dark:block {classNames}"
	alt="WiseFind AI logo"
	src={logoSrc}
/>
