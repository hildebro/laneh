<script>
  import { enhance } from '$app/forms';

  export let form;
</script>

<div class="flex justify-center items-center h-full bg-surface-100">
	<div class="card p-8  preset-filled-primary-100-900">
		<form method="POST" use:enhance>
			<div class="mb-4">
				<label>
					Username
					<input class="input preset-filled-primary-50-950 border" name="username" id="username" />
				</label>
			</div>
			<div class="flex flex-col sm:flex-row gap-2">
				<button type="submit" class="btn preset-filled-primary-800-200 variant-outline w-full sm:w-1/2 ">
					Add User
				</button>
			</div>
		</form>
		{#if form?.message}
			<p class="preset-filled-error-50-950 rounded mt-4 text-center">{form.message}</p>
		{/if}
	</div>
</div>
