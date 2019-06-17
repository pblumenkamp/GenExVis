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
      <div style="width: 100%; margin: 2rem auto 0">
        <b-row>
          <b-col>
            <h4>Select Features</h4>
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
                  Chose up to three types of features to investigate the GFF3 for. The type of the DESeq2 Analysis chosen
                  before is preselected and cannot be deselected, since it is mandatory for a correct GFF3 import.
                </b-card>
              </transition>
            </b-collapse>
          </b-col>
        </b-row>
      </div>
    </b-container>
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
        file: null,
        content: [],
        contentTry: null,
        importingFiles: false,
        importingDone: false,
        disabledImportButton: true,
        showMetadataFeatureHelp: false,
        deseq2Features: [],
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
      }
    },
    updated () {
      this.updateDeseq2Features();
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
              if(splitEntry[2] === 'gene' && (splitEntry[8].includes('gene_id')|| splitEntry[8].includes('ID=gene:'))){
                // discarding seqID, source and score
                // splitEntry is indexed newly after sPlicing!
                splitEntry.splice(0,1);
                splitEntry.splice(0,1);
                splitEntry.splice(3,1);
                filteredContent.push(splitEntry)
              }
            }
            this.content = filteredContent;
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
          gffContent: this.content
        }).then(() => {
          this.importingFiles = false;
          this.importingDone = true
        });
      },
      updateDeseq2Features (){
        let storeValue = this.$store.state.deseq2Type;
        if(!this.deseq2Features.includes(storeValue)){
          this.deseq2Features.push(storeValue)
        }
      }
    }
  }
</script>

<style scoped>

</style>
