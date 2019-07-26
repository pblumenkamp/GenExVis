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
                unknown, chose "gene".
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
    <div v-if="fileScanned" style="width: 100%; margin: 2rem auto 0">
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
    <b-row>
      <div v-if="showRemovedFeatures && fileScanned" style="width: 100%; margin: 2rem auto 0">
        <h4 style="margin-top: 20px">
          GFF3 counts for the chosen features:
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
        showMetadataFeatureHelp: false,
        showDeseq2TypeHelp: false,
        // array to show features removed due to no entries in gff3
        // and validator for v-if to show it only, if entries have been removed
        featuresCounted: [],
        showRemovedFeatures: false,
        // validator for notation display to check features because some were not found in gff3
        fileScanned: false,
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
            // list of Arrays. one array is one gff3-entry
            let lineContent = text.split('\n');
            // iterating over original list of gff3-entries
            for (let i=0; i<lineContent.length; i++){
              // splitting entry in the gff3 fields
              let splitEntry = lineContent[i].split('\t');
              //console.log(splitEntry[2]);
              if(!this.sofa.includes(splitEntry[2]) && splitEntry[2] != null && splitEntry[2] !== this.DESeq2Type){
                this.sofa.push(splitEntry[2])
              }
            }
            resolve(this.sofa);
            this.fileScanned= true;
          };
          reader.readAsText(file);
        })
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

            // final dict
            let filteredContent ={};
            // all selected feature types
            let selectedTypes= [];
            // array of wanted parent IDs
            let wantedParents = [];



            // generation of selectedTypes for gff3 read-in; selectedTypes = all selected types
            if(this.deseq2Features.length >0){
              for (let i=0; i<this.deseq2Features.length; i++){
                selectedTypes.push(this.deseq2Features[i])
              }
              selectedTypes.push(this.DESeq2Type)
            }
            // if no additional features were chosen, selectedTypes = [this.deseq2Type] (list with 1 item)
            else if (this.deseq2Features.length === 0){
              selectedTypes.push(this.DESeq2Type)
            }

            for (let i=0; i<selectedTypes.length; i++){
              filteredContent[selectedTypes[i]]={};
              //filteredContent = {gene:{}, CDS: {}, mRNA: {}}
            }

            // begin of actual read in
            // big string of file read as whole!!!!
            let text = reader.result;
            // array of gff3-lines
            let lineContent = text.split('\n');
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // iterating over original list of gff3 entries BACKWARDS !!!!!
            for (let i=lineContent.length-1; i>=0; i--){
              // splitting entry in the gff3 fields
              let splitEntry = lineContent[i].split('\t');
              // if type of line matches any type of selectedTypes
              if (selectedTypes.includes(splitEntry[2])){
                // discarding  source and score
                // splitEntry is indexed newly after sPlicing!
                splitEntry.splice(1,1);
                splitEntry.splice(4,1);
                // getting metadata for feature from splitEntry
                var seqID = splitEntry[0];
                var type = splitEntry[1];
                var start = splitEntry[2];
                var end = splitEntry[3];
                var strand = splitEntry[4];
                var phase = splitEntry[5];
                // all attributes of feature as one string of structure: "identifier=info;identifier2=info2"; etc
                var attributes = splitEntry[6];
                //console.log(attributes);
                // if we have wanted parents
                var ID3;
                if (wantedParents.length !== 0){
                  // iterating the wanted parents
                  for (let n=0; n<wantedParents.length; n++){
                    // actual wanted parent of structure: type:uniqueID; parentID = longParent
                    let longParent = wantedParents[n];
                    // splitting expression at colon
                    let parentArray=longParent.split(':');
                    let parentType = parentArray[0];
                    if (parentType === 'transcript'){
                      parentType = 'mRNA';
                    }
                    // checking, if a wantedParent does not already exist in the filteredContentDict
                    if(!filteredContent[parentType][longParent]){
                      //if(!(wantedParents[n] in filteredContent[splitEntry[1]])){
                      // checking attributes for parent ID information (case insensitive)
                      if (attributes.includes('ID=') || attributes.includes('id=')){
                        // array split  at semicolon in order to find parent
                        let attributeArray= attributes.split(';');
                        // iterating attribute array
                        for(let k=0; k < attributeArray.length; k++){
                          if(attributeArray[k].includes('ID=') || attributeArray.includes('id=')){
                            // array of structure: ['ID', 'ID_of_actualFeature']
                            let idArray=attributeArray[k].split('=');
                            let arrayDummy = idArray[1].split(':');
                            var ID=arrayDummy[1];
                            // if the current entry's ID equals the current wantedParent ID
                            // the current wantedParent is dealt with
                            if (ID === longParent){
                              // remove parent dealt with from wanted parents list
                              wantedParents.pop(wantedParents[n]);
                            }
                          }
                        }
                        // adding all to filteredContent but current (possible)parent
                        filteredContent[splitEntry[1]][ID]={'name': ID,'seqID': seqID, 'type':  type, 'start': start, 'end': end, 'strand': strand, 'phase': phase, 'attributes': attributes, 'child': ID3, 'parent': ''};
                        // setting ID3 for next loop
                        ID3 = ID;
                        // a parent can have an own parent again
                        if (attributes.includes('Parent=') || attributes.includes('parent=')){
                          // array split  at semicolon in order to find parent
                          let attributeArray= attributes.split(';');
                          // iterating attribute array
                          for(let m =0; m < attributeArray.length; m++){
                            if(attributeArray[m].includes('Parent=') || attributeArray[m].includes('parent=')){
                              // array of structure: ['Parent', 'ID_of_parent']
                              let parentArray=attributeArray[m].split('=');
                              var parent=parentArray[1];
                              // add new parent to wanted parents (e.g. if parent was a transcript, it has a parent again)
                              if(!(wantedParents.includes(parent))){
                                wantedParents.push(parent);
                              }
                            }
                          }
                        }
                      }
                      // adding current parent info to filteredContent
                      filteredContent[splitEntry[1]][ID]['parent'] = parent;
                      // resetting parent
                      parent = 'none';
                    }
                  }
                }else if(wantedParents.length === 0){
                // checking attributes for parent information (case insensitive)
                if (attributes.includes('Parent=') || attributes.includes('parent=') || attributes.includes('ID=') || attributes.includes('id=')){
                  // array split  at semicolon in order to find parent
                  let attributeArray= attributes.split(';');
                  // iterating attribute array
                  for(let i =0; i < attributeArray.length; i++){
                    // ID of actual feature!
                    if(attributeArray[i].includes('ID=') || attributeArray[i].includes['id=']){
                      let idArray=attributeArray[i].split('=');
                      let arrayDummy = idArray[1].split(':');
                      ID3=arrayDummy[1];
                    }
                    if(attributeArray[i].includes('Parent=') || attributes.includes('parent=')){
                      // array of structure: ['Parent', 'ID_of_parent']
                      let parentArray=attributeArray[i].split('=');
                      // id of parent!!!
                      var parent2=parentArray[1];
                      if(!(wantedParents.includes(parent2))){
                        wantedParents.push(parent2);
                      }
                    }
                  }
                }
                // since the splitEntry[2] = gff3 entry type is in selectedTypes
                // it must be a key in filteredContent
                // cleaned up splitEntry is pushed to the value of that key
                // filteredContent structure: = {CDS:{CDS1:{seqID:, type:, start:, end:, etc}}, CDS2:{}, CDS3:{}, mRNA:{}, gene:{}}
                filteredContent[splitEntry[1]][ID3]={'name': ID3,'seqID': seqID, 'type':  type, 'start': start, 'end': end, 'strand': strand, 'phase': phase, 'attributes': attributes, 'parent': parent2};
                // resetting parent2
                parent2 = 'none';
                }
              }
            }
            if(this.fileScanned){
              for (const [key, value] of Object.entries(filteredContent)){
                let innerValues= Object.keys(value);
                // for display of feature statistic in slider 4 of import
                // structure for b-table. feature and count are specified as "fields"
                // = table headers, which are recognized in the array of dicts
                // to correctly assign values of rows
                this.featuresCounted.push({"feature": key, "count" : innerValues.length});
              }
            }

            // adding DESeq2 Info to the gff3-infos
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // initializing geneDict
            //this.geneDict = {};
            // whole dge data
            //let theDGE= this.$store.state.currentDGE;
            // whole gff3 data

            // deseq2Type is object with string value. Getting string only
            let deseq2Dummy = this.$store.state.deseq2Type;

            let deseq2Type = Object.values(deseq2Dummy);
            // value-Dict for e.g. gene (if DESeq2Type was gene)
            let gff3Genes = (filteredContent[deseq2Type]);
            console.log('gff3Genes');
            console.log(gff3Genes);
            //for(let originalGeneName of theDGE.geneNames){
              //for(let [key,value] of Object.entries(gff3Genes)){
                //if(originalGeneName.includes(key)){
                  //this.geneDict[key]=value;
                //}
              //}
            //}

            // NOTE: geneDict innerIDs now Saci_0001 and not gene:Saci_0001 for example!
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        this.disabledImportButton = false;
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
