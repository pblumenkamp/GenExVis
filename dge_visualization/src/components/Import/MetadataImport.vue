<template>
  <div>
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
          <b-collapse id="helpDeseq2Type" v-model="showDeseq2TypeHelp" class="mt-2">
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
    <!-- GFF3 parameter select. Only shows, If gff3 file was uploaded-->
    <div style="width: 100%; margin: 2rem auto 0">
      <b-row>
        <b-col>
          <h4>Select additional Features</h4>
          <multiselect
            v-model="deseq2Features"
            :options="sofa"
            :multiple="true"
            :max="3"
            :close-on-select="false"
            :clear-on-select="false"
            :preserve-search="true"
            :show-labels="true"
            :preselect-first="false"
            selected-label="Selected"
            select-label="Click to select"
            deselect-label="Click to remove"
            placeholder="Choose features to analyze"
          >
            <template slot="selection" slot-scope="{ values, search, isOpen }">
              <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
            </template>
          </multiselect>
        </b-col>
        <!-- Questionmark with Metadata Feature help -->
        <b-col sm="2" style="padding-left: 0">
          <span style="cursor: pointer; float: left" @click="showMetadataFeatureHelp = !showMetadataFeatureHelp">
            <font-awesome-icon :icon="faQuestionCircle" />
          </span>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-collapse id="helpConditions" v-model="showMetadataFeatureHelp" class="mt-2">
            <transition name="fade">
              <b-card style="width:80%; margin: auto">
                Chose up to three additional types of features to investigate the GFF3 for. Note, that the DESeq2 Analysis Type cannot be chosen again.
              </b-card>
            </transition>
          </b-collapse>
        </b-col>
      </b-row>
    </div>
    <!-- GFF3 upload -->
    <div style="width: 100%; margin: 2rem auto 0">
      <div style="text-align: center">
        <file-chooser @change="loadFiles" />
      </div>
      <b-container style="max-width: 100%">
        <b-row>
          <div style="width: 10rem; margin: 1rem auto 0;">
            <b-button
              :disabled="disabledImportButton"
              style="margin-bottom: 0.7rem; margin-right: 0.5rem"
              @click="integrateGFF3"
            >
              Import files
            </b-button>
          </div>
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
        <b-row>
          <div v-if="showRemovedFeatures">
            <h4 style="margin-top: 20px">
              GFF3 counts for the chosen features:
            </h4>
            <b-table
              :items="featuresCounted"
              :fields="tableHeaders"
              :striped="striped"
              :bordered="bordered"
            />
            <p v-if="featureZero" style="margin-top: 20px; color:red">
              Some features were not found in the GFF3 file. They will not be available for
              visualisation. You might want to check the selected features and/or the chosen GFF3-file
              before importing.
            </p>
          </div>
        </b-row>
      </b-container>
    </div>
  </div>
</template>


