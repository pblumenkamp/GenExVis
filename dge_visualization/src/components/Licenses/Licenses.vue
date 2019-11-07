<template>
  <div>
    <h1 class="header">Licenses</h1>
    <b-container fluid>
      <b-row>
        <b-col v-for="(module, name) in jsonData" :key="name" cols="6">
          <b-card style="background-color: #b4c4e3; margin-top: 2rem; margin-bottom: 2rem; margin-left: 2rem;">
            <h5><b>{{ name }}</b></h5>
            <b-card v-if="module.licenseContent" style="white-space: pre-line">
              {{ module.licenseContent }}
            </b-card>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import data from '../../../licenses/licenses.json'

  export default {
    name: 'Licenses',
    data () {
      return {
        jsonData: data,
      }
    },
  }
</script>

<style scoped>

</style>
