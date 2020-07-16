<template>
  <div style="display: flex; flex-direction: column;">
    <div style="display: flex; flex-direction: column; align-items: center;">
      <h1 class="header">About</h1>
      <b-card style="font-size: large; margin-bottom: 4rem; width: 90%;">
        <b>{{ $name }} {{ $version }}</b> built on {{ date }}<br>
        Developed by Patrick Blumenkamp<br>
        <font-awesome-icon icon="envelope-open-text" />
        <a href="mailto:patrick.blumenkamp@computational.bio">patrick.blumenkamp@computational.bio</a>
        <br><br>
        Justus Liebig University Giessen<br>
        Bioinformatics and Systems Biology<br>
        Giessen, Germany
        <br><br>
        Funded by <br> e:Bio – Modul II – Verbundprojekt: HotSysAPP (BMBF grant 031L0078D)
      </b-card>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
      <h1 class="header">Licenses</h1>
      <b-card style="width: 90%; background-color: #ffbfbf; font-size: large">
        Due to the usage of <a href="https://www.highcharts.com/">Highcharts</a>, the charts are free to use for:
        <ul style="margin: 0">
          <li>governmentally funded schools</li>
          <li>universities</li>
          <li>non-profit organizations</li>
          <li>students</li>
          <li>individuals using the software for personal use, testing and demonstration (<a href="https://shop.highsoft.com/faq#Non-Commercial">Highcharts-Non-Commercial FAQ</a> )</li>
        </ul>
      </b-card>
      <div style="display: flex; flex-wrap: wrap; justify-content: space-around;">
        <b-card v-for="(module, name) in jsonData" :key="name" style="background-color: #b4c4e3; margin-top: 2rem; margin-bottom: 2rem; margin-left: 2rem; min-width: 40rem; max-width: 45rem;">
          <h5 style="margin-bottom: 1rem;"><b>{{ name }}</b></h5>
          <b-card v-if="module.licenseContent" style="white-space: pre-line;">
            {{ module.licenseContent }}
          </b-card>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
  import {build_date} from '../../../about/build_date.json'
  import data from '../../../about/licenses.json'

  import {library} from '@fortawesome/fontawesome-svg-core'
  import {faEnvelopeOpenText} from '@fortawesome/free-solid-svg-icons'
  library.add(faEnvelopeOpenText)

  export default {
    name: 'Licenses',
    data () {
      return {
        jsonData: data,
        date: build_date,
      }
    }
  }
</script>

<style scoped>

</style>
