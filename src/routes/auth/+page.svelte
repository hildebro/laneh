<script lang="ts">
  import { enhance } from '$app/forms';

  export let form;
</script>

<div class="card">
	<form method="POST" use:enhance>
		<label>
			Access code:
			<input class="form-input input" type="text" name="otp" required />
		</label>
		<button class="btn mt-1" type="submit">Login</button>
	</form>

	{#if form?.message}
		<p class="preset-filled-error-50-950 rounded mt-4 text-center">{form.message}</p>
	{/if}
</div>
