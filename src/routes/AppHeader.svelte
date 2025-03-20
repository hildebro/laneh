<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import { base } from '$app/paths';

  let { user } = $props();
</script>
<header class="p-4 flex items-center justify-between">
	<button class="btn" onclick={() => window.history.back()}>Back</button>
	<div class="flex items-center gap-1">
		<a href="{base}/users">
			<Avatar name={user?.username ?? ''}
							background="preset-filled-secondary-800-200"
							classes="w-10 h-10 rounded-full text-lg flex"
			/>
		</a>
	</div>
</header>