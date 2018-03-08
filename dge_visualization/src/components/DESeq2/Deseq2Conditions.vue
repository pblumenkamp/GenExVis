<template>
  <b-container>
    <b-row v-for="{file, index, conditions} in getDataObject" :key="file.name" style="margin: 1rem">
      <b-col style="padding-top: 0.4rem">
        {{index+1}}. {{file.name}}
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
    <div style="margin: 0 auto; width: 10rem">
      <b-button @click="parseDataObject" style="float: left; margin-right: 1rem">Import files</b-button>
      <div v-if="importingFiles" class="loader"></div>
    </div>
    <b-progress v-if="!progress.done" :value="progress.counter" :max="progress.max" animated style="margin-top: 5rem"></b-progress>
  </b-container>
</template>

<script>
  import {STORE_DESEQ2_STATISTICS} from '../../store/action_constants'

  export default {
    name: 'deseq2-conditions',
    props: ['files'],
    data () {
      return {
        dataObject: [],  // [{file: <file_obj>, conditions: [<cond1 as string>, <cond2 as string>], index: <unique identifier>}, ...]
        importingFiles: false,
        parsedDeseq2Data: [],
        progress: {counter: 0, max: 1000, done: true}
      }
    },
    methods: {
      parseDataObject () {
        var vueData = this
        this.importingFiles = true
        this.progress.done = false
        let promises = []
        for (let {file, conditions} of this.dataObject) {
          promises.push(this.readDeseq2FileAsText(file, conditions))
        }

        Promise.all(promises)
          .then(values => {
            vueData.$store.dispatch(STORE_DESEQ2_STATISTICS, {deseq2Contents: values, progress: vueData.progress})
              .then(() => {
                console.log(vueData.$store.state.dgeData)
                vueData.importingFiles = false
              })
          }, reason => {
            console.log(reason)
          })
      },
      readDeseq2FileAsText (file, conditions) {
        const reader = new FileReader()

        return new Promise((resolve, reject) => {
          reader.onerror = () => {
            reader.abort()
            reject(new DOMException('Problem parsing input file.'))
          }

          reader.onload = () => {
            resolve({content: reader.result, conditions: conditions})
          }
          reader.readAsText(file)
        })
      }
    },
    computed: {
      getDataObject () {
        let dataObject = []
        let index = 0
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

<style>
  .loader {
    border: 8px solid #f3f3f3; /* Light grey */
    border-top: 8px solid #b3b3b3; /* Blue */
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    animation: spin 2s linear infinite;
    float: left;
    margin-top: 0.1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
