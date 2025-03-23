<script lang="ts">
  import { enhance } from '$app/forms';

  export let form;
</script>

<div class="card">
	<h1>Login</h1>

	<form method="POST" use:enhance>
		<label for="otp">OTP:</label>
		<input type="text" name="otp" required />
		<button type="submit">Login</button>
	</form>

	{#if form?.message}
		<p class="preset-filled-error-50-950 rounded mt-4 text-center">{form.message}</p>
	{/if}
</div>
