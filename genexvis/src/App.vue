<template>
  <div>
    <router-view id="main_view" :class="[{'collapsed_sidebar_left' : collapsed_sidebar, 'collapsed_sidebar_right' : collapsed_data}]" />
    <div :class="[{'data_sidebar': !collapsed_data, 'dsb_collapsed': collapsed_data}]">
      <b-card v-if="!collapsed_data" class="dsb_card dsb" body-class="no-padding">
        <h4>
          <u>DESeq2 Files:</u>
        </h4>
        <div class="dsb_filelist">
          <li
            v-for="fileName in this.$store.state.deseqlist"
            :key="fileName"
            style="margin-left: 0.5rem;"
          >
            <small>{{ fileName }}</small>
          </li>
        </div>
      </b-card>

      <b-card v-if="!collapsed_data" class="dsb_card" body-class="no-padding">
        <h4>
          <u>Count files:</u>
        </h4>
        <div class="dsb_filelist">
          <li
            v-for="fileName in this.$store.state.countlist"
            :key="fileName"
            style="margin-left: 0.5rem;"
          >
            <small>{{ fileName }}</small>
          </li>
        </div>
      </b-card>

      <b-card
        v-if="!collapsed_data && this.$store.state.subDGE.geneNames.size > 0"
        id="subsetBox"
        class="dsb_card dsb_subsetBox"
        no-body
      >
        <h4>
          <u>Current Subset:</u>
        </h4>
        <div style="margin-bottom: 0.5rem">
          <b>{{ numberWithCommas(this.$store.state.subDGE.length) }}</b> genes
        </div>
        <div id="genesTable" class="dsb_geneList">
          <button
            v-for="gene in Array.from(this.$store.state.subDGE.geneNames)"
            :key="gene"
            type="button"
            class="btn btn-outline-dark btn-xs dsb_gene-button"
            @click="removeGene(gene)"
          >
            {{ gene }}
          </button>
        </div>
        <div>
          <button class="btn btn-dark " style="float: right; margin-top: 1rem; margin-right: 1rem; background-color: #343438" @click="clearSubset()">
            <font-awesome-icon icon="trash-alt" style="margin-right: 0.2rem" /> Clear
          </button>
        </div>
      </b-card>
      <div v-if="!collapsed_data" class="dsb_use_subset">
        All Data
        <b-form-checkbox v-model="useSubset" name="subset-sutton" switch />
        Subset
      </div>
      <div v-else class="dsb_use_subset_collapsed">
        <span v-if="useSubset" style="padding-right: 0.5rem">Sub</span>
        <span v-else style="padding-right: 0.5rem">All</span>
        <b-form-checkbox v-model="useSubset" name="subset-sutton" switch />
      </div>
      <button class="dsb_toggle_btn" @click="collapsed_data = !collapsed_data">
        <font-awesome-icon slot="toggle-icon" icon="arrows-alt-h" size="lg" />
      </button>
    </div>
    <sidebar-menu
      :menu="menu"
      :collapsed="collapsed_sidebar"
      :show-one-child="true"
      width="15vw"
      @toggle-collapse="onToggleCollapse"
    >
      <div v-if="!collapsed_sidebar" slot="header" style="text-align: center; color: white; margin-top: 0.5rem; margin-bottom: 2rem"><h3><b>{{ $name }} {{ $version }}</b></h3></div>
      <font-awesome-icon slot="dropdown-icon" icon="chevron-right" size="lg" />
      <font-awesome-icon slot="toggle-icon" icon="arrows-alt-h" size="lg" />
    </sidebar-menu>
  </div>
</template>

