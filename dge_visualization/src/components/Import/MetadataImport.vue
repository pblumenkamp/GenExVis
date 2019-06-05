<template>
  <div>
    <div style="text-align: center">
      <!--<b-form-file id="inputMetadata" v-model="file" placeholder="Choose a file..." @input="importGFF3" style="width: 50%"></b-form-file>-->
      <file-chooser @change="loadFiles" />
    </div>
    <b-container>
      <b-row>
        <div style="width: 10rem; margin: 1rem auto 0;">
          <b-button
            :disabled="disabledImportButton"
            style="margin-bottom: 0.7rem; margin-right: 0.5rem"
            @click="integrateGFF3"
          >
            Import files
          </b-button>
          <font-awesome-icon
            v-if="importingFiles"
            :icon="faSpinner"
            pulse
            size="2x"
            class="text-secondary"
          />
          <font-awesome-icon
            v-if="importingDone"
            :icon="faCheckCircle"
            size="2x"
            class="text-secondary"
          />
        </div>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import FileChooser from '../Misc/FileChooser'
  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faSpinner, faCheckCircle, faTimesCircle} from '@fortawesome/free-solid-svg-icons'
  import {STORE_GFF3_DATA} from "../../store/action_constants";
  // import gff from 'biojs-io-gff'
  // import gff from '@gmod/gff/dist/api.js'
  // import fs from 'fs'
  // import fileReaderStream from 'filereader-stream'

  export default {
    name: "MetadataImport",
    components: {
      FileChooser,
      FontAwesomeIcon
    },
    data () {
      return {
        file: null,
        content: [],
        contentTry: null,
        importingFiles: false,
        importingDone: false,
        disabledImportButton: true
      }
    },
    computed: {
      faSpinner() {
        return faSpinner
      },
      faCheckCircle() {
        return faCheckCircle
      },
      faTimesCircle() {
        return faTimesCircle
      }
    },
    methods: {
      loadFiles(event) {
        this.file = event.target.files[0];
        this.disabledImportButton = false;
        this.importingDone = false;
        // eslint-disable-next-line no-console
        //console.log('file chosen');
        this.importGFF3()
      },
      readGFF3 (file) {
        // source gff3
        // ftp://ftp.ensemblgenomes.org/pub/bacteria/release-43/gff3/bacteria_8_collection/sulfolobus_acidocaldarius_dsm_639
        const reader = new FileReader();

        return new Promise ((resolve, reject) => {
          reader.onError = () => {
            reader.abort();
            reject(new DOMException('Problem parsing input file'))
          };

          reader.onload = () => {
            let text = reader.result;
            // list of Arrays. one array is one gff3-entry
            let lineContent = text.split('\n');
            // filtering for CDS entries only
            let filteredContent =[];
            // iterating over original list of gff3-entries
            for (let i=0; i<lineContent.length; i++){
              // splitting entry in the gff3 fields
              let splitEntry = lineContent[i].split('\t');
              // selecting gene fields only and entries with gene_ids only
              // without ID, metadata cannot be assigned to
              // gene of transcriptomic data
              if(splitEntry[2] === 'gene' && splitEntry[8].includes('gene_id')){
                // discarding seqID, source and score
                // splitEntry is indexed newly after spLicing!
                splitEntry.splice(0,1);
                splitEntry.splice(0,1);
                splitEntry.splice(3,1);
                //let attributeArray = splitEntry[5].split(';');
                //console.log('attributeArray');
                //console.log(attributeArray);

                // discarding phase if period or zero
                //if(splitEntry[4] === '.'|| splitEntry[4] === '0'){
                // splitEntry.splice(4,1);
                //}
              //console.log(splitEntry);
                filteredContent.push(splitEntry)
              }else{
                continue
              }
            }
            this.content = filteredContent;
            resolve(this.content)
          };
          reader.readAsText(file);
          // eslint-disable-next-line no-console
          //console.log('done parsing!')
        })
      },
      importGFF3 () {
        // eslint-disable-next-line no-console
        //console.log('in import function');
        let vueData = this;
        // eslint-disable-next-line no-console
        // console.log(vueData.file)
        this.readGFF3(vueData.file)
      },
      integrateGFF3 () {
        // eslint-disable-next-line no-console
        //console.log('In integrate function!');
        this.disabledImportButton = true;
        this.importingFiles = true;
        this.$store.dispatch(STORE_GFF3_DATA, {
            gffContent: this.content
        }).then(() => {
          this.importingFiles = false;
          this.importingDone = true
        });
      },
    }
  }
</script>

<style scoped>

</style>
