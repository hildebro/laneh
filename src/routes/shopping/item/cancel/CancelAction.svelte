<script lang="ts">
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
</script>

<form method="POST" action={resolve('/shopping/item/cancel')}>
  <button type="submit">{m.shopping_cancel_staging()}</button>
</form>
