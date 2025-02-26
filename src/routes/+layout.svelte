<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import AppHeader from './AppHeader.svelte';

	let { children, data } = $props();
</script>

<ParaglideJS {i18n}>
	<div class="h-screen grid grid-rows-[auto_1fr_auto]">
		<!-- Header -->
		<AppHeader user={data.user}></AppHeader>
		<!-- Main -->
		<main class="preset-filled-surface-100-900 p-4 space-y-4">
			{@render children()}
		</main>
		<!-- Footer -->
		<footer class="preset-filled-primary-200-800 p-4">(footer)</footer>
	</div>
</ParaglideJS>
