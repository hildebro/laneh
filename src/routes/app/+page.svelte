<script lang="ts">
	import { CalendarDays, ShoppingCart, Star } from 'lucide-svelte';
</script>

<div class="flex flex-col gap-4">
	<button class="btn preset-filled-primary-800-200">
		<ShoppingCart />
		Shopping
	</button>
	<button class="btn preset-filled-primary-800-200">
		<CalendarDays />
		Schedule
	</button>
	<button class="btn preset-filled-primary-800-200">
		<Star />
		Daily Upkeep
	</button>
</div>