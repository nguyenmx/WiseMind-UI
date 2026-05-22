<script lang="ts">
	import { fade, fly } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import Portal from "./Portal.svelte";
	import IconX from "~icons/lucide/x";
	import IconMail from "~icons/lucide/mail";
	import IconLock from "~icons/lucide/lock";

	interface Props {
		isOpen: boolean;
		onclose: () => void;
		onSwitchToSignup?: () => void;
		isDark?: boolean;
	}

	let { isOpen, onclose, onSwitchToSignup, isDark = true }: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<Portal>
		<!-- Backdrop -->
		<div
			role="presentation"
			transition:fade={{ duration: 200, easing: cubicOut }}
			onclick={handleBackdropClick}
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
		>
			<!-- Modal card -->
			<div
				transition:fly={{ y: 12, duration: 220, easing: cubicOut }}
				class="w-full max-w-md overflow-hidden rounded-3xl shadow-2xl pointer-events-auto
					{isDark
						? 'bg-[#1e1b4b] border border-[#3730a3] text-white'
						: 'bg-white border border-gray-100 text-[#2d2a3e]'}"
			>
				<!-- Header -->
				<div class="relative p-6 pb-0 flex justify-between items-center">
					<div>
						<h2 class="text-2xl font-semibold font-['Outfit']">Welcome</h2>
						<p class="text-sm mt-1 {isDark ? 'text-indigo-200/70' : 'text-gray-500'}">
							Log into WiseFind
						</p>
					</div>
					<button
						onclick={onclose}
						class="p-2 rounded-full transition-colors {isDark
							? 'hover:bg-white/10 text-indigo-200'
							: 'hover:bg-gray-100 text-gray-500'}"
					>
						<IconX class="size-5" />
					</button>
				</div>

				<!-- Body -->
				<div class="p-6 space-y-5">
					<!-- Social buttons -->
					<div class="space-y-3">
						{#each [
							{ label: 'Continue with Google', icon: 'google' },
							{ label: 'Continue with GitHub', icon: 'github' },
							{ label: 'Continue with Apple',  icon: 'apple'  },
						] as provider}
							<button
								class="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl text-sm font-medium border transition-colors
									{isDark
										? 'bg-white/5 border-[#3730a3] hover:bg-white/10 text-indigo-100'
										: 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}"
							>
								{#if provider.icon === 'google'}
									<svg class="size-5" viewBox="0 0 24 24">
										<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
										<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
										<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
										<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
									</svg>
								{:else if provider.icon === 'github'}
									<svg class="size-5" viewBox="0 0 24 24" fill={isDark ? '#fff' : '#333'}>
										<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
									</svg>
								{:else}
									<svg class="size-5" viewBox="0 0 24 24" fill={isDark ? '#fff' : '#333'}>
										<path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
									</svg>
								{/if}
								{provider.label}
							</button>
						{/each}
					</div>

					<!-- Divider -->
					<div class="flex items-center gap-4">
						<div class="flex-1 h-px {isDark ? 'bg-[#3730a3]/50' : 'bg-gray-200'}"></div>
						<span class="text-xs font-medium {isDark ? 'text-indigo-300/60' : 'text-gray-400'}">or</span>
						<div class="flex-1 h-px {isDark ? 'bg-[#3730a3]/50' : 'bg-gray-200'}"></div>
					</div>

					<!-- Email & Password -->
					<div class="space-y-4">
						<div class="space-y-1.5">
							<label class="text-xs font-medium pl-1 {isDark ? 'text-indigo-200' : 'text-gray-600'}">
								Email Address
							</label>
							<div class="relative">
								<input
									type="email"
									placeholder="you@example.com"
									class="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all
										{isDark
											? 'bg-[#2d2a6e]/50 border border-[#3730a3] focus:border-[#818cf8] focus:ring-1 focus:ring-[#818cf8] placeholder-indigo-300/30 text-white'
											: 'bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400'}"
								/>
								<IconMail class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 {isDark ? 'text-indigo-300/50' : 'text-gray-400'}" />
							</div>
						</div>

						<div class="space-y-1.5">
							<div class="flex items-center justify-between">
								<label class="text-xs font-medium pl-1 {isDark ? 'text-indigo-200' : 'text-gray-600'}">
									Password
								</label>
								<button class="text-xs font-medium {isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}">
									Forgot password?
								</button>
							</div>
							<div class="relative">
								<input
									type="password"
									placeholder="••••••••"
									class="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all
										{isDark
											? 'bg-[#2d2a6e]/50 border border-[#3730a3] focus:border-[#818cf8] focus:ring-1 focus:ring-[#818cf8] placeholder-indigo-300/30 text-white'
											: 'bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400'}"
								/>
								<IconLock class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 {isDark ? 'text-indigo-300/50' : 'text-gray-400'}" />
							</div>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="p-6 pt-2 flex flex-col gap-4 {isDark ? 'bg-[#1e1b4b]' : 'bg-white'}">
					<button
						class="w-full py-2.5 rounded-xl text-sm font-medium transition-colors
							{isDark
								? 'bg-[#818cf8] text-[#1e1b4b] hover:bg-[#6366f1]'
								: 'bg-indigo-600 text-white hover:bg-indigo-700'}"
					>
						Log In
					</button>

					<p class="text-center text-sm {isDark ? 'text-indigo-200/60' : 'text-gray-500'}">
						Don't have an account?{" "}
						<button
							onclick={() => { onclose(); onSwitchToSignup?.(); }}
							class="font-medium {isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}"
						>
							Sign up
						</button>
					</p>
				</div>
			</div>
		</div>
	</Portal>
{/if}
