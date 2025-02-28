<script lang="ts">

	let { category } = $props();
</script>

<div class="card preset-filled-secondary-100-900 w-full h-36">
	<!-- Header -->
	<div class="flex justify-between p-2">
		{category.name}
		<a href="/shopping/{category.id}" class="btn border">Edit</a>
	</div>
</div>