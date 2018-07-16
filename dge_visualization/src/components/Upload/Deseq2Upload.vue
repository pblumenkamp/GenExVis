<template>
  <div>
    <div style="text-align: center">
<!--      <b-card v-if="!(files.length == 0)" class="text-center">
        <ul>
          <li v-for="file in files">{{ file.name }}</li>
        </ul>
      </b-card>-->
      <b-form-file id="files_input" v-model="files" multiple placeholder="Choose all files..."
                   style="width: 50%; text-align: center"></b-form-file>
    </div>
    <div>
      <deseq2-conditions v-if="!(files.length == 0)" :files="files" style="margin-top: 2rem"></deseq2-conditions>
      <br>
    </div>
  </div>
</template>

<script>
  import Deseq2Conditions from './Deseq2Conditions.vue'

  export default {
    name: 'deseq2-upload',
    components: {
      Deseq2Conditions
    },
    data () {
      return {
        files: []
      }
    }
  }
</script>
