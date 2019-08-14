<template>
  <div id="app" :class="[{'collapsed' : collapsed}]">
    <div class="app">
      <router-view />
      <sidebar-menu
        :menu="menu"
        :collapsed="collapsed"
        :show-one-child="true"
        width="15vw"
        @toggle-collapse="onToggleCollapse"
        @item-click="onItemClick"
      >
        <div v-if="!collapsed" slot="header" style="text-align: center; color: white; margin-top: 0.5rem"><h3><b>GenExVis {{ $version }}</b></h3></div>
        <font-awesome-icon slot="dropdown-icon" icon="chevron-right" size="lg" />
        <font-awesome-icon slot="toggle-icon" icon="arrows-alt-h" size="lg" />
      </sidebar-menu>
    </div>
  </div>
</template>

<script>
  import {library} from '@fortawesome/fontawesome-svg-core'
  import {faCode, faArrowsAltH, faUpload, faDownload, faFileAlt, faBalanceScaleLeft, faChartBar, faChevronRight} from '@fortawesome/free-solid-svg-icons'

  library.add(faCode, faArrowsAltH, faUpload, faDownload, faFileAlt, faBalanceScaleLeft, faChartBar, faChevronRight)

  const separator = {
    template: `<hr style="border-color: rgba(255, 255, 255, 0.2); margin: 20px;">`
  }

  export default {
    name: 'App',
    data () {
      return {
        menu: [
          {
            header: true,
            title: 'Import/Export',
            hiddenOnCollapse: true
          },
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
            title: 'Export DESeq2',
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
            href: '/licenses',
            title: 'About',
            icon: {
              element: 'font-awesome-icon',
              attributes: {
                'icon': 'balance-scale-left'
              }
            },
          },
        ],
        collapsed: false
      }
    },
    methods: {
      onToggleCollapse (collapsed) {
        this.collapsed = collapsed
      },
      onItemClick () {
        // console.log(event)
        // console.log(item)
      }
    }
  }
</script>

<style lang="scss">
  @import "sidebar_variables.scss";
  @import "../node_modules/vue-sidebar-menu/src/scss/vue-sidebar-menu.scss";
  @import "sidebar_variables.scss";

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding-left: 300px;
  }

  #app.collapsed {
    padding-left: 50px;
  }

  .app {
    padding: 50px;
  }

  body,
  html {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 16px;
    background-color: #ededf2;
  }

  .vsm_collapsed > .vsm--list {
      padding-top: $collapsed_padding_top;
  }

  .v-sidebar-menu .vsm--dropdown .vsm--dropdown .vsm--list {
    background-color: $dropdown-dropdown-bg;
  }
</style>
