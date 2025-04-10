<script lang="ts">
  import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';

  export let form;
</script>

<div class="card">
	<form method="POST" use:enhance>
		<div class="mb-4">
			<label>
				{m.settings_users_username()}
				<br/>
				<input type="text" name="username" id="username" />
			</label>
		</div>
		<div class="flex flex-col sm:flex-row gap-2">
			<button type="submit" class="btn">
				{m.settings_users_add()}
			</button>
		</div>
	</form>
	{#if form?.message}
		<p class="preset-filled-error-50-950 rounded mt-4 text-center">{form.message}</p>
	{/if}
</div>
