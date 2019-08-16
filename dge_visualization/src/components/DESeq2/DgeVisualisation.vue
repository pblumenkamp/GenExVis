/*eslint-env node*/
<template>
  <div style="width: 98%; height: 600px; margin-left: 48px; text-align: center; border: 0px solid black">
    <h1>Differential Gene Expression - Visualisations</h1>
    <b-card style="height: 60%; border: 1px solid lightslategray; width: 100%">
      <!-- REGULATION TYPE SINGLE SELECT-->
      <b-col>
        <h4>Select graphic to display</h4>
        <multiselect
          v-model="selectedGraphic"
          :options="graphicTypes"
          :multiple="false"
          :close-on-select="true"
          :clear-on-select="false"
          :preserve-search="true"
          :show-labels="true"
          :preselect-first="false"
          placeholder="Choose graphic"
          selected-label="Selected"
          select-label="Click to select"
          deselect-label="Click to remove"
        >
          <template slot="selection" slot-scope="{ values, search, isOpen }">
            <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
          </template>
        </multiselect>
      </b-col>
      <div v-if="showOperon">
        <b-row style="margin-top: 10px;">
          <!-- Select first condition -->
          <b-col>
            <multiselect
              v-model="selectedCondition1"
              :options="dgeConditions[0]"
              :multiple="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :show-labels="true"
              :preselect-first="false"
              placeholder="Choose first condition"
              selected-label="Selected"
              select-label="Click to select"
              deselect-label="Click to remove"
            >
              <template slot="selection" slot-scope="{ values, search, isOpen }">
                <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
              </template>
            </multiselect>
          </b-col>
          <!-- Select second condition -->
          <b-col>
            <multiselect
              v-model="selectedCondition2"
              :options="dgeConditions[1]"
              :multiple="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :show-labels="true"
              :preselect-first="false"
              placeholder="Choose second condition"
              selected-label="Selected"
              select-label="Click to select"
              deselect-label="Click to remove"
            >
              <template slot="selection" slot-scope="{ values, search, isOpen }">
                <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
              </template>
            </multiselect>
          </b-col>
        </b-row>
        <div v-if="selectedCondition1 && selectedCondition2" style="margin-top: 10px">
          <h4>Specify barchart properties</h4>
          <b-container>
            <b-row>
              <!-- REGULATION TYPE SINGLE SELECT-->
              <b-col>
                <h4>Select log2Fold Change type</h4>
                <multiselect
                  v-model="selectedRegulationType"
                  :options="regulationDirections"
                  :multiple="false"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  :show-labels="true"
                  :preselect-first="false"
                  placeholder="Choose regulation"
                  selected-label="Selected"
                  select-label="Click to select"
                  deselect-label="Click to remove"
                >
                  <template slot="selection" slot-scope="{ values, search, isOpen }">
                    <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
                  </template>
                </multiselect>
              </b-col>
              <!-- OPERON SIZE SINGLE SELECT -->
              <b-col>
                <h4>Select minimum group size</h4>
                <multiselect
                  v-model="selectedOperonSize"
                  :options="operonSizes"
                  :multiple="false"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  :show-labels="true"
                  :preselect-first="false"
                  placeholder="Choose minimum group size"
                  selected-label="Selected"
                  select-label="Click to select"
                  deselect-label="Click to remove"
                >
                  <template slot="selection" slot-scope="{ values, search, isOpen }">
                    <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
                  </template>
                </multiselect>
              </b-col>
            </b-row>
          </b-container>
        </div>
        <!-- P-VALUE and LOG2FOLD THRESHOLD INPUTS -->
        <div v-if="selectedRegulationType && selectedOperonSize" style="margin-top: 20px; margin-bottom: 20px; width: 100%">
          <hr>
          <b-container style="max-width: 100%;">
            <b-row>
              <label style="margin-top: 0.4rem;">p-value threshold:</label>
              <b-col style="width: 25%">
                <b-form-input
                  v-model="inputPThreshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.001"
                  style="width: 10rem; margin-right: 0px"
                />
              </b-col>
              <label style="margin-top: 0.4rem;">log2Fold Change threshold:</label>
              <b-col style="width: 25%">
                <b-form-input
                  v-model="inputLog2FoldThreshold"
                  type="number"
                  min="-4"
                  max="4"
                  step="0.1"
                  style="width: 10rem; margin-right: 0px"
                />
              </b-col>
              <b-col style="width: 25%;">Biggest putative group: {{ biggestOperon }}</b-col>
              <b-col style="width: 25%;">Putative groups (total): {{ operonCount }}</b-col>
            </b-row>
          </b-container>
        </div>
        <!-- overflow: hidden in blue div works but table not scrollable-->
        <div v-if="selectedRegulationType && selectedOperonSize && selectedCondition1 && selectedCondition2" style="margin-top: 90px; width: 1300px; border: 0px solid blue;">
          <!-- index is the for-loop index used to generate unique keys. Highcharts will render to the unique key, since the charts are generated in a for-loop aswell -->
          <!-- index is also used to get table data-->
          <table style="width: auto; max-width: 100%; display: inline-block; border: 0px solid darkviolet">
            <tr v-for="(item, index) in filteredOperonList" :key="index" style="width: 100%; display: inline-block; border: 1px solid black; overflow-x: scroll; overflow-y: auto; margin-bottom: 20px; padding: 10px">
              <td>
                <!-- Element for Highchart graphic -->
                <div :id="index" style="height: auto; width: auto; max-width: 100%; margin-top: 10px; border: 0px solid green"></div>
              </td>
              <td>
                <!--Table in the column for selection, table and buttons -->
                <!--<div style="height: auto; width: auto; max-width: 100%; margin-top: 10px; border: 2px solid red"> -->
                <table style="width: auto; max-width: 100%; border: 0px solid red">
                  <tr>
                    <!-- first column table properties selection menu-->
                    <td style="vertical-align: top">
                      <h4 style="white-space: nowrap">Select table data</h4>
                      <multiselect
                        v-model="selectedTableOptions"
                        :options="tableOptions"
                        :multiple="true"
                        :close-on-select="false"
                        :clear-on-select="false"
                        :preserve-search="true"
                        :show-labels="true"
                        :preselect-first="false"
                        placeholder="Select table data"
                        selected-label="Selected"
                        select-label="Click to select"
                        deselect-label="Click to remove"
                      >
                        <template slot="selection" slot-scope="{ values, search, isOpen }">
                          <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
                        </template>
                      </multiselect>
                    </td>
                    <!-- feature table  -->
                    <td>
                      <div v-if="selectedTableOptions.length !== 0" style="margin-right: 2rem">
                        <table style="width: 100%; margin-left: 20px;">
                          <!-- tableList2 is an array of arrays of arrays. 1st inner array = one table; 2nd level inner arrays = table rows-->
                          <tr v-for="(gene, index_j) in tableList2[index]" :key="index_j" style="border: 1px solid black; white-space: nowrap">
                            <!--  <div v-for="(info, index_k) in gene" :key="info">
                            <td v-if="index_j === 0 && index_k===0">'Feature'</td>
                            <td v-else>{{ info }}</td>
                          </div>-->
                            <td v-for="(info, index_k) in gene" :key="index_k" style="border: 1px solid black; white-space: nowrap">{{ info }}</td>
                          <!-- <th style="border: 1px solid black; white-space: nowrap">{{ gene.name }}</th>
                          <td style="white-space: nowrap; border: 1px solid black">{{ gene.start }}</td>
                          <td style="white-space: nowrap; border: 1px solid black">{{ gene.end }}</td>
                          <td style="white-space: nowrap; border: 1px solid black">{{ gene.strand }}</td>
                          <td style="white-space: nowrap; border: 1px solid black">{{ gene.description }}</td>
                          <td style="white-space: nowrap; border: 1px solid black">{{ gene.log2fold }}</td>
                          <td style="white-space: nowrap; border: 1px solid black">{{ gene.pValue }}</td>
                          <td style="white-space: nowrap; border: 1px solid black">{{ gene.pAdj }}</td>
                          <td style="white-space: nowrap; border: 1px solid black">{{ gene.lfcSE }}</td>
                          <td style="white-space: nowrap; border: 1px solid black">{{ gene.baseMean }}</td>
                          <td style="white-space: nowrap; border: 1px solid black">{{ gene.stat }}</td>-->
                          </tr>
                          <tr>
                            <td>
                              <b-form-checkbox v-model="roundedValues" style="margin-top: 10px; white-space: nowrap">
                                Rounded Values
                              </b-form-checkbox>
                            </td>
                            <td>
                              <div :id="index" style="margin-top: 10px; text-align: left; margin-left: 10px; white-space: nowrap" @click="downloadOperonTable($event)">
                                <font-awesome-icon :icon="faDownload" /> Download table
                              </div>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
        <!--
          <b-row v-for="(item, index) in filteredOperonList" :key="index" style="width: 100%; border: 0px solid black">
            <b-col style="width: auto; max-width: 50%;border: 0px solid black">
               Element for Highchart graphic
              <div :id="index" style="height: auto; width: auto; max-width: 100%; margin-top: 10px; border: 0px solid red"></div>
            </b-col>
            <b-col style="width: auto; max-width: 50%; border: 2px solid green;">
              Table in the column for table and buttons

              <table style="border: 2px solid red">
                <tr>
                   fixed first column
                  <td>
                    <table>
                      <tr v-for="(gene, index_j) in tableList[index]" :key="index_j">
                        <th style="border: 1px solid black">{{ gene.name }}</th>
                      </tr>
                    </table>
                  </td>
                   scrollable table body
                  <td>
                    <div class="table-responsive">
                      <table style="overflow-x: scroll; display: block">
                        <tr v-for="(gene, index_j) in tableList[index]" :key="index_j">
                          <td>{{ gene.start }}</td>
                          <td>{{ gene.end }}</td>
                          <td>{{ gene.strand }}</td>
                          <td>{{ gene.description }}</td>
                          <td>{{ gene.log2fold }}</td>
                          <td>{{ gene.pValue }}</td>
                          <td>{{ gene.pAdj }}</td>
                          <td>{{ gene.lfcSE }}</td>
                          <td>{{ gene.baseMean }}</td>
                          <td>{{ gene.stat }}</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table> -->
        <!--
                  <b-row>
                    <b-col style="border: 2px solid green; min-width: auto">
                      <table style=" width: auto;">
                        <tr v-for="(gene, index_j) in tableList[index]" :key="index_j">
                          <th style="border: 1px solid black; width: 150px">{{ gene.name }}</th>
                        </tr>
                      </table>
                    </b-col>
                    <b-col style="border: 2px solid red; overflow-x: scroll; max-width: 90%">
                      <table>
                        <tr v-for="(gene, index_j) in tableList[index]" :key="index_j">
                          <td>{{ gene.start }}</td>
                          <td>{{ gene.end }}</td>
                          <td>{{ gene.strand }}</td>
                          <td>{{ gene.description }}</td>
                          <td>{{ gene.log2fold }}</td>
                          <td>{{ gene.pValue }}</td>
                          <td>{{ gene.pAdj }}</td>
                          <td>{{ gene.lfcSE }}</td>
                          <td>{{ gene.baseMean }}</td>
                          <td>{{ gene.stat }}</td>
                        </tr>
                      </table>
                    </b-col>
                    -->
        <!--
                    <table style="border-collapse: separate; width: 100%; display: block; overflow-x: scroll; overflow-y: visible;">
                      <tr v-for="(gene, index_j) in tableList[index]" :key="index_j">
                        <th class="fixedFirstColumn" style="border: 1px solid black; width: 150px">{{ gene.name }}</th>
                        <td>{{ gene.start }}</td>
                        <td>{{ gene.end }}</td>
                        <td>{{ gene.strand }}</td>
                        <td>{{ gene.description }}</td>
                        <td>{{ gene.log2fold }}</td>
                        <td>{{ gene.pValue }}</td>
                        <td>{{ gene.pAdj }}</td>
                        <td>{{ gene.lfcSE }}</td>
                        <td>{{ gene.baseMean }}</td>
                        <td>{{ gene.stat }}</td>
                      </tr>
                    </table>
                    -->
        <!--
          <b-row>
            <b-col>
              <b-form-checkbox v-model="roundedValues" style="margin-top: 10px">
                Rounded Values
              </b-form-checkbox>
            </b-col>
            <b-col>
              <div :id="index" style="margin-top: 10px" @click="downloadOperonTable($event)">
                <font-awesome-icon :icon="faDownload" /> Download table
              </div>
            </b-col>
          </b-row>
          -->
      </div>
    </b-card>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  import {ConditionPair} from '../../utilities/dge'
  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faDownload} from '@fortawesome/free-solid-svg-icons'

  let Highcharts = require('highcharts');
  require('highcharts/modules/exporting')(Highcharts);
  require('highcharts/modules/offline-exporting')(Highcharts);

  export default {
    name: 'DgeVisualisation',
    components: {
      Multiselect,
      FontAwesomeIcon
    },
    data () {
      return {
        // condition selections
        selectedGraphic: '',
        graphicTypes:['Jointly regulated features', 'log2Fold-change heatmap', 'Uniquely regulated genes', '3D Scatter plot'],
        showOperon: false,
        show3DScatter: false,
        showUniqueGenes: false,
        showHeatMap: false,
        // condition selections
        selectedCondition1: null,
        selectedCondition2: null,
        // selected threshold defaults
        inputPThreshold: 0.001,
        inputLog2FoldThreshold: 0.0,
        //log2Fold Change Quality SingleSelect
        selectedRegulationType: "",
        regulationDirections: ["upregulated", "downregulated", "both"],
        //operon Size SingleSelect
        selectedOperonSize: "",
        operonSizes:["2","3","4","5","6","7","8","open end"],
        // big dictionary of data for the operon BARCHART
        geneDict: null,
        geneGapSize: 1000,
        filteredOperonList: null,
        tableList: null,
        operonCount: 0,
        biggestOperon: 0,
        // concerning table download
        roundedValues: true,
        tableHeaders: null,
        downloadDict: null,
        tableFileName: "",
        tableOptions:[],
        selectedTableOptions:[],
        tableList2:[]
      }
    },
    computed: {
      // condition computing for dropdown selection based
      // on conditions available after the user
      // registered their conditions
      dgeConditions () {
        // sets needed for no duplicates
        // conditions for first dropdown
        let conditions1=new Set();
        // conditions for second dropdown
        let conditions2 =new Set();
        for (let {condition1, condition2} of this.$store.state.currentDGE.conditionPairs) {
          if (this.$store.state.registeredConditions.indexOf(condition1) === -1 ||
            this.$store.state.registeredConditions.indexOf(condition2) === -1) {
            continue
          }
          // in conditions1, there are the 1st conditions
          conditions1.add(condition1);
          // in conditions 2, there are the 2nd conditions
          conditions2.add(condition2);
        }
        // arrays needed for vue-multiselect
        conditions1 = Array.from(conditions1);
        conditions2 = Array.from(conditions2);
        // returns a list of sets
        return [conditions1, conditions2]
      },
      dge () {
        return this.$store.state.currentDGE;
      },
      faDownload () {
        return faDownload
      }
    },
    watch: {
      selectedGraphic(){
        if (this.selectedGraphic === 'Jointly regulated features'){
          this.showHeatMap = false;
          this.showOperon = true;
          this.showUniqueGenes = false;
          this.show3DScatter = false
        }
        else if(this.selectedGraphic === 'log2Fold-change heatmap'){
          this.showHeatMap = true;
          this.showOperon = false;
          this.showUniqueGenes = false;
          this.show3DScatter = false
        }
        else if(this.selectedGraphic === 'Uniquely regulated genes'){
          this.showHeatMap = false;
          this.showOperon = false;
          this.showUniqueGenes = true;
          this.show3DScatter = false
        }
        else if(this.selectedGraphic === '3D Scatter plot'){
          this.showHeatMap = false;
          this.showOperon = false;
          this.showUniqueGenes = false;
          this.show3DScatter = true
        }
      },
      selectedCondition1(){
        if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          // this.createOperonTableData();
          this.createOperonTableData2();
          this.operonCount= this.filteredOperonList.length;
        }
      },
      selectedCondition2(){
        if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          // this.createOperonTableData();
          this.createOperonTableData2();
          this.operonCount= this.filteredOperonList.length;
        }
      },
      selectedRegulationType () {
        if(this.selectedRegulationType === "upregulated"){
          this.inputLog2FoldThreshold = 1.5;
        }
        else if(this.selectedRegulationType === "downregulated"){
          this.inputLog2FoldThreshold = -1.5;
        }
        else if(this.selectedRegulationType === "both"){
          this.inputLog2FoldThreshold = 1.5;
        }
        if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          // this.createOperonTableData();
          this.createOperonTableData2();
          this.operonCount= this.filteredOperonList.length;
        }
      },
      selectedOperonSize (){
        // if the user does not provide a size distinct size
        // the size is set so small, that all putative operons pass
        if (this.selectedOperonSize === "open end"){
          this.selectedOperonSize = 2;
        }
        if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          // this.createOperonTableData();
          this.createOperonTableData2();

          this.operonCount= this.filteredOperonList.length;
        }
      },
      inputPThreshold (){
        if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize) {
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          // this.createOperonTableData();
          this.createOperonTableData2();

          this.operonCount = this.filteredOperonList.length;
        }
      },
      inputLog2FoldThreshold (){
        if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize) {
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          // this.createOperonTableData();
          this.createOperonTableData2();

          this.operonCount = this.filteredOperonList.length;
        }
      },
      roundedValues (){
        // this.createOperonTableData();
        this.createOperonTableData2();
      },
      selectedTableOptions (){
        // console.log('before');
        // console.log(this.tableList2);
        // this.tableList2 = [];
        // console.log('after');
        // console.log(this.tableList2);
        this.createOperonTableData2();
      }
    },
    // barcharts can be drawn only, if the html div already exists with a unique ID to render to
    // nextTick waits for DOM model changes (html div creating) and executes draw barchart afterwards
    updated(){
      if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
        this.$nextTick(()=>{
          this.drawBARCHART();
        })
      }
    },
    methods: {
      getBARCHARTStoreData() {
        // initializing geneDict
        this.geneDict = {};
        // whole dge data
        let theDGE= this.$store.state.currentDGE;
        // whole gff3 data
        let theGFF3 = this.$store.state.gff3Data;
        // deseq2Type is object with string value. Getting string only
        let deseq2Dummy = this.$store.state.deseq2Type;

        let deseq2Type = Object.values(deseq2Dummy);
        // value-Dict for e.g. gene (if DESeq2Type was gene)
        let deseq2_gff3Match = (theGFF3[deseq2Type]);
        var keys = Object.keys(deseq2_gff3Match);
        var geneNames= theDGE.geneNames; //set !
        var uniqueKeys=[];
        for(let key of keys){
          if(!geneNames.has(key)){
            uniqueKeys.push(key);
          }
        }
        // removing keys not present in DESeq2 analyses
        keys = keys.filter( function( el ) {
          return !uniqueKeys.includes( el );
        } );
        //////////////////////////////////////////////////////////////////////////////
        for(let key of keys){
          let value = deseq2_gff3Match[key];
          //
          // initializing variables for attribute assignment to features
          var attributes = value['attributes'];
          var splitAttributes = attributes.split(';');
          var dummyDict={};
          var identifier;
          var info;
          //
          // initializing/defining variables for deseq2Analysis of feature
          let deseq2Analysis = theDGE.getGene(key).getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2));
          var geneName = key;
          var start = value['start'];
          var end = value['end'];
          var strand=value['strand'];
          var phase = value['phase'];
          var parent;
          var child;
          var product;
          if('parent' in value){
            parent = value['parent'];
          }else{
            parent = 'none';
          }
          if('child' in value){
            child=value['child'];
          }else{
            child='none';
          }
          if('product' in value){
            product = value['product'];
          }else{
            product = 'unknown';
          }
          // if pValue matches user criteria
          if (deseq2Analysis.pAdj <= this.inputPThreshold) {
            // getting data based on regulation type and inputLog2FoldThreshold
            if (this.selectedRegulationType === "upregulated") {
              if (deseq2Analysis.log2FoldChange >= this.inputLog2FoldThreshold) {
                this.geneDict[geneName] = {
                  name: geneName,
                  y: Math.round(deseq2Analysis.log2FoldChange*100)/100,
                  pAdjrounded: (deseq2Analysis.pAdj).toPrecision(2),
                  log2fold: (deseq2Analysis.log2FoldChange),
                  pValue: (deseq2Analysis.pValue),
                  pAdj: (deseq2Analysis.pAdj),
                  baseMean:(deseq2Analysis.baseMean),
                  lfcSE: (deseq2Analysis.lfcSE),
                  stat: (deseq2Analysis.stat),
                  start: start,
                  end: end,
                  strand: strand,
                  phase: phase,
                  parent: parent,
                  child: child,
                  product: product
                };
                // adding ALL gff3 attributes for the feature to its dict
                for (let attribute of splitAttributes){
                  let splitAttribute=attribute.split('=');
                  identifier = splitAttribute[0];
                  // adding identifier to table options
                  if(!this.tableOptions.includes(identifier)){
                    this.tableOptions.push(identifier);
                  }
                  info = splitAttribute[1];
                  dummyDict[identifier] = info;
                }
                this.geneDict[geneName]=Object.assign({}, this.geneDict[geneName], dummyDict);
              }
            } else if (this.selectedRegulationType === "downregulated") {
              if (deseq2Analysis.log2FoldChange <= this.inputLog2FoldThreshold) {
                this.geneDict[geneName] = {
                  name: geneName,
                  y: Math.round(deseq2Analysis.log2FoldChange*100)/100,
                  pAdjrounded: (deseq2Analysis.pAdj).toPrecision(2),
                  log2fold: (deseq2Analysis.log2FoldChange),
                  pValue: (deseq2Analysis.pValue),
                  pAdj: (deseq2Analysis.pAdj),
                  baseMean:(deseq2Analysis.baseMean),
                  lfcSE: (deseq2Analysis.lfcSE),
                  stat: (deseq2Analysis.stat),
                  start: start,
                  end: end,
                  strand: strand,
                  phase: phase,
                  parent: parent,
                  child: child,
                  product: product
                };
                // adding ALL gff3 attributes for the feature to its dict
                for (let attribute of splitAttributes){
                  let splitAttribute=attribute.split('=');
                  identifier = splitAttribute[0];
                  // adding identifier to table options
                  if(!this.tableOptions.includes(identifier)){
                    this.tableOptions.push(identifier);
                  }
                  info = splitAttribute[1];
                  dummyDict[identifier] = info;
                }
                this.geneDict[geneName]=Object.assign({}, this.geneDict[geneName], dummyDict);
              }
            } else if (this.selectedRegulationType === "both") {
              if (Math.abs(deseq2Analysis.log2FoldChange) >= this.inputLog2FoldThreshold) {
                this.geneDict[geneName] = {
                  name: geneName,
                  y: Math.round(deseq2Analysis.log2FoldChange*100)/100,
                  pAdjrounded: (deseq2Analysis.pAdj).toPrecision(2),
                  log2fold: (deseq2Analysis.log2FoldChange),
                  pValue: (deseq2Analysis.pValue),
                  pAdj: (deseq2Analysis.pAdj),
                  baseMean:(deseq2Analysis.baseMean),
                  lfcSE: (deseq2Analysis.lfcSE),
                  stat: (deseq2Analysis.stat),
                  start: start,
                  end: end,
                  strand: strand,
                  phase: phase,
                  parent: parent,
                  child: child,
                  product: product
                };
                // adding ALL gff3 attributes for the feature to its dict
                for (let attribute of splitAttributes){
                  let splitAttribute=attribute.split('=');
                  identifier = splitAttribute[0];
                  // adding identifier to table options, but not ID, since ID is written to the table always
                  // as first column with tag "feature"
                  if(!this.tableOptions.includes(identifier) && identifier !== 'ID'){
                    this.tableOptions.push(identifier);
                  }
                  info = splitAttribute[1];
                  dummyDict[identifier] = info;
                }
                this.geneDict[geneName]=Object.assign({}, this.geneDict[geneName], dummyDict);
              }
            }
          }
        }
        // adding DESeq2 options to selection menu
        if(!this.tableOptions.includes('log2fold' , 'pAdj', 'baseMean' , 'lfcSE' , 'pValue' , 'stat')){
          this.tableOptions.unshift('log2fold' , 'pAdj', 'baseMean' , 'lfcSE' , 'pValue' , 'stat');
        }
        //console.log(this.tableOptions);
      },
      formatBARCHARTdata(){
        // sort by start
        // abandon need to check if element is before a previous one, only
        // gap now relevant
        let values = Object.values(this.geneDict).sort(function(a,b){return a.start - b.start});
        let operonDummy=[];
        let operonList=[];
        let biggestOperonDummy= 0;
        // reset biggest Operon
        this.biggestOperon=0;
        for (let i=0; i<values.length;i++){
          // very first element (first element of first operon)
          if(operonDummy.length === 0 && operonList.length === 0){
            operonDummy.push(values[i]);
            // add one to operon size counter
            biggestOperonDummy = biggestOperonDummy+1;
            // if we have started
          }else{
            // if next gene is on the same strand
            if(values[i]['strand'] === values[i-1]['strand']){
              // if next gene starts too far away
              if((parseInt(values[i]['start']) > parseInt(values[i-1]['end'])+this.geneGapSize)){
                // push operon to operonList
                operonList.push(operonDummy);
                // and start new operon
                // store biggest operon
                if(biggestOperonDummy > this.biggestOperon){
                  this.biggestOperon = biggestOperonDummy;
                }
                // reset operon size counter to 1
                biggestOperonDummy =1;
                operonDummy=[];
                operonDummy.push(values[i]);
              } else{
                // value is not too far away
                // add value to existing operon
                operonDummy.push(values[i]);
                // add to operon size counter
                biggestOperonDummy = biggestOperonDummy+1;
              }
              // if next gene is not on the same strand
            }else{
              // push operon to operonList
              operonList.push(operonDummy);
              if(biggestOperonDummy > this.biggestOperon){
                this.biggestOperon = biggestOperonDummy;
              }
              // reset operon size counter to 1
              biggestOperonDummy =1;
              // and start new operon
              operonDummy=[];
              operonDummy.push(values[i]);
            }
          }
        }
        // discard "operons" of length 1 (not an operon)
        // and discard operons smaller than selected size
        this.filteredOperonList=[];
        for (let i=0; i< operonList.length; i++){
        if (operonList[i].length >= parseInt(this.selectedOperonSize)) {
            this.filteredOperonList.push(operonList[i]);
          }
        }
      },
      drawBARCHART(){
        console.log('in draw barchart');
        //this.tableList = [];
        let dataList = this.filteredOperonList;
        for (var index in dataList){
          let pointWidth = 30-(dataList[index].length);
          let plotTitle= "";
          // dataList[index] = one operon with data structure: [{name:..., log2fold:..., pValue:..., start:...end:...,strand:..., description:..., etc},{},{},{}]
          for(let item in dataList[index]){
            if(parseInt(item) === 0){
              let myStart = this.thousandSeperator(dataList[index][item]['start']);
              var myEnd= this.thousandSeperator(dataList[index][item]['end']);
              plotTitle=plotTitle+'Pos. '+myStart+" - ";
              this.tableFileName =dataList[index][item]['start'] + '_';
            }
            else if(parseInt(item) === (dataList[index].length-1)){
              plotTitle=plotTitle+'Pos. '+ myEnd;
              this.tableFileName = this.tableFileName + dataList[index][item]['end']+ '_';
            }
          }
          this.tableFileName = this.tableFileName + this.selectedCondition1 + '_vs_' + this.selectedCondition2;
          // chart Options
          let options = {
            chart: {
              type: 'column',
              zoomType: 'xy',
              height: 'auto'
            },
            title: {
              text: plotTitle
            },
            subtitle: {
              text: this.selectedCondition1+ " vs. "+this.selectedCondition2
            },
            xAxis: {
              tickInterval: 1,
              type: "category",
              labels: {
                rotation:270,
                format: "{value}",
                style: {
                  fontSize: '14px'
                }
              }
            },
            yAxis: {
              max: this.commonMaxValue,
              tickInterval:0.5,
              title: {
                text: 'log2Fold Change',
                style: {
                  fontSize: '16px'
                }
              },
              labels: {
                style: {
                  fontSize: '14px'
                }
              }
            },
            legend: {
              enabled: false
            },
            tooltip: {
              useHTML: true,
              headerFormat: "",
              pointFormat:
                'log2Fold: {point.y}  ||  ' +
                ' pAdj: {point.pAdjrounded}<br/>' +
                'location: {point.start} - {point.end}<br/>' +
                'strand: {point.strand}<br/>' +
                'product: {point.product}<br/>' +
                'parent: {point.parent}  || ' +
                ' child: {point.child}',
              followPointer: false
            },
            exporting: {
              chartOptions: { // specific options for the exported image
                plotOptions: {
                  series: {
                    dataLabels: {
                      enabled: true
                    }
                  }
                }
              }
            },
            series: [{
              name: 'GENES',
              zones: [
                {
                  // downregulated
                  value: 0, // values up to zero (not including)
                  color: 'rgba(223, 83, 83, .5)'
                }, {
                // upregulated
                  color: 'rgba(16, 16, 238, 0.4)' // values from zero (including)
                }

              ],
              pointWidth: pointWidth,
              //color: 'rgba(223, 83, 83, .5)'  //OLD one color for all
            }]
          };
          //setting data in the chart options (still in for loop, this is done for each series in the dataList one after the other)
          options.series[0].data = dataList[index];
          // making highcharts render to html with id = index with given options
          Highcharts.chart(index, options);
        }
      },