<script>
  import FileChooser from '../Misc/FileChooser'
  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faSpinner, faCheckCircle, faQuestionCircle} from '@fortawesome/free-solid-svg-icons'
  import {STORE_GFF3_DATA} from "../../store/action_constants";
  import Multiselect from 'vue-multiselect'

  export default {
    name: "MetadataImport",
    components: {
      FileChooser,
      FontAwesomeIcon,
      Multiselect
    },
    data () {
      return {
        // chosen feature table properties
        bordered: true,
        striped: true,
        tableHeaders: ["feature", "count"],
        file: null,
        content: {},
        contentTry: null,
        importingFiles: false,
        importingDone: false,
        // import possible after feature selection
        disabledImportButton: true,
        // questionmark validators for help
        showMetadataFeatureHelp: false,
        showDeseq2TypeHelp: false,
        // array to show features removed due to no entries in gff3
        // and validator for v-if to show it only, if entries have been removed
        featuresCounted: [],
        showRemovedFeatures: false,
        // validator for notation display to check features because some were not found in gff3
        featureZero: false,
        // multiselects
        // deseq2Features is array for additional features to investigate
        // Deseq2Type is type of Deseq2Analysis
        deseq2Features: [],
        DESeq2Type: " ",
        // options to select from
        sofa: ['antisense primary transcript','antisense RNA','ARS','assembly component','attenuator','autocatalytically spliced intron','binding site','branch site','C D box snoRNA','cap','cDNA match','CDS','centromere','chromosomal structural element','chromosome','chromosome band','clip','clone','clone insert end','clone insert start','coding conserved region','coding exon','codon','conserved region','contig','CpG island','cross genome match','decayed exon','deletion','deletion junction','direct repeat','dispersed repeat','ds oligo','enhancer','enzymatic RNA','EST','EST match','exon','exon junction','experimental result region','expressed sequence match','five prime cis splice site','five prime coding exon','five prime coding exon coding region','five prime coding exon noncoding region','five prime exon coding region','five prime splice site','five prime UTR','flanking region','gene','gene part','golden path','golden path fragment','group I intron','group II intron','guide RNA','hammerhead ribozyme','insertion','insertion site','insulator','intergenic region','interior coding exon','intron','inverted repeat','junction','large subunit rRNA','match','match part','match set','mature protein region','mature transcript','methylated A','methylated base feature','methylated C','microsatellite','minisatellite','miRNA','modified base','modified base site','mRNA','nc conserved region','nc primary transcript','ncRNA','non transcribed region','noncoding exon','nuclease binding site','nuclease sensitive site','nucleotide match','nucleotide motif','oligo','operator','operon','ORF','origin of replication','PCR product','polyA sequence','polyA signal sequence','polyA site','polypeptide','polypyrimidine tract','possible assembly error','possible base call error','primary transcript','primer','promoter','protein binding site','protein coding primary transcript','protein match','proviral region','pseudogene','pseudogenic region','rasiRNA','read','read pair','reading frame','reagent','region','remark','repeat family','repeat region','restriction fragment','RFLP fragment','ribosome entry site','ribozyme','RNA motif','RNAi reagent','RNase MRP RNA','RNase P RNA','rRNA','rRNA 18S','rRNA 28S','rRNA 5','rRNA 5 8S','rRNA 5S','rRNA large subunit primary transcript','rRNA primary transcript','SAGE tag','satellite DNA','scRNA','sequence assembly','sequence difference','sequence feature','Sequence Ontology','sequence variant obs','signal peptide','silencer','siRNA','small regulatory ncRNA','small subunit rRNA','snoRNA','SNP','snRNA','splice enhancer','splice site','spliceosomal intron','SRP RNA','ss oligo','start codon','stop codon','stRNA','STS','supercontig','tag','tandem repeat','telomerase RNA','telomere','terminator','TF binding site','three prime cis splice site','three prime coding exon coding region','three prime coding exon noncoding region','three prime exon coding region','three prime splice site','three prime UTR','tiling path','tiling path fragment','trans splice acceptor site','transcribed region','transcript','transcription end site','translated nucleotide match','transposable element','transposable element insertion site','tRNA','TSS','U1 snRNA','U11 snRNA','U12 snRNA','U14 snoRNA','U2 snRNA','U4 snRNA','U4atac snRNA','U5 snRNA','U6 snRNA','U6atac snRNA','ultracontig','UTR','vault RNA','virtual sequence','Y RNA']
      }
    },
    computed: {
      faSpinner() {
        return faSpinner
      },
      faCheckCircle() {
        return faCheckCircle
      },
      faQuestionCircle () {
        return faQuestionCircle
      },
    },
    watch: {
      // data to watch
      DESeq2Type (){
        // things to do if DESeq2Type changes
        this.showRemovedFeatures = false;
        // if a file is already uploaded,
        // everything is reset and read-in newly
        // cannot be done without file, since then
        // there is no data to display
        if (this.file){
          this.featureZero = false;
          this.content= {};
          this.featuresCounted = [];
          // new read-in to update data and table
          this.importGFF3();
        }
      },
      deseq2Features (){
        // things to do if deseq2Features changes
        this.showRemovedFeatures = false;
        // if a file is already uploaded,
        // everything is reset and read-in newly
        // cannot be done without file, since then
        // there is no data to display
        if (this.file){
          this.featureZero = false;
          this.content= {};
          this.featuresCounted= [];
          // new read-in to update data and table
          this.importGFF3();
        }
      }
  },
    methods: {
      loadFiles(event) {
        this.file = event.target.files[0];
        this.disabledImportButton = false;
        this.importingDone = false;
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
            // dictionary for filtered content
            // initialized and keys set in order to append splitEntries to value later
            let filteredContent ={};
            // generation of selectedTypes for gff3 read-in
            if(this.deseq2Features.length >0){
              var selectedTypes = [];
              for (let i=0; i<this.deseq2Features.length; i++){
                selectedTypes.push(this.deseq2Features[i])
              }
              selectedTypes.push(this.DESeq2Type)
            }
            else if (this.deseq2Features.length === 0){
              var selectedTypes= [];
              selectedTypes.push(this.DESeq2Type)
            }
            for (let i=0; i<selectedTypes.length; i++){
              filteredContent[selectedTypes[i]]=[];
              // array of dicts structure needed for b-table
              // key initialization needed later for display of feature upload statistics
              //this.featuresCounted.push({[selectedTypes[i]]:0})
            }
            // begin of actual read in
            let text = reader.result;
            // list of Arrays. one array is one gff3-entry
            let lineContent = text.split('\n');
            // iterating over original list of gff3-entries
            for (let i=0; i<lineContent.length; i++){
              // splitting entry in the gff3 fields
              let splitEntry = lineContent[i].split('\t');
                // iterating the selected feature types
                for (let i=0; i<selectedTypes.length; i++){
                  // selecting only the lines, with type matching the multiselect selections
                  if(splitEntry[2] === selectedTypes[i]){
                    // discarding  source and score
                    // splitEntry is indexed newly after sPlicing!
                    splitEntry.splice(1,1);
                    splitEntry.splice(4,1);
                    // dictionary value is pushed to correct key based on selectedTypes
                    filteredContent[selectedTypes[i]].push(splitEntry);
                  }
                }
              }
            // removing empty entries (if feature was not in metadata
            // there would be nothing to display anyways

            // final cleaned up dict
            let cleanFilteredDict= {};
            for (const [key, value] of Object.entries(filteredContent)){
              // for display of feature statistic in slider 4 of import
              // structure for b-table. feature and count are specified as "fields"
              // = table headers, which are recognized in the array of dicts
              // to correctly assign values of rows
              this.featuresCounted.push({"feature": key, "count" : value.length});
              if (value.length === 0){
                // as soon as a feature was not found in the GFF3
                // the red paragraph notification will be show in slider 4
                this.featureZero = true;
                //removeArray.push(key);
              } else {
                cleanFilteredDict[key] = value
              }
            }
            this.content = cleanFilteredDict;
            this.showRemovedFeatures = true;
            resolve(this.content)
          };
          reader.readAsText(file);
        })
      },
      importGFF3 () {
        let vueData = this;
        this.readGFF3(vueData.file)
      },
      integrateGFF3 () {
        this.disabledImportButton = true;
        this.importingFiles = true;
        this.$store.dispatch(STORE_GFF3_DATA, {
          gffContentDict: this.content
        }).then(() => {
          this.importingFiles = false;
          this.importingDone = true
        });
      },
    },
  }
</script>

<style scoped>

</style>
