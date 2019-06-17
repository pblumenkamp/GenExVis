<template>
  <b-container>
    <b-row
      v-for="{file, index, conditions, validEntry, errorText} in dataObject"
      :key="file.name"
      :style="{margin: '0.5rem', 'background-color': (validEntry !== false) ? '' : '#ff000055'}"
    >
      <b-col sm="5" class="align-self-center">
        <b>{{ index+1 }}.</b> {{ file.name }}
      </b-col>
      <b-col sm="3">
        <b-form-select
          v-model="conditions[0]"
          :options="registeredConditions"
          style="margin-top: 3%; margin-bottom: 3%"
        >
          <template slot="first">
            <option :value="''" disabled>-- Condition 1 --</option>
          </template>
        </b-form-select>
      </b-col>
      <b-col sm="3">
        <b-form-select
          v-model="conditions[1]"
          :options="registeredConditions"
          style="margin-top: 3%; margin-bottom: 3%"
        >
          <template slot="first">
            <option :value="''" disabled>-- Condition 2 --</option>
          </template>
        </b-form-select>
      </b-col>
      <b-col sm="1" class="align-self-center text-center">
        <span v-tooltip="{content: errorText, placement: 'right-center', offset: 50}" style="cursor: pointer">
          <font-awesome-icon
            v-if="validEntry === false"
            :icon="faInfoCircle"
            class="text-secondary"
            transform="grow-10"
            :style="{'color': '#FF0000'}"
          />
        </span>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div style="width: 10rem; margin: 2rem auto 0;">
          <b-button style="float: left; margin-right: 1rem" @click="parseDataObject">
            Import files
          </b-button>
        </div>
      </b-col>
    </b-row>
    <font-awesome-icon
      v-if="importingFiles"
      :icon="faSpinner"
      pulse
      size="2x"
      class="text-secondary"
      style="margin-top: 0.1rem"
    />
    <font-awesome-icon
      v-if="importingDone"
      :icon="faCheckCircle"
      size="2x"
      class="text-secondary"
      style="margin-top: 0.1rem"
    />
    <span v-if="importingFailed" v-tooltip.top="{content: importFailedMessage, placement: 'auto', offset: 30}" style="cursor: pointer">
      <font-awesome-icon
        :icon="faTimesCircle"
        size="2x"
        class="text-secondary"
        style="margin-top: 0.1rem"
      />
    </span>
    <b-progress
      v-if="!progress.done"
      :value="progress.counter"
      :max="progress.max"
      animated
      style="margin-top: 5rem"
    />
    <div style="width: 100%; margin: 2rem auto 0">
      <b-row>
        <b-col>
          <h4>Select DESeq2 Type</h4>
          <multiselect
            v-model="DESeq2Type"
            :options="sofa"
            :multiple="false"
            :close-on-select="false"
            :clear-on-select="false"
            :preserve-search="true"
            :show-labels="true"
            :preselect-first="false"
            selected-label="Selected"
            select-label="Click to select"
            deselect-label="Click to remove"
            placeholder="Choose DESeq2 type"
            @input="setDeseq2Type"
          >
            <template slot="selection" slot-scope="{ values, search, isOpen }">
              <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
            </template>
          </multiselect>
        </b-col>
        <!-- Questionmark with Deseq2Type help -->
        <b-col sm="2" style="padding-left: 0">
          <span style="cursor: pointer; float: left" @click="showDeseq2TypeHelp = !showDeseq2TypeHelp">
            <font-awesome-icon :icon="faQuestionCircle" />
          </span>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-collapse id="helpConditions" v-model="showDeseq2TypeHelp" class="mt-2">
            <transition name="fade">
              <b-card style="width:80%; margin: auto">
                Chose the type of feature, the Deseq2 Analysis was performed for. This value is relevant for the subsequent analysis of the metadata. If the type is
                unknown, chose "gene".
              </b-card>
            </transition>
          </b-collapse>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>

