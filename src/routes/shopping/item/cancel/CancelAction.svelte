<script lang="ts">
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
</script>

<form method="POST" action={resolve('/shopping/item/cancel')} class="mb-2 ml-auto">
  <button type="submit" class="btn preset-filled-warning-900-100">{m.shopping_cancel_staging()}</button>
</form>
