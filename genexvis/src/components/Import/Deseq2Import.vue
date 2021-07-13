<template>
  <div>
    <div style="text-align: center">
      <!--<b-card v-if="!(files.length == 0)" class="text-center">
        <ul>
          <li v-for="file in files">{{ file.name }}</li>
        </ul>
      </b-card>
      <b-form-file id="files_input" v-model="files" multiple placeholder="Choose all files..."
        style="width: 50%; text-align: center"></b-form-file>
      <input type="file" name="deseq2_file" id="deseq2_file" class="inputfile" multiple @change="loadFiles"/>
      <label for="deseq2_file">
        <span>{{ fileDescription }}</span>
        <strong><svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"/></svg> Choose a file&hellip;</strong>
      </label>-->
      <file-chooser multiple :clear_value="clear_file_input" @change="loadFiles" />
    </div>
    <div v-if="!(files.length === 0)" style="margin-top: 3rem">
      <deseq2-conditions :files="files" style="margin-top: 2rem" />
    </div>
  </div>
</template>

<script>
  import Deseq2Conditions from './Deseq2Conditions.vue'
  import FileChooser from '../Misc/FileChooser'
  import {EventBus, Events} from '../../utilities/event_bus'

  export default {
    name: 'Deseq2Import',
    components: {
      Deseq2Conditions,
      FileChooser
    },
    data () {
      return {
        files: [],
        clear_file_input: 0,
        event_bus_callbacks: {}
      }
    },
    computed: {
      fileDescription () {
        if (this.files && this.files.length > 1) {
          return this.files.length + ' files selected'
        } else if (this.files && this.files.length === 1) {
          return this.files[0].name
        } else {
          return ''
        }
      }
    },
    methods: {
      loadFiles (event) {
        this.files = event.target.files
      }
    },
    mounted () {
      const vue = this
      vue.event_bus_callbacks[Events.CLEAR_ALL_IMPORT] = () => {
        vue.clear_file_input += 1 
        vue.files = []
      }
      EventBus.$on(Events.CLEAR_ALL_IMPORT, vue.event_bus_callbacks[Events.CLEAR_ALL_IMPORT])
    },
    destroyed () {
      const vue = this
      EventBus.$off(Events.CLEAR_ALL_IMPORT, vue.event_bus_callbacks[Events.CLEAR_ALL_IMPORT])
    }
  }
</script>
