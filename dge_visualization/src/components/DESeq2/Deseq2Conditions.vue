<template>
  <b-container>
    <b-row v-for="{file, index, conditions} in getDataObject" :key="file.name" style="margin: 1rem">
      <b-col>
        {{index}}. {{file.name}} {{conditions[0]}} {{conditions[1]}}
      </b-col>
      <b-col>
        <b-form-input v-model="conditions[0]" type="text"
                      placeholder="Condition 1"></b-form-input>
      </b-col>
      <b-col>
        <b-form-input v-model="conditions[1]" type="text"
                      placeholder="Condition 2"></b-form-input>
      </b-col>
    </b-row>
    <b-button>Upload files</b-button>
  </b-container>

</template>

<script>
  export default {
    name: 'deseq2-conditions',
    props: ['files'],
    data () {
      return {
        dataObject: {}
      }
    },
    methods: {
      computeDeseq2Obeject () {

      }
    },
    computed: {
      getDataObject () {
        let dataObject = []
        let index = 1
        for (var file of this.files) {
          dataObject.push({file: file, conditions: ['', ''], index: index})
          index++
        }
        this.dataObject = dataObject
        return dataObject
      }
    }
  }
</script>
