<template>
  <div style="margin: 0 auto; width: 95%">
    <h2 id="010" class="changelog">0.1.0</h2>
    <h3 id="added1change" class="changelog">Added (1 change)</h3>
    <ul>
      <li>First release.</li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'Changelogs'
  }
</script>

<style>
  h2.changelog {
    line-height: 3rem;
    color: black;
  }
  h2.changelog:after {
    content:' ';
    display:block;
    border:1px solid #d0d0d0;
  }
  h3.changelog {
    font-size: 1.5rem;
  }
</style>
