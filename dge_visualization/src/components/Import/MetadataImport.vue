<template>
  <div>
    <div style="width: 100%; margin: 2rem auto 0">
      <b-row>
        <b-col>
          <h4>Select DESeq2 Type</h4>
          <multiselect
            v-model="DESeq2Type"
            :options="sofa2"
            :multiple="false"
            :close-on-select="true"
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
                unknown, chose "CDS".
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
              :disabled="disabledScanButton"
              style="margin-bottom: 0.7rem; margin-right: 0.5rem"
              @click="scanGFF3"
            >
              Scan file
            </b-button>
          </div>
          <div style="width: 10rem; margin: 1rem auto 0;">
            <b-button
              :disabled="disabledImportButton"
              style="margin-bottom: 0.7rem; margin-right: 0.5rem"
              @click="integrateGFF3"
            >
              Import file
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
      </b-container>
    </div>
    <!-- GFF3 parameter select. Only shows, If gff3 file was uploaded-->
    <div v-if="fileScanned && idMatch" style="width: 100%; margin: 2rem auto 0">
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
          <span style="cursor: pointer; float: left" @click="showHelp = !showMetadataFeatureHelp">
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
    <div v-if="!idMatch && fileScanned">
      <p style="color: red">Please note: DESeq2-IDs could NOT be matched with GFF3 IDs. Please import an adequate GFF3. </p>
    </div>
    <b-row>
      <div v-if="showRemovedFeatures && fileScanned && idMatch" style="width: 100%; margin: 2rem auto 0">
        <h4 style="margin-top: 20px">
          GFF3 counts for chosen features & all parent features:
        </h4>
        <b-table
          :items="featuresCounted"
          :fields="tableHeaders"
          :striped="striped"
          :bordered="bordered"
        />
      </div>
    </b-row>
  </div>
</template>


