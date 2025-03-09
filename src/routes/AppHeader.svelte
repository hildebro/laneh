<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';

  let { user } = $props();
</script>
<header class="preset-filled-primary-100-900 p-4 flex items-center justify-between">
	<a href="/" class="btn">Home</a>
	<div class="flex items-center gap-1">
		<a href="/users">
			<Avatar name={user?.username ?? ''}
							background="preset-filled-secondary-500"
							classes="w-10 h-10 rounded-full text-lg flex"
			/>
		</a>
	</div>
</header>