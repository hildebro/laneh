<script lang="ts">
  import { CalendarDays, ShoppingCart, Star } from 'lucide-svelte';
</script>

<div class="flex flex-col gap-4">
	<a class="btn preset-filled-primary-800-200" href="/shopping">
		<ShoppingCart />
		Shopping
	</a>
	<button class="btn preset-filled-primary-800-200 cursor-not-allowed" disabled>
		<CalendarDays />
		Schedule
	</button>
	<button class="btn preset-filled-primary-800-200 cursor-not-allowed" disabled>
		<Star />
		Daily Upkeep
	</button>
</div>