<script lang="ts">
	import { goto, replaceState } from "$app/navigation";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import { usePublicConfig } from "$lib/utils/PublicConfig.svelte";

	const publicConfig = usePublicConfig();

	import { ERROR_MESSAGES, error } from "$lib/stores/errors";
	import { pendingMessage } from "$lib/stores/pendingMessage";
	import { useSettingsStore } from "$lib/stores/settings.js";
	import { findCurrentModel } from "$lib/utils/models";
	import { sanitizeUrlParam } from "$lib/utils/urlParams";
	import { onMount, tick } from "svelte";
	import { loading } from "$lib/stores/loading.js";
	import { loadAttachmentsFromUrls } from "$lib/utils/loadAttachmentsFromUrls";
	import { requireAuthUser } from "$lib/utils/auth";
	import { switchTheme, subscribeToTheme } from "$lib/switchTheme";

	import logoSrc from "$lib/assets/WiseFind-logo.png";
	import IconSun from "~icons/lucide/sun";
	import IconMoon from "~icons/lucide/moon";
	import IconLanguages from "~icons/lucide/languages";
	import IconGlobe from "~icons/lucide/globe";
	import IconPlus from "~icons/lucide/plus";
	import IconMic from "~icons/lucide/mic";
	import IconArrowUp from "~icons/lucide/arrow-up";
	import IconBrain from "~icons/lucide/brain";
	import IconHeartPulse from "~icons/lucide/heart-pulse";
	import IconBookOpen from "~icons/lucide/book-open";
	import IconSearch from "~icons/lucide/search";
	import IconArrowUpRight from "~icons/lucide/arrow-up-right";
	import LoginModal from "$lib/components/LoginModal.svelte";
	import CreateProfileModal from "$lib/components/CreateProfileModal.svelte";

	let { data } = $props();

	let isLoginOpen = $state(false);
	let isSignupOpen = $state(false);

	let hasModels = $derived(Boolean(data.models?.length));
	let files: File[] = $state([]);
	let inputValue = $state("");
	let isFocused = $state(false);
	let isDark = $state(true);

	const settings = useSettingsStore();
	let currentModel = $derived(findCurrentModel(data.models, data.oldModels, $settings.activeModel));

	$effect(() => {
		const unsub = subscribeToTheme(({ isDark: dark }) => {
			isDark = dark;
		});
		return unsub;
	});

	async function createConversation(message: string) {
		try {
			$loading = true;

			const validModels = data.models.map((model) => model.id);
			let model;
			if (validModels.includes($settings.activeModel)) {
				model = $settings.activeModel;
			} else {
				model = data.models[0].id;
			}

			const res = await fetch(`${base}/conversation`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model,
					preprompt: $settings.customPrompts[$settings.activeModel],
				}),
			});

			if (!res.ok) {
				let errorMessage = ERROR_MESSAGES.default;
				try {
					const json = await res.json();
					errorMessage = json.message || errorMessage;
				} catch {
					if (res.status === 401) errorMessage = "Authentication required";
				}
				error.set(errorMessage);
				console.error("Error while creating conversation: ", errorMessage);
				return;
			}

			const { conversationId } = await res.json();

			pendingMessage.set({ content: message, files });
			await goto(`${base}/conversation/${conversationId}`, { invalidateAll: true });
		} catch (err) {
			error.set((err as Error).message || ERROR_MESSAGES.default);
			console.error(err);
		} finally {
			$loading = false;
		}
	}

	function handleSubmit() {
		if (!inputValue.trim() || $loading) return;
		void createConversation(inputValue.trim());
		inputValue = "";
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}

	onMount(async () => {
		try {
			const hasQ = page.url.searchParams.has("q");
			const hasPrompt = page.url.searchParams.has("prompt");
			const hasAttachments = page.url.searchParams.has("attachments");

			if ((hasQ || hasPrompt || hasAttachments) && requireAuthUser()) return;

			if (hasAttachments) {
				const result = await loadAttachmentsFromUrls(page.url.searchParams);
				files = result.files;
				if (result.errors.length > 0) {
					console.error("Failed to load some attachments:", result.errors);
					error.set(`Failed to load ${result.errors.length} attachment(s). Check console for details.`);
				}
				const url = new URL(page.url);
				url.searchParams.delete("attachments");
				history.replaceState({}, "", url);
			}

			const query = sanitizeUrlParam(page.url.searchParams.get("q"));
			if (query) {
				void createConversation(query);
				const url = new URL(page.url);
				url.searchParams.delete("q");
				tick().then(() => replaceState(url, page.state));
				return;
			}

			const promptQuery = sanitizeUrlParam(page.url.searchParams.get("prompt"));
			if (promptQuery && !inputValue) {
				inputValue = promptQuery;
				const url = new URL(page.url);
				url.searchParams.delete("prompt");
				tick().then(() => replaceState(url, page.state));
			}
		} catch (err) {
			console.error("Failed to process URL parameters:", err);
		}
	});

	// Suppress unused warning — currentModel still needed for conversation routing
	$effect(() => { void currentModel; });

	const suggestions = [
		{ icon: IconBrain, text: "Summarize recent craniotomy guidelines", tag: "Guidelines" },
		{ icon: IconHeartPulse, text: "Help me with post-op care protocols", tag: "Protocols" },
		{ icon: IconBookOpen, text: "Explain the latest in spinal fusion techniques", tag: "Techniques" },
		{ icon: IconSearch, text: "Review tumor resection approaches", tag: "Review" },
	];