<script>
  import FileChooser from '../Misc/FileChooser'
  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faSpinner, faCheckCircle, faQuestionCircle} from '@fortawesome/free-solid-svg-icons'
  import {STORE_GFF3_DATA} from "../../store/action_constants";
  import {STORE_DESEQ2TYPE} from "../../store/action_constants";
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
        disabledScanButton: true,
        // questionmark validators for help
        showHelp: false,
        showDeseq2TypeHelp: false,
        // array to show features removed due to no entries in gff3
        // and validator for v-if to show it only, if entries have been removed
        featuresCounted: [],
        showRemovedFeatures: false,
        // validator for notation display to check features because some were not found in gff3
        fileScanned: false,
        idMatch: false,
        // multiselects
        // deseq2Features is array for additional features to investigate
        // Deseq2Type is type of Deseq2Analysis
        deseq2Features: [],
        DESeq2Type: " ",
        // options to select from
        sofa: [],
        sofa2: ['antisense primary transcript','antisense RNA','ARS','assembly component','attenuator','autocatalytically spliced intron','binding site','branch site','C D box snoRNA','cap','cDNA match','CDS','centromere','chromosomal structural element','chromosome','chromosome band','clip','clone','clone insert end','clone insert start','coding conserved region','coding exon','codon','conserved region','contig','CpG island','cross genome match','decayed exon','deletion','deletion junction','direct repeat','dispersed repeat','ds oligo','enhancer','enzymatic RNA','EST','EST match','exon','exon junction','experimental result region','expressed sequence match','five prime cis splice site','five prime coding exon','five prime coding exon coding region','five prime coding exon noncoding region','five prime exon coding region','five prime splice site','five prime UTR','flanking region','gene','gene part','golden path','golden path fragment','group I intron','group II intron','guide RNA','hammerhead ribozyme','insertion','insertion site','insulator','intergenic region','interior coding exon','intron','inverted repeat','junction','large subunit rRNA','match','match part','match set','mature protein region','mature transcript','methylated A','methylated base feature','methylated C','microsatellite','minisatellite','miRNA','modified base','modified base site','mRNA','nc conserved region','nc primary transcript','ncRNA','non transcribed region','noncoding exon','nuclease binding site','nuclease sensitive site','nucleotide match','nucleotide motif','oligo','operator','operon','ORF','origin of replication','PCR product','polyA sequence','polyA signal sequence','polyA site','polypeptide','polypyrimidine tract','possible assembly error','possible base call error','primary transcript','primer','promoter','protein binding site','protein coding primary transcript','protein match','proviral region','pseudogene','pseudogenic region','rasiRNA','read','read pair','reading frame','reagent','region','remark','repeat family','repeat region','restriction fragment','RFLP fragment','ribosome entry site','ribozyme','RNA motif','RNAi reagent','RNase MRP RNA','RNase P RNA','rRNA','rRNA 18S','rRNA 28S','rRNA 5','rRNA 5 8S','rRNA 5S','rRNA large subunit primary transcript','rRNA primary transcript','SAGE tag','satellite DNA','scRNA','sequence assembly','sequence difference','sequence feature','Sequence Ontology','sequence variant obs','signal peptide','silencer','siRNA','small regulatory ncRNA','small subunit rRNA','snoRNA','SNP','snRNA','splice enhancer','splice site','spliceosomal intron','SRP RNA','ss oligo','start codon','stop codon','stRNA','STS','supercontig','tag','tandem repeat','telomerase RNA','telomere','terminator','TF binding site','three prime cis splice site','three prime coding exon coding region','three prime coding exon noncoding region','three prime exon coding region','three prime splice site','three prime UTR','tiling path','tiling path fragment','trans splice acceptor site','transcribed region','transcript','transcription end site','translated nucleotide match','transposable element','transposable element insertion site','tRNA','TSS','U1 snRNA','U11 snRNA','U12 snRNA','U14 snoRNA','U2 snRNA','U4 snRNA','U4atac snRNA','U5 snRNA','U6 snRNA','U6atac snRNA','ultracontig','UTR','vault RNA','virtual sequence','Y RNA']
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
      }
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
          this.content= {};
          this.featuresCounted = [];
          this.fileScanned= true;
          this.importGFF3();
        }
        // write DESeq2Type to store
        this.$store.dispatch(STORE_DESEQ2TYPE, {
          deseq2Type: this.DESeq2Type
        });
      },
      deseq2Features (){
        // things to do if deseq2Features changes
        this.showRemovedFeatures = false;
        // if a file is already uploaded,
        // everything is reset and read-in newly
        // cannot be done without file, since then
        // there is no data to display
        if (this.file){
          this.content= {};
          this.featuresCounted= [];
          this.fileScanned= true;
          this.importGFF3();
        }
      }
  },
    methods: {
      loadFiles(event) {
        this.file = event.target.files[0];
        this.disabledScanButton = false;
        this.importingDone = false;
        this.importGFF3();
      },
      readGFF3FeatureTypes (file){
        this.showRemovedFeatures = false;
        // source gff3
        // ftp://ftp.ensemblgenomes.org/pub/bacteria/release-43/gff3/bacteria_8_collection/sulfolobus_acidocaldarius_dsm_639
        const reader = new FileReader();

        return new Promise ((resolve, reject) => {
          reader.onError = () => {
            reader.abort();
            reject(new DOMException('Problem parsing input file'))
          };

          reader.onload = () => {

            // begin of actual read in
            let text = reader.result;
            // ID check: if no ID matches for DESeq2 data can be found
            // the gff3 is useless and the user is notified
            for(let name of this.$store.state.currentDGE.geneNames){
              // as soon as one ID can be matched, the loop breaks
              // and the verificator is set to true
              if(text.includes(name)){
                this.idMatch = true;
                this.disabledImportButton = false;
                break;
              }
              //console.log(this.idMatch);
            }
            // list of Arrays. one array is one gff3-entry
            let lineContent = text.split('\n');
            // iterating over original list of gff3-entries
            for (let i=0; i<lineContent.length; i++){
              // splitting entry in the gff3 fields
              let splitEntry = lineContent[i].split('\t');
              // only sofa types found in the gff3 will be taken for the multiselect of additional features
              if(!this.sofa.includes(splitEntry[2]) && splitEntry[2] != null && splitEntry[2] !== this.DESeq2Type){
                this.sofa.push(splitEntry[2])
              }
             }
            //console.log(this.showRemovedFeatures);
            resolve(this.sofa);
            this.fileScanned= true;
            this.showRemovedFeatures=true;
          };
          reader.readAsText(file);
        })
      },
      readGFF3 (file) {
        this.content={};
        this.featuresCounted=[];
        // source gff3
        // ftp://ftp.ensemblgenomes.org/pub/bacteria/release-43/gff3/bacteria_8_collection/sulfolobus_acidocaldarius_dsm_639
        const reader = new FileReader();

        return new Promise ((resolve, reject) => {
          reader.onError = () => {
            reader.abort();
            reject(new DOMException('Problem parsing input file'))
          };

          reader.onload = () => {

            // final dict
            let filteredContent = {};
            // all selected feature types
            let selectedTypes = [];
            // array of wanted parent IDs
            let wantedParents = [];


            // generation of selectedTypes for gff3 read-in; selectedTypes = all selected types
            if (this.deseq2Features.length > 0) {
              for (let i = 0; i < this.deseq2Features.length; i++) {
                selectedTypes.push(this.deseq2Features[i])
              }
              selectedTypes.push(this.DESeq2Type)
            }
            // if no additional features were chosen, selectedTypes = [this.deseq2Type] (list with 1 item)
            else if (this.deseq2Features.length === 0) {
              selectedTypes.push(this.DESeq2Type)
            }

            for (let i = 0; i < selectedTypes.length; i++) {
              filteredContent[selectedTypes[i]] = {};
              //filteredContent = {gene:{}, CDS: {}, mRNA: {}}
            }
            // begin of actual read in
            // big string of file read as whole!!!!
            let text = reader.result;
            // array of gff3-lines
            let lineContent = text.split('\n');
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // iterating over original list of gff3 entries BACKWARDS !!!!!
            for (let i = lineContent.length - 1; i >= 0; i--) {
              if(!(lineContent[i].startsWith('#'))){
              // splitting entry in the gff3 fields
              let splitEntry = lineContent[i].split('\t');
              // checking if line is a parent
                // line is only a parent, if it has the ID
                // line could falsily be identified as parent, if it points to an already
                // added parent (if more than one feature points to the same parent), if
                // checking for parent only!
                var entryISparent = false;
                if (wantedParents.length !== 0) {
                for (let parent of wantedParents) {
                  if (splitEntry[8].includes('ID='+parent)) {
                    var actualParent = parent;
                    entryISparent = true;
                  } else {
                    entryISparent = false;
                  }
                }
              }else if (wantedParents.length === 0) {
                entryISparent = false;
              }
                // if type of line matches any type of selectedTypes or any parent!
              if (selectedTypes.includes(splitEntry[2]) || entryISparent) {
                // discarding  source and score
                // splitEntry is indexed newly after sPlicing!
                splitEntry.splice(1, 1);
                splitEntry.splice(4, 1);
                // getting metadata for feature from splitEntry
                var seqID = splitEntry[0];
                var type = splitEntry[1];
                var start = splitEntry[2];
                var end = splitEntry[3];
                var strand = splitEntry[4];
                var phase = splitEntry[5];
                // all attributes of feature as one string of structure: "identifier=info;identifier2=info2"; etc
                var attributes = splitEntry[6];
                // case of entry is a parent
                if (entryISparent) {
                  var letterIndex = 0;
                  for (let letter of actualParent) {
                    // first letter, that is not a letter lets loop break
                    if (!letter.match(/[a-z]/i)) {
                      break;
                    }
                    letterIndex = letterIndex + 1;
                  }
                  var parentType = actualParent.slice(0, letterIndex);
                  if (!(parentType in filteredContent)) {
                    filteredContent[parentType] = {};
                  }

                  // checking, if a wantedParent does not already exist in the filteredContentDict
                  // if it does not exist, it is added; no else needed
                  if (!(filteredContent[parentType][actualParent])) {
                    if (attributes.includes('ID=')) {
                      // array split  at semicolon in order to find parent
                      let attributeArray = attributes.split(';');
                      // iterating attribute array
                      for (let k = 0; k < attributeArray.length; k++) {
                        if (attributeArray[k].includes('ID=')) {
                          // array of structure: ['ID', 'ID_of_actualFeature']
                          let idArray = attributeArray[k].split('=');
                          var ID = idArray[1];
                          // if the current entry's ID equals the current wantedParent ID
                          // the current wantedParent is dealt with
                          //if (ID === actualParent) {
                          // remove parent dealt with from wanted parents list
                          wantedParents.pop(actualParent);
                          //}
                        }
                      }
                      // adding all to filteredContent but current (possible)parent
                      filteredContent[parentType][ID] = {
                        'name': ID,
                        'seqID': seqID,
                        'type': type,
                        'start': start,
                        'end': end,
                        'strand': strand,
                        'phase': phase,
                        'attributes': attributes,
                        'child': ID3,
                        'parent': ''
                      };
                      // a parent can have an own parent again
                      if (attributes.includes('Parent=')) {
                        // setting ID3 for next loop ; current feature's ID is a child ID, if the current feature has a parent
                        ID3 = ID;
                        // array split  at semicolon in order to find parent
                        let attributeArray = attributes.split(';');
                        // iterating attribute array
                        for (let m = 0; m < attributeArray.length; m++) {
                          if (attributeArray[m].includes('Parent=')) {
                            // array of structure: ['Parent', 'ID_of_parent']
                            let parentArray = attributeArray[m].split('=');
                            var parent = parentArray[1];
                            // add new parent to wanted parents (e.g. if parent was a transcript, it has a parent again)
                            if (!(wantedParents.includes(parent))) {
                              wantedParents.push(parent);
                            }
                          }
                        }
                        // adding current parent info to filteredContent
                        filteredContent[parentType][ID]['parent'] = parent;
                      } else {
                        // adding current parent info to filteredContent
                        parent = 'none';
                        filteredContent[parentType][ID]['parent'] = parent;
                      }
                      // resetting parent
                      parent = 'none';
                    }
                  }
                  // entry is not a parent but is of type the user wanted
                  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
                } else {
                  // checking attributes for parent information (case insensitive)
                  if (attributes.includes('Parent=') || attributes.includes('ID=') || attributes.includes('product=')) {
                    var parent2;
                    var product;
                    if (!attributes.includes('Parent=')) {
                      parent2 = 'none';
                    }
                    if (!attributes.includes('product=')) {
                      product = 'none';
                    }
                    // array split  at semicolon in order to find parent
                    let attributeArray = attributes.split(';');
                    // iterating attribute array
                    for (let i = 0; i < attributeArray.length; i++) {
                      // ID of actual feature!
                      if (attributeArray[i].includes('ID=')) {
                        let idArray = attributeArray[i].split('=');
                        var ID3 = idArray[1];
                      } else if (attributeArray[i].includes('Parent=')) {
                        // array of structure: ['Parent', 'ID_of_parent']
                        let parentArray = attributeArray[i].split('=');
                        // id of parent!!!
                        parent2 = parentArray[1];
                        if (!(wantedParents.includes(parent2))) {
                          wantedParents.push(parent2);
                        }
                      } else if (attributeArray[i].includes('product=')) {
                        let productArray = attributeArray[i].split('=');
                        product = productArray[1];
                      }
                    }
                  }
                  if(!(filteredContent[splitEntry[1]][ID3])){
                    filteredContent[splitEntry[1]][ID3] = {
                      'name': ID3,
                      'seqID': seqID,
                      'type': type,
                      'start': start,
                      'end': end,
                      'strand': strand,
                      'phase': phase,
                      'attributes': attributes,
                      'child': 'none',
                      'parent': parent2,
                      'product': product
                    };
                  }

                }
              }
            }
            }
              for (const [key, value] of Object.entries(filteredContent)){
                let innerValues= Object.keys(value);
                // for display of feature statistic in slider 4 of import
                // structure for b-table. feature and count are specified as "fields"
                // = table headers, which are recognized in the array of dicts
                // to correctly assign values of rows
                this.featuresCounted.push({"feature": key, "count" : innerValues.length});
            }

            // adding DESeq2 Info to the gff3-infos
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // eslint-disable-next-line no-console
            console.log(filteredContent);
            this.content = filteredContent;
            //console.log(this.content);
            this.showRemovedFeatures = true;
            resolve(this.content)
          };
          //console.log(this.$store.state.deseq2Type);
          reader.readAsText(file);
        })
      },
      scanGFF3 (){
        // import available after scan only
        let vueData =this;
        this.readGFF3FeatureTypes(vueData.file);

      },
      importGFF3 () {
        let vueData = this;
        this.readGFF3(vueData.file)
      },
      integrateGFF3 () {
        this.disabledImportButton = true;
        this.disabledScanButton = true;
        this.importingFiles = true;
        this.$store.dispatch(STORE_GFF3_DATA, {
          gffContentDict: this.content
        }).then(() => {
          this.importingFiles = false;
          this.importingDone = true
        });
        //console.log(this.$store.state.gff3Data);
      },
    },
  }
</script>

<style scoped>

</style>
