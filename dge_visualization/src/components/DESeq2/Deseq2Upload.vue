<template>
  <div>
    <div>
      <b-card v-if="!(files.length == 0)" class="text-center">
        <ul>
          <li v-for="file in files">{{ file.name }}</li>
        </ul>
      </b-card>
      <b-form-file id="files_input" v-model="files" multiple choose-label="Choose all files..."
                   @change="onFileChange"></b-form-file>
    </div>
    <div>
      <deseq2-conditions v-if="!(files.length == 0)" :files="files" style="margin-top: 2rem"></deseq2-conditions>
    </div>
  </div>
</template>

<script>
  import Deseq2Conditions from './Deseq2Conditions.vue'

  export default {
    name: 'DESeq2Upload',
    components: {
      Deseq2Conditions
    },
    data () {
      return {
        files: [],
        conditions: []
      }
    },
    methods: {
      onFileChange (e) {
        for (var i = 0; i < this.files.length; i++) {
          this.conditions.push([])
        }
      }
    }
  }
</script>