</script>

<svelte:head>
	<title>{publicConfig.PUBLIC_APP_NAME}</title>
</svelte:head>

{#if hasModels}
<div class="relative flex h-full w-full flex-col overflow-hidden font-sans transition-colors duration-500
	{isDark
		? 'bg-gradient-to-br from-[#1e1b4b] via-[#1e2a5e] to-[#2d2a6e] text-white'
		: 'bg-gradient-to-br from-[#f8f0fc] via-[#fdf5f2] to-[#f0f4fa] text-[#2d2a3e]'}">

	<!-- Soft background glow effects (App.tsx) -->
	<div class="pointer-events-none absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full blur-[120px] transition-colors duration-500
		{isDark ? 'bg-[#3730a3] opacity-20' : 'bg-[#fce7f3] opacity-60'}"></div>
	<div class="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full blur-[100px] transition-colors duration-500
		{isDark ? 'bg-[#818cf8] opacity-10' : 'bg-[#e0e7ff] opacity-60'}"></div>
	<div class="pointer-events-none absolute left-[50%] top-[30%] h-[40%] w-[60%] -translate-x-1/2 rounded-full blur-[120px] transition-colors duration-500
		{isDark ? 'bg-[#1e2a5e] opacity-30' : 'bg-[#fae8ff] opacity-50'}"></div>

	<!-- Decorative sparkles (Sparkle component) — z-[1] lifts above blur stacking contexts -->
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
		class="pointer-events-none absolute left-[10%] top-[15%] z-[1] size-8 transition-colors duration-500
		{isDark ? 'text-[#818cf8] opacity-40' : 'text-indigo-200 opacity-60'}">
		<path d="M12 0C12 0 12 9.5 24 12C12 14.5 12 24 12 24C12 24 12 14.5 0 12C12 9.5 12 0 12 0Z" fill="currentColor"/>
	</svg>
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
		class="pointer-events-none absolute right-[15%] top-[25%] z-[1] size-12 transition-colors duration-500
		{isDark ? 'text-[#818cf8] opacity-40' : 'text-indigo-200 opacity-60'}">
		<path d="M12 0C12 0 12 9.5 24 12C12 14.5 12 24 12 24C12 24 12 14.5 0 12C12 9.5 12 0 12 0Z" fill="currentColor"/>
	</svg>
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
		class="pointer-events-none absolute bottom-[30%] left-[20%] z-[1] size-6 transition-colors duration-500
		{isDark ? 'text-[#818cf8] opacity-40' : 'text-indigo-200 opacity-60'}">
		<path d="M12 0C12 0 12 9.5 24 12C12 14.5 12 24 12 24C12 24 12 14.5 0 12C12 9.5 12 0 12 0Z" fill="currentColor"/>
	</svg>
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
		class="pointer-events-none absolute right-[5%] top-[45%] z-[1] size-10 transition-colors duration-500
		{isDark ? 'text-[#818cf8] opacity-40' : 'text-indigo-200 opacity-60'}">
		<path d="M12 0C12 0 12 9.5 24 12C12 14.5 12 24 12 24C12 24 12 14.5 0 12C12 9.5 12 0 12 0Z" fill="currentColor"/>
	</svg>

	<!-- Navbar.tsx -->
	<nav class="relative z-20 flex w-full items-center justify-between px-4 py-3 md:px-8 md:py-5">
		<div class="flex items-center gap-8">
			<div class="flex items-center gap-3">
				<span class="font-['Outfit'] text-xl font-semibold tracking-wide transition-colors duration-500
					{isDark ? 'text-white' : 'text-[#2d2a3e]'}">
					WiseFind
				</span>
			</div>
			<div class="hidden items-center gap-6 text-sm font-medium transition-colors duration-500 md:flex
				{isDark ? 'text-indigo-200' : 'text-[#4b5563]'}">
				<a href="#" class="transition-colors {isDark ? 'hover:text-white' : 'hover:text-[#111827]'}">Use Case</a>
				<a href="#" class="transition-colors {isDark ? 'hover:text-white' : 'hover:text-[#111827]'}">Features</a>
				<a href="#" class="transition-colors {isDark ? 'hover:text-white' : 'hover:text-[#111827]'}">API</a>
				<a href="#" class="transition-colors {isDark ? 'hover:text-white' : 'hover:text-[#111827]'}">Contact</a>
			</div>
		</div>
		<div class="flex items-center gap-5">
			<div class="hidden items-center gap-3 border-r pr-5 transition-colors duration-500 sm:flex
				{isDark ? 'border-[#3730a3] text-indigo-200' : 'border-gray-200 text-[#4b5563]'}">
				<button onclick={switchTheme} aria-label="Toggle theme"
					class="transition-colors {isDark ? 'hover:text-white' : 'hover:text-[#111827]'}">
					{#if isDark}<IconSun class="size-5" />{:else}<IconMoon class="size-5" />{/if}
				</button>
				<button aria-label="Language" class="transition-colors {isDark ? 'hover:text-white' : 'hover:text-[#111827]'}">
					<IconLanguages class="size-5" />
				</button>
				<button aria-label="Region" class="transition-colors {isDark ? 'hover:text-white' : 'hover:text-[#111827]'}">
					<IconGlobe class="size-5" />
				</button>
			</div>
			<button
				onclick={() => (isLoginOpen = true)}
				class="text-sm font-medium transition-colors duration-500
				{isDark ? 'text-indigo-200 hover:text-white' : 'text-[#4b5563] hover:text-[#111827]'}">
				Login
			</button>
			<button class="rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-500
				{isDark ? 'border-indigo-400/50 text-white hover:bg-white/5' : 'border-gray-300 text-[#111827] hover:bg-gray-50'}">
				Sources
			</button>
		</div>
	</nav>

	<!-- App.tsx main — overflow-y-auto + min-h-0 allows scrolling on short viewports -->
	<main class="relative z-10 flex flex-1 flex-col items-center justify-center min-h-0 overflow-hidden pt-2 w-full md:pt-4">

		<!-- GreetingSection.tsx -->
		<div class="mx-auto mb-3 mt-1 flex w-full max-w-4xl flex-col items-center justify-center px-4 text-center">
			<div class="greeting-logo mb-3 flex size-28 items-center justify-center rounded-full shadow-md md:size-24
				{isDark ? 'bg-[#c7d2fe]' : 'bg-gradient-to-br from-white via-purple-100 to-purple-200'}">
				<img src={logoSrc} alt="WiseFind Logo" class="size-21 object-contain md:size-22" />
			</div>
			<h1 class="greeting-heading mb-3 font-['Outfit'] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-7xl">
				<span class="animate-gradient-x bg-clip-text text-transparent
					{isDark
						? 'bg-gradient-to-r from-[#818cf8] via-[#c7d2fe] to-[#818cf8]'
						: 'bg-gradient-to-r from-[#4f46e5] via-[#9333ea] to-[#db2777]'}">
					Hello, Doctor
				</span>
			</h1>
			<p class="greeting-subtitle text-base font-light transition-colors duration-500 md:text-xl lg:text-2xl
				{isDark ? 'text-indigo-200/80' : 'text-[#4b5563]'}">
				How can I assist you today?
			</p>
		</div>

		<!-- SuggestionChips.tsx -->
		<div class="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-4 md:px-6 lg:grid-cols-4">
			{#each suggestions as suggestion, i}
				{@const Icon = suggestion.icon}
				<button
					onclick={() => createConversation(suggestion.text)}
					class="chip group relative flex h-28 flex-col items-start justify-between overflow-hidden rounded-2xl border p-4 text-left backdrop-blur-md transition-colors duration-300 md:h-32
						{isDark
							? 'border-[#3730a3]/50 bg-[#1e2a5e]/40 shadow-lg shadow-black/10 hover:border-[#818cf8]/60 hover:bg-[#1e2a5e]/60'
							: 'border-white/80 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-200 hover:bg-white/80 hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)]'}"
				>
					<div class="absolute right-0 top-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100
						{isDark ? 'text-[#818cf8]' : 'text-indigo-400'}">
						<IconArrowUpRight class="size-5" />
					</div>
					<div class="flex items-center gap-3">
						<div class="rounded-full p-2.5 transition-colors
							{isDark
								? 'bg-[#3730a3]/40 text-[#a5b4fc] group-hover:bg-[#3730a3]/80 group-hover:text-white'
								: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}">
							<Icon class="size-5" />
						</div>
						<span class="rounded-full border px-2 py-1 text-xs font-medium transition-colors
							{isDark
								? 'border-indigo-500/30 bg-indigo-900/30 text-indigo-300'
								: 'border-indigo-100 bg-white/50 text-indigo-500/80'}">
							{suggestion.tag}
						</span>
					</div>
					<span class="pr-4 text-xs font-medium leading-snug transition-colors
						{isDark ? 'text-indigo-100' : 'text-[#2d2a3e]'}">
						{suggestion.text}
					</span>
				</button>
			{/each}
		</div>
	</main>

	<!-- ChatInput.tsx -->
	<div class="chat-input flex justify-center p-3 transition-colors duration-500 md:p-6
		{isDark
			? 'bg-gradient-to-t from-[#1e1b4b] via-[#1e1b4b]/90 to-transparent'
			: 'bg-gradient-to-t from-[#f8f0fc] via-[#f8f0fc]/90 to-transparent'}">
		<div class="relative w-full max-w-3xl">
			<div class="relative flex items-center rounded-full border backdrop-blur-xl shadow-lg transition-all duration-300
				{isDark
					? isFocused
						? 'border-[#818cf8] bg-[#1e2a5e] shadow-[0_0_20px_rgba(129,140,248,0.2)]'
						: 'border-[#3730a3] bg-[#1e2a5e]/80 hover:border-[#818cf8]/50'
					: isFocused
						? 'border-indigo-300 bg-white shadow-[0_8px_30px_rgba(99,102,241,0.15)]'
						: 'border-gray-200 bg-white/90 hover:border-indigo-200'}">
				<button aria-label="Attach"
					class="ml-2 rounded-full p-3 transition-colors
					{isDark ? 'text-indigo-300 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'}">
					<IconPlus class="size-5" />
				</button>
				<input
					type="text"
					bind:value={inputValue}
					onfocus={() => (isFocused = true)}
					onblur={() => (isFocused = false)}
					onkeydown={handleKeydown}
					placeholder="Ask WiseFind anything..."
					disabled={$loading}
					class="w-full flex-1 border-none bg-transparent px-2 py-4 text-base outline-none transition-colors md:text-lg
						{isDark ? 'text-white placeholder:text-indigo-300/60' : 'text-[#2d2a3e] placeholder:text-gray-400'}"
				/>
				<div class="flex items-center gap-1 pr-2">
					<button aria-label="Voice"
						class="rounded-full p-3 transition-colors
						{isDark ? 'text-indigo-300 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'}">
						<IconMic class="size-5" />
					</button>
					<button onclick={handleSubmit} disabled={!inputValue.trim() || $loading} aria-label="Send"
						class="rounded-full p-2.5 transition-all duration-300
							{inputValue.trim()
								? isDark
									? 'scale-100 bg-[#818cf8] text-white shadow-md hover:bg-[#a5b4fc]'
									: 'scale-100 bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
								: isDark
									? 'scale-95 cursor-not-allowed bg-[#3730a3]/50 text-indigo-300/50'
									: 'scale-95 cursor-not-allowed bg-gray-100 text-gray-400'}">
						<IconArrowUp class="size-5" />
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<LoginModal
	isOpen={isLoginOpen}
	onclose={() => (isLoginOpen = false)}
	onSwitchToSignup={() => { isLoginOpen = false; isSignupOpen = true; }}
	{isDark}
/>
<CreateProfileModal isOpen={isSignupOpen} onclose={() => (isSignupOpen = false)} {isDark} />

{:else}
<div class="mx-auto my-20 max-w-xl rounded-xl border p-6 text-center dark:border-gray-700">
	<h2 class="mb-2 text-xl font-semibold">No models available</h2>
	<p class="text-gray-600 dark:text-gray-300">
		No chat models are configured. Set <code>OPENAI_BASE_URL</code> and ensure the server can reach
		the endpoint, then reload.
	</p>
</div>
{/if}

<style>
	/* GreetingSection entrance animations — framer-motion equivalents */
	@keyframes fade-slide-up {
		from { opacity: 0; translate: 0 20px; }
		to   { opacity: 1; translate: 0 0; }
	}
	@keyframes scale-in {
		from { opacity: 0; scale: 0.9; }
		to   { opacity: 1; scale: 1; }
	}
	/* Matches index.css animate-gradient-x */
	@keyframes gradient-x {
		0%, 100% { background-position: 0% 50%; }
		50%       { background-position: 100% 50%; }
	}

	.greeting-logo     { animation: scale-in      0.6s ease-out 0s   both; }
	.greeting-heading  { animation: fade-slide-up 0.7s ease-out 0.1s both; }
	.greeting-subtitle { animation: fade-slide-up 0.7s ease-out 0.3s both; }

	/* SuggestionChips stagger — matches staggerChildren:0.1, delayChildren:0.5 */
	.chip {
		opacity: 0;
		animation: fade-slide-up 0.5s ease-out both;
	}
	.chip:nth-child(1) { animation-delay: 500ms; }
	.chip:nth-child(2) { animation-delay: 600ms; }
	.chip:nth-child(3) { animation-delay: 700ms; }
	.chip:nth-child(4) { animation-delay: 800ms; }

	/* whileHover: { y: -6, scale: 1.01 } / whileTap: { scale: 0.98 } */
	.chip { transition: transform 0.2s ease, box-shadow 0.3s ease; }
	.chip:hover  { transform: translateY(-6px) scale(1.01); }
	.chip:active { transform: scale(0.98); }

	/* ChatInput entrance — delay: 0.8 */
	.chat-input { animation: fade-slide-up 0.6s ease-out 0.8s both; }

	.animate-gradient-x {
		animation: gradient-x 3s ease infinite;
		background-size: 200% 200%;
	}
</style>