<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<form method="POST" use:enhance>
	<label for="username">Username:</label>
	<input type="text" id="username" name="username" />
	<button type="submit">Add user</button>
</form>
