import Vue from 'vue'
import Router from 'vue-router'
import MainBody from '@/components/MainBody'
import ImportMain from '@/components/Import/ImportMain'
import CountDataMain from '@/components/CountData/CountDataMain'
import CountDataGeneCountHM from '@/components/CountData/CountDataGeneCountHM'
import CountDataDistribution from '@/components/CountData/CountDataDistribution'
import CountDataComparison from '@/components/CountData/CountDataComparison'
import Deseq2Main from '@/components/DESeq2/Deseq2Main'
import Deseq2Overview from '@/components/DESeq2/Deseq2Overview'
import Deseq2VolcanoPlot from '@/components/DESeq2/Deseq2VolcanoPlot'
import Deseq2MAPlot from '@/components/DESeq2/Deseq2MAPlot'
import Deseq2Distributions from '@/components/DESeq2/Deseq2Distributions'
import Deseq2Top10 from '@/components/DESeq2/Deseq2Top10'
import Changelogs from '@/components/Changelogs/ChangelogsMain'
import Deseq2Download from '@/components/DESeq2/Deseq2Download'
import Licenses from '@/components/Licenses/Licenses'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: 'import',
      name: 'Main',
      component: MainBody
    },
    {
      path: '/import',
      name: 'Data Import',
      component: ImportMain
    },
    {
      path: '/countdata',
      redirect: {name: 'CountData_GeneCountHM'},
      name: 'CountData',
      component: CountDataMain,
      children: [
        {
          path: 'genecount_hm',
          name: 'CountData_GeneCountHM',
          component: CountDataGeneCountHM
        },
        {
          path: 'genecount_distribution',
          name: 'CountData_Distribution',
          component: CountDataDistribution
        },
        {
          path: 'genecount_comparison',
          name: 'CountData_Comparison',
          component: CountDataComparison
        }
      ]
    },
    {
      path: '/deseq2',
      redirect: {name: 'Deseq2_overview'},
      name: 'Deseq2',
      component: Deseq2Main,
      children: [
        {
          path: 'overview',
          name: 'Deseq2_overview',
          component: Deseq2Overview
        },
        {
          path: 'volcano_plot',
          name: 'Deseq2_volcano_plot',
          component: Deseq2VolcanoPlot
        },
        {
          path: 'ma_plot',
          name: 'Deseq2_ma_plot',
          component: Deseq2MAPlot
        },
        {
          path: 'distributions',
          name: 'Deseq2_distributions',
          component: Deseq2Distributions
        },
        {
          path: 'top_10',
          name: 'Deseq2_Top_10',
          component: Deseq2Top10
        },
        {
          path: 'deseq2download',
          name: 'Deseq2_Download',
          component: Deseq2Download
        }
      ]
    },
    {
      path: '/changelogs',
      name: 'Changelogs',
      component: Changelogs
    },
    {
      path: '/licenses',
      name: 'Licenses',
      component: Licenses
    }
  ]
})
