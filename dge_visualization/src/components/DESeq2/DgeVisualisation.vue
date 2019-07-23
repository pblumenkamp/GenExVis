/*eslint-env node*/
<template>
  <div style="width: 98%; height: 600px; margin-left: 48px; text-align: center">
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
        </b-row>
        <div v-if="selectedCondition1 && selectedCondition2" style="margin-top: 10px">
          <h4>Chose chart specifications</h4>
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
                <h4>Select Operon Size</h4>
                <multiselect
                  v-model="selectedOperonSize"
                  :options="operonSizes"
                  :multiple="false"
                  :close-on-select="true"
                  :clear-on-select="false"
                  :preserve-search="true"
                  :show-labels="true"
                  :preselect-first="false"
                  placeholder="Choose operon size"
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
              <b-col style="width: 25%;">Biggest putative operon: {{ biggestOperon }}</b-col>
              <b-col style="width: 25%;">Putative operons (total): {{ operonCount }}</b-col>
            </b-row>
          </b-container>
        </div>
        <div v-if="selectedRegulationType && selectedOperonSize && selectedCondition1 && selectedCondition2" style="margin-top: 90px; width: 100%">
          <b-container style="width: 100%; max-width: 100%; border: 0px solid black">
            <b-row style="width: 100%; border: 0px solid black">
              <b-col style="width: 50%; max-width: 50%;border: 0px solid black">
                <!-- index is the for-loop index used to generate unique keys. Highcharts will render to the unique key, since the charts are generated in a for-loop aswell -->
                <div v-for="(item, index) in filteredOperonList" :key="index" style="width:100%">
                  <!-- Element for Highchart graphic -->
                  <div :id="index" style="height: 600px; width: 100%; max-width: 100%; margin-top: 10px; border: 1px solid black"></div>
                </div>
              </b-col>
              <b-col style="width: 50%; max-width: 50%">
                <div
                  v-for="(operon, index) in tableList"
                  :key="index"
                  class="wrapper"
                  style="height: 600px; margin-top: 10px; margin-left: 5em"
                >
                  <table style="border-collapse: separate; width: 100%; display: block; overflow-x: scroll; overflow-y: visible;">
                    <tr v-for="(gene, index_j) in operon" :key="index_j">
                      <th class="fixedFirstColumn" style="border: 1px solid black; width: 95px">{{ gene.name }}</th>
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
              </b-col>
            </b-row>
          </b-container>
        </div>
      </div>
    </b-card>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  import {ConditionPair} from '../../utilities/dge'

  let Highcharts = require('highcharts');
  require('highcharts/modules/exporting')(Highcharts);
  require('highcharts/modules/offline-exporting')(Highcharts);

  export default {
    name: 'DgeVisualisation',
    components: {
      Multiselect
    },
    data () {
      return {
        // condition selections
        selectedGraphic: '',
        graphicTypes:['Operon', 'log2Fold-change heatmap', 'Uniquely regulated genes', '3D Scatter plot'],
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
        inputLog2FoldThresholdVENN: 1.0,
        inputPThresholdVENN: 0.001,
        uniqueGenesRawData: null
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
          // in conditions1, there is the condition all DGE data have "in common" (dataType Set)
          conditions1.add(condition1);
          // in conditions 2, there are all the compare-conditions
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
      }
    },
    watch: {
      selectedGraphic(){
        if (this.selectedGraphic === 'Operon'){
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
          this.createOperonTableData();
          this.operonCount= this.filteredOperonList.length;
        }
      },
      selectedCondition2(){
        if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          this.createOperonTableData();
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
          this.createOperonTableData();
          this.operonCount= this.filteredOperonList.length;
        }
      },
      inputPThreshold (){
        if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize) {
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          this.createOperonTableData();
          this.operonCount = this.filteredOperonList.length;
        }
      },
      inputLog2FoldThreshold (){
        if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize) {
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          this.createOperonTableData();
          this.operonCount = this.filteredOperonList.length;
        }
      }
    },
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

        // IDEA: in gff3 they keys are: type:uniqueID
        // split at colon and make substring search in originalGeneNames
        // if match, take uniqueID as name and get the deseq2Analysis-Data from originalGeneName

        let deseq2Type = Object.values(deseq2Dummy);
        // value-Dict for e.g. gene (if DESeq2Type was gene)
        let deseq2_gff3Match = (theGFF3[deseq2Type]);
        var keys = Object.keys(deseq2_gff3Match);
        //////////////////////////////////////////////////////////////////////////////

        // iterating one gene
        for (let originalGeneName of theDGE.geneNames) {
          // iterating gff3-Dict at Deseq2Type = another dict again with structure: {ID1:{}, ID2:{}....}
          for(let longKey of keys){
            // inner gff3-keys have structure: featureType:uniqueID
            let keyArray=longKey.split(':');
            let key= keyArray[1];
            let value =deseq2_gff3Match[longKey];
            // if we have DESeq2-Data and gff3-data for the feature, we get the feature information
            if (originalGeneName.includes(key)){
              var geneName = key;
              var start = value['start'];
              var end = value['end'];
              var strand=value['strand'];
              var phase = value['phase'];
              var parent;
              var child;
              var attributes;
              var description;
              if('parent' in value){
                parent = value['parent'];
              }else{
                parent = 'none';
              }
              if('attributes' in value){
                attributes = value['attributes'];
                if (attributes.includes("description")) {
                  // splitting attributes of the gene's gff3 entry only at the semicolon
                  let attributeArray = attributes.split(";");
                  // iterating the attributeArray
                  for (let i = 0; i < attributeArray.length; i++) {
                    // at the point of the description, spliting the description=whatIwant at the '='
                    if (attributeArray[i].includes("description")) {
                      let itemArray = attributeArray[i].split("=");
                      description = itemArray[itemArray.length - 1];
                    }
                  }
                }else{
                  description = 'none';
                }
              }else{
                attributes = 'none';
              }
              if('child' in value){
                child=value['child'];
              }else{
                child='none';
              }
              //////////////////////////////////////////////////////////////////////////////

              // originalGeneName would be Saci_0001.gene for example. The .gene must be discarded
              // gff3 gene id example: gene:Saci_0001
              // only Saci_0001 is written to geneDict for later match/search in gff3-data
              // Saci_0001 is written to the geneDict as key and in the value as name
              // one gene's deseq2Analysis
              let deseq2Analysis = theDGE.getGene(originalGeneName).getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2));
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
                      description: description
                    }
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
                      description: description
                    }
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
                      description: description
                    }
                  }
                }
              }
            }
          }
        }
      },
      formatBARCHARTdata(){
        // sort by start
        // abandon need to check if element is before a previous one, only
        // gap now relevant
        let values = Object.values(this.geneDict).sort(function(a,b){return a.start - b.start});
        let operonDummy=[];
        let operonList=[];
        let biggestOperonDummy= 0;
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
          if(operonList[i].length < 2){
            continue;
          }else if (operonList[i].length >= parseInt(this.selectedOperonSize)) {
            this.filteredOperonList.push(operonList[i]);
          }
        }
        let counter = 0;
        for (let i=0; i<this.filteredOperonList.length; i++){
          while(counter<this.filteredOperonList[i].length){
            this.filteredOperonList[i][counter]['x']=counter;
            counter=counter+1;
          }
          counter=0;
        }
      },
      drawBARCHART(){
        //this.tableList = [];
        let dataList = this.filteredOperonList;
        for (var index in dataList){
          let pointWidth = 30-(dataList[index].length);
          let plotTitle= "";
          // dataList[index] = one operon with data structure: [{name:..., log2fold:..., pValue:..., start:...end:...,strand:..., description:..., etc},{},{},{}]
          // building plot title as "<name1stoperongene> - <namelastoperongene>
          for(let item in dataList[index]){
            if(parseInt(item) === 0){
              plotTitle=plotTitle+'Pos. '+dataList[index][item]['start']+" - ";
            }
            else if(parseInt(item) === (dataList[index].length-1)){
              plotTitle=plotTitle+'Pos. '+dataList[index][item]['end']
            }
          }
          // chart Options
          let options = {
            chart: {
              type: 'column',
              zoomType: 'xy',
              height: '500px'
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
                rotation: 45,
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
                'description: {point.description}<br/>' +
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
              pointWidth: pointWidth,
              color: 'rgba(223, 83, 83, .5)'
            }]
          };
          //setting data in the chart options (still in for loop, this is done for each series in the dataList one after the other)
          options.series[0].data = dataList[index];
          // making highcharts render to html with id = index with given options
          Highcharts.chart(index, options);
        }
      },
      createOperonTableData(){
        this.tableList=[];
        for(let i =0; i<this.filteredOperonList.length; i++){
          let oneTable= [];
          let tableHeaders={name: 'Name', start: 'Start', end: 'End', strand: 'Strand', description: 'description', log2fold: 'log2Fold-Change', pValue: 'pValue', pAdj: 'pValue (adjusted)', lfcSE: 'lfcSE', baseMean: 'Base mean', stat: 'Stat'};
          oneTable.push(tableHeaders);
          let oneTableData = this.filteredOperonList[i];
          for(let k=0; k<oneTableData.length; k++){
            let oneTableRow;
            //oneTableRow=[oneTableData[k]['name'], oneTableData[k]['start'], oneTableData[k]['end'], oneTableData[k]['strand'], oneTableData[k]['description'], oneTableData[k]['log2fold'], oneTableData[k]['pValue'], oneTableData[k]['pAdj'], oneTableData[k]['lfcSE'], oneTableData[k]['baseMean'], oneTableData[k]['stat']];
            oneTableRow={value: false, name: oneTableData[k]['name'], start: oneTableData[k]['start'], end: oneTableData[k]['end'], strand: oneTableData[k]['strand'], description: oneTableData[k]['description'], log2fold: oneTableData[k]['log2fold'], pValue: oneTableData[k]['pValue'], pAdj: oneTableData[k]['pAdj'], lfcSE: oneTableData[k]['lfcSE'], baseMean: oneTableData[k]['baseMean'], stat: oneTableData[k]['stat']};
            oneTable.push(oneTableRow);
          }
          this.tableList.push(oneTable);
        }
      }
    }
  }




</script>

<style scoped>
  .fixedFirstColumn{
    position:absolute;
    width:5em;
    left:0;
    top:auto;
    border-right: 0px none black;
    border-top-width:1px; /*only relevant for first row*/
    margin-top:-1.5px; /*compensate for top border*/
  }
  th, td {
    margin:0;
    border:0px solid black; /* useful to seperate columns if wanted*/
    border-top-width:0px;
    white-space:nowrap;
    background-color: white;
  }
  /* collapse all borders */
  .wrapper table{
    width:100%;
    border-collapse:collapse;
    border-top: none;
    background-color: black;
    border-spacing: 1px;
    border-left: none;
  }

  /* activate all borders */
  .wrapper table td {
    border-bottom: none;
    border-left: none;
    border-top: none;
  }

  /* turn off unnecessary borders: */
  .wrapper table tr:first-child td{
    border-top:none;
  }

  .wrapper table tr:last-child td{
    border-bottom:none;
  }

  .wrapper table tr td:last-child{
    border-right:none;
  }

  .wrapper table tr td:first-child{
    border-left:none;
  }
</style>
