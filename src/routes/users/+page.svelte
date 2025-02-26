<script lang="ts">

	let { data } = $props();
</script>

{#await data.users}
	loading...
{:then users}
	{#each users as user}
		<form method="POST" action="?/select">
			<input type="hidden" name="userId" value={user.id}>
			<button type="submit" class="card preset-filled-secondary-100-900">{user.username}</button>
		</form>
	{/each}
	<a class="card preset-filled-primary-100-900" href="/users/add">
		Add new user
	</a>
{/await}
