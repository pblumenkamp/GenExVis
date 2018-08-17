<template>
  <b-container>
    <b-row sm="6" v-for="{file, index, conditions} in getDataObject" :key="file.name" style="margin: 1rem">
      <b-col style="padding-top: 0.4rem">
        <b>{{index+1}}.</b> {{file.name}}
      </b-col>
      <b-col sm="3">
        <b-form-select v-model="conditions[0]" :options="registeredConditions">
          <template slot="first">
            <option :value="''" disabled>-- Condition 1 --</option>
          </template>
        </b-form-select>
      </b-col>
      <b-col sm="3">
        <b-form-select v-model="conditions[1]" :options="registeredConditions">
          <template slot="first">
            <option :value="''" disabled>-- Condition 2 --</option>
          </template>
        </b-form-select>
      </b-col>
    </b-row>
    <div style="width: 10rem; margin: 2rem auto 0;">
      <b-button @click="parseDataObject" style="float: left; margin-right: 1rem">Import files</b-button>
      <font-awesome-icon :icon="faSpinner" pulse size="2x" v-if="importingFiles" class="text-secondary" style="margin-top: 0.1rem"></font-awesome-icon>
      <font-awesome-icon :icon="faCheckCircle" size="2x" v-if="importingDone" class="text-secondary" style="margin-top: 0.1rem"></font-awesome-icon>
    </div>
    <b-progress v-if="!progress.done" :value="progress.counter" :max="progress.max" animated style="margin-top: 5rem"></b-progress>
  </b-container>
</template>

<script>
  import {STORE_DESEQ2_STATISTICS} from '@/store/action_constants'
  import {ADD_DESEQ} from '@/store/mutation_constants'

  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
  import faCheckCircle from '@fortawesome/fontawesome-free-solid/faCheckCircle'

  export default {
    name: 'deseq2-conditions',
    props: ['files'],
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        dataObject: [],  // [{file: <file_obj>, conditions: [<cond1 as string>, <cond2 as string>], index: <unique identifier>}, ...]
        importingFiles: false,
        importingDone: false,
        parsedDeseq2Data: [],
        progress: {counter: 0, max: 1000, done: true}
      }
    },
    methods: {
      parseDataObject () {
        var vueData = this
        this.importingDone = false
        this.importingFiles = true
        this.progress.done = false
        let promises = []
        let files = []
        for (let {file, conditions} of this.dataObject) {
          promises.push(this.readDeseq2FileAsText(file, conditions))
          files.push(file.name)
          // vueData.$store.commit(ADD_FILE, filename) ??? Probably
        }

        for (let filename of files) {
          vueData.$store.commit(ADD_DESEQ, filename)
        }

        Promise.all(promises)
          .then(values => {
            vueData.$store.dispatch(STORE_DESEQ2_STATISTICS, {deseq2Contents: values, progress: vueData.progress})
              .then(() => {
                vueData.importingFiles = false
                vueData.importingDone = true
              })
          }, reason => {
            console.warn(reason)
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
      },
      suggestregex (filename) {
        let suggestionlist = ['', '']
        let tempdict = {}
        // versus check block
        let vsbool = false
        let vsindex = 0
        let vsregex = RegExp('[^a-z0-9]vs[^a-z0-9]', 'i')
        let vsmatch = vsregex.exec(filename)
        if (vsmatch !== null) {
          vsbool = true
          vsindex = vsmatch.index
        }
        // versus check block END
        for (let entry of this.$store.state.registeredConditions) {
          let regex = RegExp(entry.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i')
          let match = regex.exec(filename)
          if (match !== null) {
            tempdict[match.index] = entry
          }
        }
        let keyarray = Object.keys(tempdict)
        let keylength = Object.keys(tempdict).length
        if (keylength === 2) {
          for (let i = 0; i <= 1; i++) {
            suggestionlist[i] = tempdict[keyarray[i]]
          }
        } else if (keylength === 1 && vsbool === true) {
          if (keyarray[0] > vsindex) {
            suggestionlist[1] = tempdict[keyarray[0]]
          } else {
            suggestionlist[0] = tempdict[keyarray[0]]
          }
        } else if (keylength === 1 && vsbool === false) {
          // (before 20.06.2018) suggestionlist[0] = tempdict[keyarray[0]]
          // (now) pass
        }
        return suggestionlist
      }
    },
    computed: {
      getDataObject () {
        let dataObject = []
        let index = 0
        for (var file of this.files) {
          let sugglist = this.suggestregex(file.name)
          dataObject.push({file: file, conditions: sugglist, index: index})
          index++
        }
        this.dataObject = dataObject
        return dataObject
      },
      registeredConditions () {
        return this.$store.state.registeredConditions
      },
      faSpinner () {
        return faSpinner
      },
      faCheckCircle () {
        return faCheckCircle
      }
    }
  }
</script>
