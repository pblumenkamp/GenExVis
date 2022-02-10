<template>
  <div style="display: flex; flex-direction: column;">
    <div style="display: flex; flex-direction: column; align-items: center;">
      <h1 class="header">About</h1>
      <b-card style="font-size: large; margin-bottom: 4rem; width: 90%;">
        <b>{{ $name }} {{ $version }}</b><br>
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
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-around;">
      <h1 class="header">Licenses</h1>
      <div style="display: flex; flex-wrap: wrap; justify-content: space-around;">
        <b-card v-for="(module, name) in jsonData" :key="name" style="background-color: #b4c4e3; margin-top: 2rem; margin-bottom: 2rem; margin-left: 2rem; min-width: 40rem; max-width: 45rem;">
          <h5 style="margin-bottom: 1rem;"><b>{{ name }}</b></h5>
          <b-card v-if="module.publisher == 'Highsoft AS'">
            {{ module.customLicenseDescription }}: <a class="card-link" :href="module.customLicenseURL" @click="openInBrowser(module.customLicenseURL, $event)">{{ module.customLicenseContent }}</a>
          </b-card>
          <b-card v-else style="white-space: pre-line;">
            {{ module.licenseContent }}
          </b-card>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
  import data from '../../../about/licenses.json'

  import {library} from '@fortawesome/fontawesome-svg-core'
  import {faEnvelopeOpenText} from '@fortawesome/free-solid-svg-icons'
  library.add(faEnvelopeOpenText)

  export default {
    name: 'Licenses',
    data () {
      return {
        jsonData: data,
      }
    },
    methods: {
      openInBrowser: function(url, event) {
        nw.Shell.openExternal(url);
        event.preventDefault()
      }
    }
  }
</script>

<style scoped>

</style>
