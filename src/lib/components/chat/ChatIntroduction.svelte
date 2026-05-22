<script lang="ts">
	import Logo from "$lib/components/icons/Logo.svelte";
	import type { Model } from "$lib/types/Model";
	import IconBrain from "~icons/lucide/brain";
	import IconHeartPulse from "~icons/lucide/heart-pulse";
	import IconBookOpen from "~icons/lucide/book-open";
	import IconSearch from "~icons/lucide/search";
	import IconArrowUpRight from "~icons/lucide/arrow-up-right";

	interface Props {
		currentModel: Model;
		onmessage?: (content: string) => void;
	}

	let { currentModel: _currentModel, onmessage }: Props = $props();

	$effect(() => {
		void _currentModel;
	});

	const suggestions = [
		{
			icon: IconBrain,
			text: "Summarize recent craniotomy guidelines",
			tag: "Guidelines",
		},
		{
			icon: IconHeartPulse,
			text: "Help me with post-op care protocols",
			tag: "Protocols",
		},
		{
			icon: IconBookOpen,
			text: "Explain the latest in spinal fusion techniques",
			tag: "Techniques",
		},
		{
			icon: IconSearch,
			text: "Review tumor resection approaches",
			tag: "Review",
		},
	];
</script>

<div class="flex w-full flex-col items-center pb-4">
	<!-- Greeting section -->
	<div class="mb-10 mt-6 flex w-full max-w-3xl flex-col items-center px-4 text-center">
		<div class="greeting-logo mb-6">
			<Logo classNames="size-20 md:size-24" />
		</div>

		<h1 class="greeting-heading mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
			<span
				class="animate-gradient-x bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-indigo-200 dark:to-indigo-400"
			>
				Hello, Doctor
			</span>
		</h1>

		<p class="greeting-subtitle text-lg font-light text-gray-500 md:text-xl dark:text-indigo-200/80">
			How can I assist you with neurosurgery today?
		</p>
	</div>

	<!-- Suggestion chips -->
	<div class="chips-grid grid w-full max-w-3xl grid-cols-1 gap-4 px-4 sm:grid-cols-2">
		{#each suggestions as suggestion, i}
			{@const Icon = suggestion.icon}
			<button
				onclick={() => onmessage?.(suggestion.text)}
				class="chip group relative flex h-40 flex-col items-start justify-between overflow-hidden rounded-2xl border p-5 text-left backdrop-blur-md transition-all duration-300
					border-white/80 bg-white/60 shadow-sm hover:-translate-y-1 hover:scale-[1.01] hover:border-indigo-200 hover:bg-white/80 hover:shadow-indigo-100/50
					active:scale-[0.98] dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:hover:border-indigo-400/60 dark:hover:bg-indigo-950/60"
				>
				<div
					class="absolute right-0 top-0 p-3 text-indigo-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-indigo-400"
				>
					<IconArrowUpRight class="size-4" />
				</div>

				<div class="flex items-center gap-3">
					<div
						class="rounded-full bg-indigo-50 p-2 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:group-hover:bg-indigo-900/80 dark:group-hover:text-white"
					>
						<Icon class="size-4" />
					</div>
					<span
						class="rounded-full border border-indigo-100 bg-white/50 px-2 py-0.5 text-xs font-medium text-indigo-500/80 dark:border-indigo-500/30 dark:bg-indigo-900/30 dark:text-indigo-300"
					>
						{suggestion.tag}
					</span>
				</div>

				<span class="pr-4 text-sm font-medium leading-snug text-gray-700 md:text-base dark:text-indigo-100">
					{suggestion.text}
				</span>
			</button>
		{/each}
	</div>
</div>

<style>
	@keyframes fade-slide-up {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes gradient-x {
		0%, 100% {
			background-size: 200% 200%;
			background-position: left center;
		}
		50% {
			background-size: 200% 200%;
			background-position: right center;
		}
	}

	.greeting-logo {
		animation: scale-in 0.6s ease-out forwards;
	}

	.greeting-heading {
		animation: fade-slide-up 0.7s ease-out 0.1s both;
	}

	.greeting-subtitle {
		animation: fade-slide-up 0.7s ease-out 0.3s both;
	}

	.chip {
		opacity: 0;
		animation: fade-slide-up 0.5s ease-out forwards;
		animation-delay: calc(0.5s + var(--chip-delay, 0ms));
	}

	.chip:nth-child(1) { --chip-delay: 0ms; }
	.chip:nth-child(2) { --chip-delay: 100ms; }
	.chip:nth-child(3) { --chip-delay: 200ms; }
	.chip:nth-child(4) { --chip-delay: 300ms; }

	.animate-gradient-x {
		animation: gradient-x 4s ease infinite;
	}
</style>