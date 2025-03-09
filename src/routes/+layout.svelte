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
		<main class="p-4 space-y-4 flex flex-col justify-center items-center">
			{@render children()}
		</main>
		<!-- Footer -->
		<footer class="p-4">(footer)</footer>
	</div>
</ParaglideJS>
