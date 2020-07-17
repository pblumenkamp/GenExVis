<template>
  <b-navbar
    toggleable="md"
    type="dark"
    variant="dark"
    style="margin-bottom: 1rem;"
  >
    <b-navbar-toggle target="nav_collapse" />

    <b-navbar-brand :to="{name: 'Main'}">
      {{ website_name }}
    </b-navbar-brand>

    <b-collapse id="nav_collapse" is-nav>
      <b-navbar-nav>
        <b-nav-text>
          <small style="margin-right: 1rem;">Version: {{ website_version }}</small>
        </b-nav-text>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-nav-text>All data</b-nav-text>
        <switches
          v-model="useSubset"
          theme="bootstrap"
          color="primary"
          style="padding-top: 0.75rem; padding-left: 0.5rem; padding-right: 0.5rem"
          @input="switchDGE"
        />
        <b-nav-text>Subset</b-nav-text>
        <b-nav-text style="margin-right: 2rem" />
        <b-nav-item-dropdown text="Tools" right>
          <b-dropdown-item to="/import">
            Import Data
          </b-dropdown-item>
          <b-dropdown-item to="/countdata">
            Count data
          </b-dropdown-item>
          <b-dropdown-item to="/deseq2">
            DESeq2
          </b-dropdown-item>
          <b-dropdown-item to="/changelogs">
            Changelogs
          </b-dropdown-item>
          <b-dropdown-item to="/licenses">
            Licenses
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
  import Switches from 'vue-switches'

  import {SWITCH_DGE} from '../store/mutation_constants'

  export default {
    name: 'MainHeader',
    components: {
      Switches
    },
    data () {
      return {
        useSubset: false
      }
    },
    computed: {
      website_name () {
        return this.$name
      },
      website_version () {
        return this.$version
      }
    },
    methods: {
      switchDGE () {
        this.$store.commit(SWITCH_DGE, {useSubDGE: this.useSubset})
      }
    }
  }
</script>
