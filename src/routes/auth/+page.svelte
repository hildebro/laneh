<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';

	export let form;
</script>

<div class="card">
	<form method="POST" use:enhance>
		<label>
			{m.auth_access_code()}
			<input class="form-input input" type="text" name="otp" required />
		</label>
		<button class="btn mt-1" type="submit">{m.auth_login()}</button>
	</form>

	{#if form?.message}
		<p class="preset-filled-error-50-950 rounded mt-4 text-center">{form.message}</p>
	{/if}
</div>
