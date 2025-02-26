<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';

	let { children, data } = $props();
</script>

<ParaglideJS {i18n}>
	<div class="h-screen grid grid-rows-[auto_1fr_auto]">
		<!-- Header -->
		<header class="preset-filled-primary-800-200 p-4 flex items-center justify-between">
			<div class="flex items-center gap-1">
				<Avatar name={data.user?.username ?? ''} background="preset-filled-secondary-500" classes="w-10 h-10 rounded-full text-lg flex" />
			</div>
			<a href="/users" class="btn preset-filled-primary-100-900">Switch User</a>
		</header>
		<!-- Main -->
		<main class="preset-filled-surface-100-900 p-4 space-y-4">
			{@render children()}
		</main>
		<!-- Footer -->
		<footer class="preset-filled-primary-200-800 p-4">(footer)</footer>
	</div>
</ParaglideJS>