<script>
  import {SET_SUBDGE} from './store/action_constants'
  import {SWITCH_DGE} from './store/mutation_constants'

  import {library} from '@fortawesome/fontawesome-svg-core'
  import {faCode, faArrowsAltH, faUpload, faDownload, faFileAlt, faBalanceScaleLeft, faChartBar, faChevronRight, faPlusCircle, faMinusCircle, faTrashAlt} from '@fortawesome/free-solid-svg-icons'

  library.add(faCode, faArrowsAltH, faUpload, faDownload, faFileAlt, faBalanceScaleLeft, faChartBar, faChevronRight, faPlusCircle, faMinusCircle, faTrashAlt)

  const separator = {
    template: `<hr style="border-color: rgba(255,255,255,0.2); margin:20px;">`
  }

  export default {
    name: 'App',
    data () {
      return {
        menu: [
          {
            href: '/import',
            title: 'Import',
            icon: {
              element: 'font-awesome-icon',
              attributes: {
                'icon': 'upload'
              }
            }
          },
          {
            href: '/export_deseq2',
            title: 'Export',
            icon: {
              element: 'font-awesome-icon',
              attributes: {
                'icon': 'download'
              }
            }
          },
          {
            component: separator
          },
          {
            title: 'Visualization',
            icon: {
              element: 'font-awesome-icon',
              attributes: {
                'icon': 'chart-bar'
              }
            },
            child: [
              {
                href: '/deseq2/overview',
                title: 'Overview',
              },
              {
                href: '/deseq2/top_10',
                title: 'Top Genes',
              },
              {
                title: 'Scatter plots',
                child: [
                  {
                    href: '/deseq2/volcano_plot',
                    title: 'Volcano plot',
                  },
                  {
                    href: '/deseq2/ma_plot',
                    title: 'MA plot',
                  },
                  {
                    href: '/countdata/genecount_comparison',
                    title: 'Gene counts',
                  },
                ]
              },
              {
                title: 'Bar charts',
                child: [
                  {
                    href: '/countdata/genecount_distribution',
                    title: 'Count distribution',
                  },
                  {
                    href: '/deseq2/distributions',
                    title: 'DESeq2 stats distribution',
                  }
                ]
              },
              {
                title: 'Heat maps',
                child: [
                  {
                    href: '/countdata/genecount_hm',
                    title: 'Counts',
                  }
                ]
              }
            ]
          },
          {
            component: separator
          },
          {
            href: '/changelogs',
            title: 'Changelogs',
            icon: {
              element: 'font-awesome-icon',
              attributes: {
                'icon': 'file-alt'
              }
            },
          },
          {
            href: '/about',
            title: 'About',
            icon: {
              element: 'font-awesome-icon',
              attributes: {
                'icon': 'balance-scale-left'
              }
            },
          },
        ],
        collapsed_sidebar: false,
        collapsed_data: false,
        collapsed_subset_box: true,
        useSubset: false
      }
    },
    watch: {
      useSubset (useSubset) {
        this.$store.commit(SWITCH_DGE, {useSubDGE: useSubset})
      },
      collapsed_data () {
        this.reflow_charts()
      },
      collapsed_sidebar () {
        this.reflow_charts()
      }
    },
    methods: {
      reflow_charts () {
        const vue = this
        const delay = ms => new Promise(res => setTimeout(res, ms))
        delay(1250).then(() => {
          for (const chart of vue.$charts) {
            chart.reflow()
          }
        })
      },
      numberWithCommas (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      },
      removeGene (item) {
        let geneList = []
        for (let entry of this.$store.state.subDGE.geneNames) {
          if (entry !== item) {
            geneList.push(entry)
          }
        }
        this.$store.dispatch(SET_SUBDGE, {geneList: geneList})
      },
      clearSubset () {
        this.$store.dispatch(SET_SUBDGE, {geneList: []})
      },
      onToggleCollapse (collapsed) {
        this.collapsed_sidebar = collapsed
      }
    }
  }
</script>

