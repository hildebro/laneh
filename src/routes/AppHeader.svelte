<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton-svelte';

	let { user } = $props();
</script>
<header class="preset-filled-primary-800-200 p-4 flex items-center justify-between">
	<div class="flex items-center gap-1">
		<Avatar name={user?.username ?? ''} background="preset-filled-secondary-500"
						classes="w-10 h-10 rounded-full text-lg flex" />
	</div>
	<a href="/users" class="btn preset-filled-primary-100-900">Switch User</a>
</header>