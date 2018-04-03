<template>
  <b-navbar toggleable="md" type="dark" variant="dark" style="margin-bottom: 1rem">

    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

    <b-navbar-brand :to="{name: 'Main'}">DGE Visualizer</b-navbar-brand>

    <b-collapse is-nav id="nav_collapse">

      <b-navbar-nav>
        <b-nav-text> {{ thisRoute }}</b-nav-text>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown text="Tools" right>
          <b-dropdown-item to="/upload">
            Upload
          </b-dropdown-item>
          <b-dropdown-item to="/countdata">
            Count data
          </b-dropdown-item>
          <b-dropdown-item to="/deseq2">
            DESeq2
          </b-dropdown-item>
          <b-dropdown-item to="/masigpro">
            maSigPro
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

    </b-collapse>
  </b-navbar>
</template>

<script>
  export default {
    name: 'MainHeader',
    computed: {
      thisRoute () {
        return this.$route.fullPath
      }
    }
  }
</script>
