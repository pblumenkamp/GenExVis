import Vue from 'vue'
import Router from 'vue-router'
import MainBody from '@/components/MainBody'
import UploadMain from '@/components/Upload/UploadMain'
import CountDataMain from '@/components/CountData/CountDataMain'
import CountDataGeneCountHM from '@/components/CountData/CountDataGeneCountHM'
import Deseq2Main from '@/components/DESeq2/Deseq2Main'
import Deseq2Overview from '@/components/DESeq2/Deseq2Overview'
import Deseq2VolcanoPlot from '@/components/DESeq2/Deseq2VolcanoPlot'
import Deseq2MAPlot from '@/components/DESeq2/Deseq2MAPlot'
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
      path: '/upload',
      name: 'Upload',
      component: UploadMain
    },
    {
      path: '/countdata',
      redirect: {name: 'CountData_GeneCountHM'},
      name: 'Deseq2',
      component: CountDataMain,
      children: [
        {
          path: 'genecounthm',
          name: 'CountData_GeneCountHM',
          component: CountDataGeneCountHM
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
