<script lang="ts">
	import { fade, fly } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import Portal from "./Portal.svelte";
	import IconX from "~icons/lucide/x";
	import IconCamera from "~icons/lucide/camera";
	import IconMail from "~icons/lucide/mail";
	import IconLock from "~icons/lucide/lock";
	import IconUser from "~icons/lucide/user";

	interface Props {
		isOpen: boolean;
		onclose: () => void;
		isDark?: boolean;
	}

	let { isOpen, onclose, isDark = true }: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") onclose();
	}

	const inputClass = (dark: boolean) =>
		`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
			dark
				? "bg-[#2d2a6e]/50 border border-[#3730a3] focus:border-[#818cf8] focus:ring-1 focus:ring-[#818cf8] placeholder-indigo-300/30 text-white"
				: "bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
		}`;
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
					<h2 class="text-2xl font-semibold font-['Outfit']">Create Profile</h2>
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
				<div class="p-6 space-y-6">
					<!-- Avatar upload -->
					<div class="flex flex-col items-center justify-center gap-3">
						<div
							class="relative size-24 rounded-full flex items-center justify-center cursor-pointer group transition-colors
								{isDark ? 'bg-[#2d2a6e] hover:bg-[#3730a3]' : 'bg-indigo-50 hover:bg-indigo-100'}"
						>
							<IconUser class="size-10 {isDark ? 'text-indigo-300' : 'text-indigo-300'}" />
							<div
								class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<IconCamera class="size-6 text-white" />
							</div>
						</div>
						<span class="text-sm {isDark ? 'text-indigo-200' : 'text-gray-500'}">Add photo</span>
					</div>

					<!-- Form fields -->
					<div class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-1.5">
								<label class="text-xs font-medium pl-1 {isDark ? 'text-indigo-200' : 'text-gray-600'}">
									First Name
								</label>
								<div class="relative">
									<input type="text" placeholder="Jane" class={inputClass(isDark)} />
									<IconUser class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 {isDark ? 'text-indigo-300/50' : 'text-gray-400'}" />
								</div>
							</div>
							<div class="space-y-1.5">
								<label class="text-xs font-medium pl-1 {isDark ? 'text-indigo-200' : 'text-gray-600'}">
									Last Name
								</label>
								<div class="relative">
									<input type="text" placeholder="Doe" class={inputClass(isDark)} />
									<IconUser class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 {isDark ? 'text-indigo-300/50' : 'text-gray-400'}" />
								</div>
							</div>
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-medium pl-1 {isDark ? 'text-indigo-200' : 'text-gray-600'}">
								Email Address
							</label>
							<div class="relative">
								<input type="email" placeholder="jane@example.com" class={inputClass(isDark)} />
								<IconMail class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 {isDark ? 'text-indigo-300/50' : 'text-gray-400'}" />
							</div>
						</div>

						<div class="space-y-1.5">
							<label class="text-xs font-medium pl-1 {isDark ? 'text-indigo-200' : 'text-gray-600'}">
								Password
							</label>
							<div class="relative">
								<input type="password" placeholder="••••••••" class={inputClass(isDark)} />
								<IconLock class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 {isDark ? 'text-indigo-300/50' : 'text-gray-400'}" />
							</div>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="p-6 pt-4 flex flex-col gap-4 {isDark ? 'bg-[#1e1b4b]' : 'bg-white'}">
					<div class="flex items-center justify-between gap-3">
						<button
							onclick={onclose}
							class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors
								{isDark ? 'text-indigo-200 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}"
						>
							Cancel
						</button>
						<button
							class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors
								{isDark
									? 'bg-[#818cf8] text-[#1e1b4b] hover:bg-[#6366f1]'
									: 'bg-indigo-600 text-white hover:bg-indigo-700'}"
						>
							Create Profile
						</button>
					</div>

					<!-- Step indicators -->
					<div class="flex justify-center gap-1.5 mt-2">
						<div class="w-6 h-1.5 rounded-full {isDark ? 'bg-[#818cf8]' : 'bg-indigo-600'}"></div>
						<div class="w-1.5 h-1.5 rounded-full {isDark ? 'bg-[#3730a3]' : 'bg-gray-200'}"></div>
						<div class="w-1.5 h-1.5 rounded-full {isDark ? 'bg-[#3730a3]' : 'bg-gray-200'}"></div>
					</div>
				</div>
			</div>
		</div>
	</Portal>
{/if}