<script>
  import {STORE_DESEQ2_STATISTICS} from '../../store/action_constants'
  import {ADD_DESEQ} from '../../store/mutation_constants'

  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faSpinner, faCheckCircle, faTimesCircle, faInfoCircle, faQuestionCircle} from '@fortawesome/free-solid-svg-icons'

  import Multiselect from 'vue-multiselect'
  import {STORE_DESEQ2Type} from "../../store/action_constants";

  export default {
    name: 'Deseq2Conditions',
    components: {
      FontAwesomeIcon,
      Multiselect
    },
    props: {'files': {type: FileList, required: true}},
    data () {
      return {
        dataObject: [],  // [{file: <file_obj>, conditions: [<cond1 as string>, <cond2 as string>], index: <unique identifier>}, ...]
        importingFiles: false,
        importingDone: false,
        importingFailed: false,
        importFailedMessage: 'Import failed',
        parsedDeseq2Data: [],
        progress: {counter: 0, max: 1000, done: true},
        showDeseq2TypeHelp: false,
        // variable to check if type was chosen
        // used to disable metadata-import dropdown, if no type was chosen
        metaDataImportDisable: true,
        // multiselect Miri
        // will contain selected item
        DESeq2Type: " ",
        // options to select from
        sofa: ['antisense primary transcript','antisense RNA','ARS','assembly component','attenuator','autocatalytically spliced intron','binding site','branch site','C D box snoRNA','cap','cDNA match','CDS','centromere','chromosomal structural element','chromosome','chromosome band','clip','clone','clone insert end','clone insert start','coding conserved region','coding exon','codon','conserved region','contig','CpG island','cross genome match','decayed exon','deletion','deletion junction','direct repeat','dispersed repeat','ds oligo','enhancer','enzymatic RNA','EST','EST match','exon','exon junction','experimental result region','expressed sequence match','five prime cis splice site','five prime coding exon','five prime coding exon coding region','five prime coding exon noncoding region','five prime exon coding region','five prime splice site','five prime UTR','flanking region','gene','gene part','golden path','golden path fragment','group I intron','group II intron','guide RNA','hammerhead ribozyme','insertion','insertion site','insulator','intergenic region','interior coding exon','intron','inverted repeat','junction','large subunit rRNA','match','match part','match set','mature protein region','mature transcript','methylated A','methylated base feature','methylated C','microsatellite','minisatellite','miRNA','modified base','modified base site','mRNA','nc conserved region','nc primary transcript','ncRNA','non transcribed region','noncoding exon','nuclease binding site','nuclease sensitive site','nucleotide match','nucleotide motif','oligo','operator','operon','ORF','origin of replication','PCR product','polyA sequence','polyA signal sequence','polyA site','polypeptide','polypyrimidine tract','possible assembly error','possible base call error','primary transcript','primer','promoter','protein binding site','protein coding primary transcript','protein match','proviral region','pseudogene','pseudogenic region','rasiRNA','read','read pair','reading frame','reagent','region','remark','repeat family','repeat region','restriction fragment','RFLP fragment','ribosome entry site','ribozyme','RNA motif','RNAi reagent','RNase MRP RNA','RNase P RNA','rRNA','rRNA 18S','rRNA 28S','rRNA 5','rRNA 5 8S','rRNA 5S','rRNA large subunit primary transcript','rRNA primary transcript','SAGE tag','satellite DNA','scRNA','sequence assembly','sequence difference','sequence feature','Sequence Ontology','sequence variant obs','signal peptide','silencer','siRNA','small regulatory ncRNA','small subunit rRNA','snoRNA','SNP','snRNA','splice enhancer','splice site','spliceosomal intron','SRP RNA','ss oligo','start codon','stop codon','stRNA','STS','supercontig','tag','tandem repeat','telomerase RNA','telomere','terminator','TF binding site','three prime cis splice site','three prime coding exon coding region','three prime coding exon noncoding region','three prime exon coding region','three prime splice site','three prime UTR','tiling path','tiling path fragment','trans splice acceptor site','transcribed region','transcript','transcription end site','translated nucleotide match','transposable element','transposable element insertion site','tRNA','TSS','U1 snRNA','U11 snRNA','U12 snRNA','U14 snoRNA','U2 snRNA','U4 snRNA','U4atac snRNA','U5 snRNA','U6 snRNA','U6atac snRNA','ultracontig','UTR','vault RNA','virtual sequence','Y RNA']
      }
    },
    computed: {
      registeredConditions () {
        return this.$store.state.registeredConditions
      },
      faSpinner () {
        return faSpinner
      },
      faCheckCircle () {
        return faCheckCircle
      },
      faTimesCircle () {
        return faTimesCircle
      },
      faInfoCircle () {
        return faInfoCircle
      },
      faQuestionCircle () {
        return faQuestionCircle
      }
    },
    watch: {
      registeredConditions (conditions) {
        for (let i = 0; i < this.dataObject.length; i++) {
          for (let j = 0; j < 2; j++) {
            if (conditions.indexOf(this.dataObject[i].conditions[j]) === -1) {
              this.dataObject[i].conditions[j] = ''
            }
            this.dataObject[i].conditions = this.suggestregex(this.dataObject[i].header)
          }
        }
      },
      files: {
        immediate: true,
        handler (newfiles) {
          let dataObject = [];
          let index = 0;
          for (var file of newfiles) {
            let sugglist = this.suggestregex(file.name);
            dataObject.push({file: file, conditions: sugglist, index: index, validEntry: null, errorText: ''});
            index++
          }
          this.dataObject = dataObject;
          return dataObject
        }
      }
    },
    methods: {
      parseDataObject () {
        let vue = this;
        if (!vue.validate(vue.dataObject)) {
          vue.importingFailed = true;
          return
        }
        vue.importingDone = false;
        vue.importingFailed = false;
        vue.importingFiles = true;
        vue.progress.done = false;
        let promises = [];
        let files = [];
        for (let {file, conditions} of this.dataObject) {
          promises.push(this.readDeseq2FileAsText(file, conditions));
          files.push(file.name)
        }

        for (let filename of files) {
          vue.$store.commit(ADD_DESEQ, filename)
        }

        Promise.all(promises)
          .then(values => {
            vue.$store.dispatch(STORE_DESEQ2_STATISTICS, {deseq2Contents: values, progress: vue.progress})
              .then(() => {
                vue.importingFiles = false;
                vue.importingDone = true
              }, reason => {
                vue.importingFailedMessage = reason;
                vue.importingFiles = false;
                vue.importingFailed = true
            })
          })
      },
      validate (data) {
        let valid = true;
        for (let i = 0; i < data.length - 1; i++) {
          let entry = data[i];
          if (entry.conditions[0] === entry.conditions[1]) {
            valid = false;
            entry.validEntry = false;
            data[i].errorText = 'Conditions must differ in a DESeq2 comparison'
          } else {
            entry.validEntry = null
          }
        }
        for (let i = 0; i < data.length - 1; i++) {
          let entryA = data[i];
          let sameConds = [];
          for (let j = i + 1; j < data.length; j++) {
            let entryB = data[j];
            if (entryB.validEntry !== false) {
              if (entryA.conditions[0] === entryB.conditions[0] && entryA.conditions[1] === entryB.conditions[1]) {
                if (entryA.validEntry !== false) {
                  entryA.validEntry = false;
                  valid = false;
                  sameConds.push(i)
                }
                entryB.validEntry = false;
                sameConds.push(j)
              }
            }
          }
          for (let i of sameConds) {
            data[i].errorText = `Multiple files/rows contain the same comparison: ${sameConds.map(x => x + 1).join(', ')}`
          }
        }
        return valid
      },
      readDeseq2FileAsText (file, conditions) {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
          reader.onerror = () => {
            reader.abort();
            reject(new DOMException('Problem parsing input file.'))
          };

          reader.onload = () => {
            resolve({content: reader.result, conditions: conditions})
          };
          reader.readAsText(file)
        })
      },
      suggestregex (filename) {
        let suggestionlist = ['', ''];
        let tempdict = {};
        // versus check block
        let vsbool = false;
        let vsindex = 0;
        let vsregex = RegExp('[^a-z0-9]vs[^a-z0-9]', 'i');
        let vsmatch = vsregex.exec(filename);
        if (vsmatch !== null) {
          vsbool = true;
          vsindex = vsmatch.index
        }
        // versus check block END
        for (let entry of this.$store.state.registeredConditions) {
          let regex = RegExp('[^a-z0-9]*' + entry.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
          let match = regex.exec(filename);
          if (match !== null) {
            tempdict[match.index] = entry
          }
        }
        let keyarray = Object.keys(tempdict);
        let keylength = Object.keys(tempdict).length;
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
      },
      // setting the Deseq2Type whenever the selection changes
      setDeseq2Type () {
        // set chosen validator according to value of DESeq2Type
        // if DESeq2Type is chosen, validator becomes true, else, validator stays false
        if (this.DESeq2Type !== null){
          this.metaDataImportDisable = false;
        }else if(this.DESeq2Type === null){
          this.metaDataImportDisable = true;
        }
        // emitting an event to listen to in ImportMain, so that the button
        // to toggle down the metadata-Import Menu is not disable anymore, if a deseq2
        // analysis type was chosen
        this.$root.$emit('metaDataImportDisableFalse', this.metaDataImportDisable)
        // dispatch chosen option to store
        this.$store.dispatch(STORE_DESEQ2Type, this.DESeq2Type);
      }
    }
  }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css">
  .tooltip {
    display: block !important;
    z-index: 10000;
  }

  .tooltip .tooltip-inner {
    background: black;
    color: white;
    border-radius: 16px;
    padding: 5px 10px 4px;
  }

  .tooltip .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
  }

  .tooltip[x-placement^="top"] {
    margin-bottom: 5px;
  }

  .tooltip[x-placement^="top"] .tooltip-arrow {
    border-width: 5px 5px 0 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    bottom: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }

  .tooltip[x-placement^="bottom"] {
    margin-top: 5px;
  }

  .tooltip[x-placement^="bottom"] .tooltip-arrow {
    border-width: 0 5px 5px 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-top-color: transparent !important;
    top: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }

  .tooltip[x-placement^="right"] {
    margin-left: 5px;
  }

  .tooltip[x-placement^="right"] .tooltip-arrow {
    border-width: 5px 5px 5px 0;
    border-left-color: transparent !important;
    border-top-color: transparent !important;
    border-bottom-color: transparent !important;
    left: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
  }

  .tooltip[x-placement^="left"] {
    margin-right: 5px;
  }

  .tooltip[x-placement^="left"] .tooltip-arrow {
    border-width: 5px 0 5px 5px;
    border-top-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    right: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
  }

  .tooltip[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }

  .tooltip[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
</style>