/*      createOperonTableData(){
        this.tableList=[];
        this.downloadDict={};
        for(let i =0; i<this.filteredOperonList.length; i++){
          let oneTable= [];
          let oneDownloadTable=[];
          this.tableHeaders={name: 'Name', start: 'Start', end: 'End', strand: 'Strand', description: 'product', log2fold: 'log2Fold-Change', pValue: 'pValue', pAdj: 'pValue (adjusted)', lfcSE: 'lfcSE', baseMean: 'Base mean', stat: 'Stat'};
          oneTable.push(this.tableHeaders);
          let downloadHeaders=['Name', 'Start','End','Strand', 'product','log2Fold-Change','pValue','pValue (adjusted)','lfcSE','Base mean','Stat'];
          oneDownloadTable.push(downloadHeaders);
          let oneTableData = this.filteredOperonList[i];
          for(let k=0; k<oneTableData.length; k++){
            let oneTableRow;
            let pAdj;
            let log2Fold;
            let pValue;
            let stat;
            let baseMean;
            let lfcSE;
            if(this.roundedValues){
              log2Fold= Math.round(oneTableData[k]['log2fold']*100)/100;
              pAdj = oneTableData[k]['pAdj'].toPrecision(4);
              pValue = oneTableData[k]['pValue'].toPrecision(4);
              stat = Math.round(oneTableData[k]['stat']*100)/100;
              baseMean = Math.round(oneTableData[k]['baseMean']*100)/100;
              lfcSE = Math.round(oneTableData[k]['lfcSE']*100)/100;
            }else{
              log2Fold= oneTableData[k]['log2fold'];
              pAdj = oneTableData[k]['pAdj'];
              pValue = oneTableData[k]['pValue'];
              stat = oneTableData[k]['stat'];
              baseMean = oneTableData[k]['baseMean'];
              lfcSE = oneTableData[k]['lfcSE'];
            }
            //oneTableRow=[oneTableData[k]['name'], oneTableData[k]['start'], oneTableData[k]['end'], oneTableData[k]['strand'], oneTableData[k]['description'], oneTableData[k]['log2fold'], oneTableData[k]['pValue'], oneTableData[k]['pAdj'], oneTableData[k]['lfcSE'], oneTableData[k]['baseMean'], oneTableData[k]['stat']];
            oneTableRow={value: false, name: oneTableData[k]['name'], start: oneTableData[k]['start'], end: oneTableData[k]['end'], strand: oneTableData[k]['strand'], description: oneTableData[k]['product'], log2fold: log2Fold, pValue: pValue, pAdj: pAdj, lfcSE: lfcSE, baseMean: baseMean, stat: stat};
            oneTable.push(oneTableRow);
            let oneDownloadRow=[oneTableData[k]['name'], oneTableData[k]['start'], oneTableData[k]['end'], oneTableData[k]['strand'], oneTableData[k]['product'], log2Fold, pValue, pAdj, lfcSE, baseMean, stat];
            oneDownloadTable.push(oneDownloadRow);
          }
          this.tableList.push(oneTable);
          this.downloadDict[i]=oneDownloadTable;
        }
      },*/
      createOperonTableData2(){
        console.log('in create');
        let oneTable=[];
        this.tableList2 = [];
        if(this.selectedTableOptions.length>0) {
          // console.log('in function');
          // console.log(this.tableList2);
          //this.tableList2 = [];
          this.downloadDict={};
          for (let i = 0; i < this.filteredOperonList.length; i++) {
            oneTable = [];
            // adding selected headers as deepcopy due to call by reference of JS
            // and infinite update hook with selectedOptionsWatcher if unshifting 'Feature'
            let tableHeaders = JSON.parse(JSON.stringify(this.selectedTableOptions));
            tableHeaders.unshift('Feature');
            oneTable.push(tableHeaders);
            //let downloadHeaders = this.selectedTableOptions;
            //oneDownloadTable.push(downloadHeaders);
            // adding row info to tables
            // let oneTableData = this.filteredOperonList[i];
            let oneTableData = JSON.parse(JSON.stringify(this.filteredOperonList[i]));
            // console.log(this.filteredOperonList[i].length);
            for (let k = 0; k < oneTableData.length; k++) {
              let oneTableRow = [];
              var featureID = oneTableData[k]['ID'];
              // adding info chosen by user only
              for (let identifier of this.selectedTableOptions) {
                if (oneTableData[k][identifier]) {
                  // rounded values
                  if (this.roundedValues && (identifier === 'log2fold' || identifier === 'stat' || identifier === 'baseMean' || identifier === 'lfcSE')) {
                    let value = oneTableData[k][identifier];
                    value = Math.round(value*100)/100;
                    oneTableRow.push(value);
                    // rounded p Values
                  } else if (this.roundedValues && (identifier === 'pAdj' || identifier === 'pValue')) {
                    let value = oneTableData[k][identifier];
                    value = value.toPrecision(4);
                    oneTableRow.push(value);
                    // other values & not rounded values
                  } else {
                    oneTableRow.push(oneTableData[k][identifier]);
                  }
                }
                if(! oneTableRow.includes(featureID)){
                  oneTableRow.unshift(featureID);
                }
              }
              // adding row to table
              oneTable.push(oneTableRow);
              // console.log(oneTableRow);
            }
            this.tableList2.push(oneTable);
            this.downloadDict[i] = oneTable;
          }
          // Array of arrays. 1st level inner array = one Table; 2nd level inner array = 1 table row
          //console.log(this.tableList2);
        }
        },
      downloadOperonTable: function(event) {
        // getting elements ID in order to download one table only
        let targetID= event.currentTarget.id;
        // expression to add row information taken from:
        // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
        // to write csv, one 1D big array is needed. In order to give row info, we need newlines between each entry (inner array)
        let csvData = this.downloadDict[targetID];
        let csvContent = csvData.map(e => e.join(',')).join('\n');
        // function to download csv taken from:
        // https://stackoverflow.com/questions/23301467/javascript-exporting-large-text-csv-file-crashes-google-chrome
        function downloadFile (data, fileName) {
          let blob = new Blob([data], {type: 'application/csv;charset=utf-8;'});
          if (window.navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName)
          } else {
            let link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.style = 'invisibility: hidden';
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link)
          }
        }
        downloadFile(csvContent, this.tableFileName)
      },
      thousandSeperator(number) {
        // Info: Die '' sind zwei Hochkommas
        number = '' + number;
        if (number.length > 3) {
          let mod = number.length % 3;
          let output = (mod > 0 ? (number.substring(0,mod)) : '');
          for (let i=0 ; i < Math.floor(number.length / 3); i++) {
            if ((mod === 0) && (i === 0)) {
              output += number.substring(mod + 3 * i, mod + 3 * i + 3);
            }else{
        // setting thousand separator as '
          output+= "'" + number.substring(mod + 3 * i, mod + 3 * i + 3);
            }
          }
          return output;
        } else{ return number }
      }
    }
  }

</script>

<style scoped>

</style>
