<script lang="ts">
  import { CalendarDays, ShoppingCart, Star } from 'lucide-svelte';
</script>

<div class="flex flex-col gap-4 card">
	<a class="btn" href="shopping">
		<ShoppingCart />
		Shopping
	</a>
	<a class="btn" href="schedule">
		<CalendarDays />
		Schedule
	</a>
	<button class="btn cursor-not-allowed" disabled>
		<Star />
		Daily Upkeep
	</button>
</div>