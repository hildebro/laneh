<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import type { PageServerData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet, data: PageServerData } = $props();
</script>

<div class="h-screen grid grid-rows-[auto_1fr_auto]">
	<!-- Header -->
	<header class="preset-filled-primary-800-200 p-4 flex items-center justify-between">
		<div class="flex items-center gap-1">
			<Avatar name="A H" background="preset-filled-secondary-500" classes="w-10 h-10 rounded-full text-lg flex" />
			{data?.user.username}
		</div>
		<form method="post" action="/logout">
		<button class="btn preset-filled-primary-100-900">logout</button>
		</form>
	</header>
	<!-- Main -->
	<main class="preset-filled-surface-100-900 p-4 space-y-4">
		{@render children()}
	</main>
	<!-- Footer -->
	<footer class="preset-filled-primary-200-800 p-4">(footer)</footer>
</div>
