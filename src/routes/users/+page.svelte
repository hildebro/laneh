<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

{#await data.users}
	loading...
{:then users}
	<div class="flex gap-4 justify-center items-center w-full h-full">
		{#each users as user}
			<form method="POST" action="?/select" use:enhance>
				<input type="hidden" name="userId" value={user.id}>
				<button type="submit" class="card btn preset-filled-secondary-100-900 w-32 h-24">{user.username}</button>
			</form>
		{/each}
		<a class="card btn preset-filled-primary-100-900 w-32 h-24" href="/users/add">
			Add new user
		</a>
	</div>
{/await}
