<script>
  import { enhance } from '$app/forms';

  export let form;
</script>

<div class="card">
	<form method="POST" use:enhance>
		<div class="mb-4">
			<label>
				Username
				<input class="input" name="username" id="username" />
			</label>
		</div>
		<div class="flex flex-col sm:flex-row gap-2">
			<button type="submit" class="btn">
				Add User
			</button>
		</div>
	</form>
	{#if form?.message}
		<p class="preset-filled-error-50-950 rounded mt-4 text-center">{form.message}</p>
	{/if}
</div>
