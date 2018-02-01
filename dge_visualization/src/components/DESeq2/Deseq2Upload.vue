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

  <!--<div class="columns" style="margin-top: 1rem">
    <div class="file has-name column is-two-fifths field is-grouped">
      <label class="file-label">
        <input class="file-input" type="file" name="resume" multiple @change="onFileChange">
        <span class="file-cta">
          <span class="file-icon">
            <i class="fa fa-upload"></i>
          </span>
          <span class="file-label">
            Choose a file…
          </span>
        </span>
      </label>
      <p class="control">
        <button class="button is-light" @click="reset">Clear</button>
      </p>
    </div>
    <div class="box column is-one-fifth" v-if="!files.length == 0">
      <ul>
        <li v-for="file in files">{{ file.name }}</li>
      </ul>
    </div>
  </div>-->
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
        console.log(this.files.length)
        for (var i = 0; i < this.files.length; i++) {
          console.log(i)
          this.conditions.push([])
        }
      }
    }
  }
</script>
