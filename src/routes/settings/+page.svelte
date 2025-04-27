<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
</script>

<div class="flex flex-col gap-4 card">
  <a class="btn" href="settings/users">
    {m.settings_users_headline()}
  </a>
  <a class="btn" href="settings/items">
    {m.settings_items_headline()}
  </a>
  <a class="btn" href="settings/categories">
    {m.settings_categories_headline()}
  </a>
</div>
