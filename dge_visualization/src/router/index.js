import Vue from 'vue'
import Router from 'vue-router'
import MainBody from '@/components/MainBody'
import Deseq2Main from '@/components/DESeq2/Deseq2Main'
import Deseq2Upload from '@/components/DESeq2/Deseq2Upload'
import Deseq2Overview from '@/components/DESeq2/Deseq2Overview'
import Deseq2OverviewTEST from '@/components/DESeq2/Deseq2OverviewTEST'
import RichGridExample from '@/components/DESeq2/RichGridExample'
import Deseq2VolcanoPlot from '@/components/DESeq2/Deseq2VolcanoPlot'
import MaSigPro from '@/components/MaSigPro'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Main',
      component: MainBody
    },
    {
      path: '/deseq2',
      redirect: {name: 'Deseq2_upload'},
      name: 'Deseq2',
      component: Deseq2Main,
      children: [
        {
          path: 'upload',
          name: 'Deseq2_upload',
          component: Deseq2Upload
        },
        {
          path: 'overview',
          name: 'Deseq2_overview',
          component: Deseq2Overview
        },
        {
          path: 'overviewTEST',
          name: 'Deseq2_overviewTEST',
          component: Deseq2OverviewTEST
        },
        {
          path: 'richgrid',
          name: 'RichGrid',
          component: RichGridExample
        },
        {
          path: 'volcano_plot',
          name: 'Deseq2_volcano_plot',
          component: Deseq2VolcanoPlot
        }
      ]
    },
    {
      path: '/masigpro',
      name: 'maSigPro',
      component: MaSigPro
    }
  ]
})
