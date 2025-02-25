<script>
	import { enhance } from '$app/forms';

	export let form;
</script>

<div class="flex justify-center items-center h-screen bg-surface-100">
	<div class="card p-8 w-full max-w-sm  preset-filled-primary-100-900">
		<h1 class="h2 text-center mb-6">Chorehub</h1>
		<form method="post" action="?/login" use:enhance>
			<div class="mb-4">
				<label>
					Username
					<input class="input preset-filled-primary-50-950 border" name="username" id="username" />
				</label>
			</div>
			<div class="mb-6">
				<label>
					Password
					<input class="input preset-filled-primary-50-950 border" type="password" name="password" id="password" />
				</label>
			</div>
			<div class="flex flex-col sm:flex-row gap-2">
				<button class="btn preset-filled-primary-800-200 variant-filled w-full sm:w-1/2">Login</button>
				<button formaction="?/register" class="btn preset-filled-primary-50-950 variant-outline w-full sm:w-1/2 ">
					Register
				</button>
			</div>
		</form>
		{#if form?.message}
			<p class="preset-filled-error-50-950 rounded mt-4 text-center">{form.message}</p>
		{/if}
	</div>
</div>