<style lang="scss">
  /*Customize Bootstrap*/
  @import "../node_modules/bootstrap/scss/functions";
  @import "../node_modules/bootstrap/scss/variables";
  $theme-colors: (
    primary: #4285F4
  );
  @import "../node_modules/bootstrap/scss/bootstrap";

  @import "sidebar_variables.scss";
  @import "../node_modules/vue-sidebar-menu/src/scss/vue-sidebar-menu.scss";
  @import "sidebar_variables.scss";

  #main_view.collapsed_sidebar_left {
    margin-left: 50px;
  }

  #main_view.collapsed_sidebar_right {
    margin-right: 50px;
  }

  #main_view {
    margin-left: 15vw;
    margin-right: 15vw;
    padding: 50px;
    transition: margin-left 0.5s, margin-right 0.5s;
    z-index: 2;
  }

  body {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 16px;
    background-color: #e3e2df;
  }

  .no-padding {
    padding: 0 0 0 0;
  }

  .header {
    text-align: center;
    font-weight: bold;
    padding-bottom: 1rem;
  }

  .v-sidebar-menu {
    transition: width 0.5s;
  }

  .vsm_collapsed > .vsm--list {
      padding-top: $collapsed_padding_top;
  }

  .v-sidebar-menu .vsm--dropdown .vsm--dropdown > .vsm--list {
    background-color: $dropdown-dropdown-bg;
  }

  .vsm--toggle-btn:focus {
    outline: 0;
  }

  .data_sidebar {
    position: fixed;
    display: flex;
    flex-direction: column;
    order: 2;
    flex: 0 0 auto;
    background-color: $base-bg;
    height: 100vh;
    width: 15vw;
    z-index: 1;
    top: 0;
    right: 0;
    overflow-x: hidden;
    transition: width 0.5s;
  }

  .dsb_collapsed {
    position: fixed;
    display: flex;
    flex-direction: column;
    background-color: $base-bg;
    height: 100vh;
    width: 70px;
    order: 2;
    flex: 0 0 auto;
    z-index: 1;
    top: 0;
    right: 0;
    overflow-x: hidden;
    transition: width 0.5s;
  }

  .dsb_use_subset {
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: $icon-color;
    font-weight: bold;
    height: 50px;
    margin-top: auto;
  }

  .dsb_use_subset {
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: $icon-color;
    font-weight: bold;
    height: 50px;
    margin-top: auto;
  }

  .dsb_use_subset_collapsed {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: $icon-color;
    font-weight: bold;
    height: 50px;
    margin-top: auto;
    padding-bottom: 1rem;
  }

  .dsb_toggle_btn {
    background-color: darken( $base-bg, 5% );
    border-color: darken( $base-bg, 5% );
    color: $icon-color;
    height: 50px;
  }

  .dsb_toggle_btn:focus {
    outline: 0;
  }

  .dsb_card {
    display: flex;
    flex-direction: column;
    background-color: $dsb_cards-background;
    color: $item-color;
    height: auto;
    margin: 0.5rem;
    padding: 10px 0 10px 10px;
  }

  @mixin scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
    background-color: $dsb_scrollbar-bg;
  }
  .dsb_card .dsb_filelist::-webkit-scrollbar-track {
    @include scrollbar-track;
  }
  #genesTable::-webkit-scrollbar-track {
    @include scrollbar-track;
  }

  @mixin scrollbar {
    width: 12px;
    background-color: $dsb_scrollbar-bg;
  }
  .dsb_card .dsb_filelist::-webkit-scrollbar {
    @include scrollbar;
  }
  #genesTable::-webkit-scrollbar {
    @include scrollbar;
  }

  @mixin scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: $dsb_scrollbar-bar;
  }
  .dsb_card .dsb_filelist::-webkit-scrollbar-thumb {
    @include scrollbar-thumb
  }
  #genesTable::-webkit-scrollbar-thumb {
    @include scrollbar-thumb
  }

  @mixin scrollbar-corner {
    background: rgba($dsb_scrollbar-bg, 1);
  }
  .dsb_card .dsb_filelist::-webkit-scrollbar-corner {
    @include scrollbar-corner;
  }
  #genesTable::-webkit-scrollbar-corner {
    @include scrollbar-corner
  }

  .dsb_filelist {
    font-size: 1.2rem;
    text-align: left;
    overflow-y: auto;
    overflow-x: auto;
    max-height: 25vh;
    white-space: nowrap;
  }

  .dsb_subsetBox {
    display: flex;
    align-items: stretch;
    min-height: 10vh;
    max-height: 50vh;
  }

  .dsb_geneList {
    background-color: $dsb_cards-background;
    height: auto;
    overflow-y: auto;
  }

  .dsb_gene-button {
    background-color: #e3e2df;
    color: black;
    font-size: 0.8rem;
    padding: 0.2rem;
    margin: 0.1rem;
  }
</style>
