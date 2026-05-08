<script lang="ts">
  let {
    label,
    name,
    value = $bindable(),
    type = 'text'
  }: {
    label: string;
    name: string;
    value: string;
    type?: 'text' | 'password' | 'number';
  } = $props();
</script>

<label>
  {label}
  <input
    class="input"
    {type}
    {name}
    id={name}
    bind:value
  />
</label>