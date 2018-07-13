<template>
{{changelogs_md}}
</template>

<script>
  export default {
    name: 'Changelogs',
    data () {
      return {
        changelogs_md: `
        # Header
        ## Subheader
        Foobar
        ### Subsubheader
        Foo
        ### Subsubheader 2
        # Header 2
        Foo Foo Foo
        `
      }
    }
  }
</script>
