/*eslint-env node*/
<template>
  <div style="width: 90%; height: 600px; margin-left: 48px; text-align: center">
    <h1>Differential Gene Expression - Visualisations</h1>
    <b-card style="height: 60%; border: 1px solid lightslategray; width: 100%">
      <!-- REGULATION TYPE SINGLE SELECT-->
      <b-col>
        <h4>Select graphic to display</h4>
        <multiselect
          v-model="selectedGraphic"
          :options="graphicTypes"
          :multiple="false"
          :close-on-select="false"
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
      <div v-if="showOperon">
        <!-- Dropdown to selecte the first condition -->
        <b-form-select v-model="selectedCondition1" style="width: auto; margin-top: 15px" @change="selectedCondition2 = ''">
          <!-- Display before dropdown is openend -->
          <template slot="first">
            <option :value="''" disabled>
              -- Please select the first condition --
            </option>
          </template>
          <!-- Actual options displayed. dgeConditions[0] is a Set with one member -->
          <option
            v-for="cond in Array.from(dgeConditions[0])"
            :key="cond"
            :value="cond"
          >
            {{ cond }}
          </option>
        </b-form-select>
        <!-- Dropdown for second condition. Disabled, if no first condition was chosen -->
        <b-form-select
          v-model="selectedCondition2"
          style="width: auto; margin-top: 15px"
          :disabled="selectedCondition1 === ''"
        >
          <!-- Display before dropdown is openend -->
          <template slot="first">
            <option :value="''" disabled>
              -- Please select the second condition --
            </option>
          </template>
          <!-- Actual options displayed. dgeConditions[1] is a Set with members without the member of dgeConditions[0] -->
          <!-- Disabled: if condition without dgeConditions[0] does not match remaining ones (double check?) -->
          <option
            v-for="cond in Array.from(dgeConditions[1])"
            :key="cond"
            :value="cond"
            :disabled="!conditions2.has(cond)"
          >
            {{ cond }}
          </option>
        </b-form-select>
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
                  :close-on-select="false"
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
                  :close-on-select="false"
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
              <b-col style="width: 33%">
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
              <b-col style="width: 33%">
                <b-form-input
                  v-model="inputLog2FoldThreshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  style="width: 10rem; margin-right: 0px"
                />
              </b-col>
              <b-col style="width: 33%; margin-top: 0.4rem;">Total Operons found: {{ operonCount }}</b-col>
            </b-row>
          </b-container>
        </div>
        <div v-if="selectedRegulationType && selectedOperonSize && selectedCondition1 && selectedCondition2" style="margin-top: 90px; width: 100%">
          <!-- index is the for-loop index used to generate unique keys. It must be passed as variable to a function(index) in order to use the index for the highcharts renderTo -->
          <div v-for="(item, index) in filteredOperonList" :key="index" style="width:100%">
            <tr :id="index" style="height: 600px; max-width: 1200px; margin: 0 auto">
              <!-- <td>Length of List: {{ item.length }} </td> -->
              <!-- unique ID is the for loop index. since it runs exactly the amount of times = the amount of operons, this should fit :)-->
            </tr>
          </div>
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
        graphicTypes:['Operon', 'log2Fold-change heatmap', 'Venn Chart', '3D Scatter plot'],
        showOperon: false,
        show3DScatter: false,
        showVennChart: false,
        showHeatMap: false,
        // condition selections
        selectedCondition1: '',
        selectedCondition2: '',
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
        rowAmount: 0,
        operonCount: 0,
      }
    },
    computed: {
      // condition computing for dropdown selection based
      // on conditions available after the user
      // registered their conditions
      dgeConditions () {
        // conditions for first dropdown
        let conditions1 = new Set();
        // conditions for second dropdown
        let conditions2 = new Set();
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
        // returns a list of sets
        return [conditions1, conditions2]
      },
      conditions2 () {
        let conditions2 = new Set();
        for (let {condition1, condition2} of this.$store.state.currentDGE.conditionPairs) {
          if (condition1 === this.selectedCondition1) {
            conditions2.add(condition2)
          }
        }
        // returning all conditions but the selected on in first dropdown
        return conditions2
      },
      dge () {
        return this.$store.state.currentDGE
      }
    },
    watch: {
      selectedGraphic(){
        if (this.selectedGraphic === 'Operon'){
          this.showHeatMap = false;
          this.showOperon = true;
          this.showVennChart = false;
          this.show3DScatter = false
        }
        else if(this.selectedGraphic === 'log2Fold-change heatmap'){
          this.showHeatMap = true;
          this.showOperon = false;
          this.showVennChart = false;
          this.show3DScatter = false
        }
        else if(this.selectedGraphic === 'Venn Chart'){
          this.showHeatMap = false;
          this.showOperon = false;
          this.showVennChart = true;
          this.show3DScatter = false
        }
        else if(this.selectedGraphic === '3D Scatter plot'){
          this.showHeatMap = false;
          this.showOperon = false;
          this.showVennChart = false;
          this.show3DScatter = true
        }
      },
      selectedCondition1(){
        this.getBARCHARTStoreData();
        this.formatBARCHARTdata();
        this.operonCount= this.filteredOperonList.length;
      },
      selectedCondition2(){
        this.getBARCHARTStoreData();
        this.formatBARCHARTdata();
        this.operonCount= this.filteredOperonList.length;
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
        this.getBARCHARTStoreData();
        this.formatBARCHARTdata();
        this.operonCount= this.filteredOperonList.length;
      },
      selectedOperonSize (){
        // if the user does not provide a size distinct size
        // the size is set so small, that all putative operons pass
        if (this.selectedOperonSize === "open end"){
          this.selectedOperonSize = 2;
        }
        this.getBARCHARTStoreData();
        this.formatBARCHARTdata();
        this.operonCount= this.filteredOperonList.length;
      },
      inputPThreshold (){
        this.getBARCHARTStoreData();
        this.formatBARCHARTdata();
        this.operonCount= this.filteredOperonList.length;
      },
      inputLog2FoldThreshold (){
        this.getBARCHARTStoreData();
        this.formatBARCHARTdata();
        this.operonCount= this.filteredOperonList.length;
      }
    },
    updated(){
      this.$nextTick(()=>{
        this.drawBARCHART();
      })
    },
    methods: {
      getBARCHARTStoreData() {
        // initializing geneDict
        this.geneDict = {};
        // whole dge data
        let dge = this.$store.state.currentDGE;
        // iterating one gene
        for (let originalGeneName of dge.geneNames) {
          // originalGeneName would be Saci_0001.gene for example. The .gene must be discarded, since the
          // gff3-IDs dont have it
          let geneName = originalGeneName.slice(0, -5);
          // one gene's deseq2Analysis
          let deseq2Analysis = dge.getGene(originalGeneName).getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2));
          // if pValue matches user criteria
          if (deseq2Analysis.pValue <= this.inputPThreshold) {
            // getting data based on regulation type and inputLog2FoldThreshold
            if (this.selectedRegulationType === "upregulated") {
              if (deseq2Analysis.log2FoldChange >= this.inputLog2FoldThreshold) {
                this.geneDict[geneName] = {
                  name: geneName,
                  y: Math.round(deseq2Analysis.log2FoldChange*100)/100,
                  pValue: (deseq2Analysis.pValue).toPrecision(2)
                }
              }
            } else if (this.selectedRegulationType === "downregulated") {
              if (deseq2Analysis.log2FoldChange <= this.inputLog2FoldThreshold) {
                this.geneDict[geneName] = {
                  name: geneName,
                  y: Math.round(deseq2Analysis.log2FoldChange*100)/100,
                  pValue: (deseq2Analysis.pValue).toPrecision(2)
                }
              }
            } else if (this.selectedRegulationType === "both") {
              if (Math.abs(deseq2Analysis.log2FoldChange) >= this.inputLog2FoldThreshold) {
                this.geneDict[geneName] = {
                  name: geneName,
                  y: Math.round(deseq2Analysis.log2FoldChange*100)/100,
                  pValue: (deseq2Analysis.pValue).toPrecision(2)
                }
              }
            }
          }
        }
        // screening gff3 data for matching entries
        let gff3 = this.$store.state.gff3Data;
        let deseq2Dummy = this.$store.state.deseq2Type;
        // deseq2Type is object with string value. Getting string only for
        // search in geneDict
        let deseq2Type = Object.values(deseq2Dummy);
        //all gff3-entries for dese2Type
        //console.log(gff3[deseq2Type]);
        // one whole gff3-Entry
        //console.log(gff3[deseq2Type][(gff3[deseq2Type]).length -1]);
        // attributes of one gff3-entry
        //console.log(gff3[deseq2Type][(gff3[deseq2Type]).length -1][(gff3[deseq2Type][(gff3[deseq2Type]).length -1]).length -1]);

        // iterating geneDict via keys
        for (var key in this.geneDict) {
          // iterating gff3 based on deseq2Type
          for (let entry of gff3[deseq2Type]) {
            // checking, if the geneDict's key can be found in the attributes (one long string)
            let attributes = entry[entry.length - 1];
            if (attributes.includes(key)) {
              // if found, getting start, end and strand of the gene's gff3 entry as array
              let start = entry[entry.length - 5];
              let end = entry[entry.length - 4];
              let strand = entry[entry.length - 3];
              this.geneDict[key]['start'] = start;
              this.geneDict[key]['end'] = end;
              this.geneDict[key]['strand'] = strand;
              // checking, if a description can be found
              if (attributes.includes("description")) {
                // splitting attributes of the gene's gff3 entry only at the semicolon
                let attributeArray = attributes.split(";");
                // iterating the attributeArray
                for (let i = 0; i < attributeArray.length; i++) {
                  // at the point of the description, spliting the description=whatIwant at the '='
                  if (attributeArray[i].includes("description")) {
                    let itemArray = attributeArray[i].split("=");
                    let description = itemArray[itemArray.length - 1];
                    this.geneDict[key]['description'] = description;
                  }
                }
              }
            }
          }
        }
        // geneDict: {gene1: {name: gene1, log2fold: log2fold1, pValue: pValue1, start: start1 etc}}
        // console.log(this.geneDict);
      },
      formatBARCHARTdata(){
        // sort by start
        // abandon need to check if element is before a previous one, only
        // gap now relevant
        let values = Object.values(this.geneDict).sort(function(a,b){return a.start - b.start});
        //console.log(values);
        //console.log(sortedValues);
        let operonDummy=[];
        let operonList=[];

        for (let i=0; i<values.length;i++){
          // very first element (first element of first operon)
          if(operonDummy.length === 0 && operonList.length === 0){
            operonDummy.push(values[i]);
          // if we have started
          }else{
              // if next gene starts too far away
            if((parseInt(values[i]['start']) > parseInt(values[i-1]['end'])+this.geneGapSize)){
                // push operon to operonList
                operonList.push(operonDummy);
                // and start new operon
                operonDummy=[];
                operonDummy.push(values[i]);
              } else{
                // value is not too far away
                // add value to existing operon
                operonDummy.push(values[i]);
              }
          }
        }
        //console.log(operonList);
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
        console.log(this.filteredOperonList);
      },
      drawBARCHART(){
        let dataList = this.filteredOperonList;
        for (var index in dataList){
          let plotTitle= "";
          // dataList[index] = one operon with data structure: [{name:..., log2fold:..., pValue:..., start:...end:...,strand:..., description:...},{},{},{}]
          for(let item in dataList[index]){
            if(parseInt(item) === 0){
              plotTitle=plotTitle+dataList[index][item]['name']+" - ";
            }
            else if(parseInt(item) === (dataList[index].length-1)){
              plotTitle=plotTitle+dataList[index][item]['name']
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
              startOnTick: true,
              endOnTick: true,
              showLastLabel: true,
              labels: {
                style: {
                  fontSize: '14px'
                }
              }
            },
            yAxis: {
              max: this.commonMaxValue,
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
              pointFormat:'{point.name}<br/>' +
                'log2Fold: {point.y}<br/>' +
                'pValue: {point.pValue}<br/>' +
                'location: {point.start} - {point.end}<br/>' +
                'strand: {point.strand}',
              followPointer: false
            },
            exporting: {
              buttons: {
                contextButton: {
                  menuItems: ['downloadPNG', 'downloadSVG', 'separator']
                }
              }
            },
            series: [{
              name: 'GENES',
              pointWidth: 40,
              color: 'rgba(223, 83, 83, .5)'
            }]
          };
          //setting data in the chart options (still in for loop, this is done for each series in the dataList one after the other)
          options.series[0].data = dataList[index];

          // making highcharts render to html with id = index with given options
          Highcharts.chart(index, options);
        }
      },
    }
  }




</script>

<style scoped>

</style>
