/*eslint-env node*/
<template>
  <div style="width: 98%; height: 600px; margin-left: 48px; text-align: center; border: 0px solid black">
    <h1>Differential Gene Expression - Visualisations</h1>
    <b-card style="height: 60%; border: 1px solid darkgrey; width: 100%; background: white; border-radius: 15px; -webkit-box-shadow: inset 0 0 40px 15px darkgrey; box-shadow: inset 0 0 40px 15px darkgrey">
      <b-row>
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
        <!-- Questionmark with Metadata Feature help -->
        <b-col sm="2" style="padding-left: 0">
          <span style="cursor: pointer; float: left" @click="showHelp = !showHelp">
            <font-awesome-icon :icon="faQuestionCircle" />
          </span>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-collapse id="helpConditions" v-model="showHelp" class="mt-2">
            <transition name="fade">
              <b-card v-if="showGroup" style="width:80%; margin: auto">
                <small>DGE visualisation type jointly regulated features.</small>
                <br><br>
                Upon provision of the DESeq2 condition pair of interest,
                consequently regulated features are shown as barplot of the log2fold change against a discrete x-axis
                of feature names. For the initial display, regulation type (upregulated, downregulated, both)and feature
                group size as well as log2fold change and adjusted p-value thresholds are preset with the allowance of
                adjustments afterwards.
                <br><br>
                Feature grouping is carried out based on the strand and the start and end positions of features. Thus,
                GenExVis allows to inspect the feature environments. Since co-localization is not mandatory for co-
                regulation, feature groups without functional context might be shown. Yet, for bacterial data, it is
                possible that some of the shown groups can be operons, hence operons are characterized by co-localization.
                <br><br>
                For the selected regulation type, it has to be taken into account, that a feature group shown for upregulation
                or downregulation only might be a group of mixed regulation, which is fully displayed at a selected regulation type
                of 'both' only.
              </b-card>
              <b-card v-if="showUniqueGenes" style="width:80%; margin: auto">
                <small>DGE visualisation type uniquely regulated features.</small>
                <br><br>
                Uniquely regulated features are found based on the adjusted p-value. If a feature has a significant
                p-value in one dataset and in no other dataset, it is considered to be uniquely regualted for this
                respective dataset. If only one condition pair is chosen, all significant features are displayed,
                since there is nothing to compare to.
                <br><br>
                All preselected parameters are adjustable afterwards.
              </b-card>
              <b-card v-if="showHeatMap" style="width:80%; margin: auto">
                <small>DGE visualisation type Heatmaps.</small>
                <br><br>
                Heatmaps are generated for the comparison of feature expression between two
                conditions. The read count is taken as measure of expression. In order to
                generate a heatmap, each feature's condition-specific z-score is calculated
                for the mean of specific read counts against the mean of all read counts
                throughout all conditions for that feature.
                Color coding is:
                <ul>
                  <li>blue: upregulation</li>
                  <li>red: downregulation</li>
                  <li>white: no change</li>
                </ul>
                <br>
                All preselected parameters are adjustable afterwards.
              </b-card>
              <b-card v-else style="width:80%; margin: auto">
                DGE visualisation type selection.
                At this moment, three visualisations are available in GenExVis:
                <ul>
                  <li>Display of jointly regulated features as barplots with supporitve tables.</li>
                  <li>Display of uniquely regulated features as tables.</li>
                  <li>Display of Heatmaps based on z-scores</li>
                </ul>
              </b-card>
            </transition>
          </b-collapse>
        </b-col>
      </b-row>
      <div v-if="showGroup">
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
                  :preselect-first="true"
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
                  :preselect-first="true"
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
              <b-col style="width: 25%;">Putative groups (total): {{ groupCount }}</b-col>
            </b-row>
          </b-container>
        </div>
        <!-- overflow: hidden in blue div works but table not scrollable-->
        <div v-if="selectedRegulationType && selectedOperonSize && selectedCondition1 && selectedCondition2" style="margin-top: 90px; width: 1300px; border: 0px solid blue;">
          <!-- index is the for-loop index used to generate unique keys. Highcharts will render to the unique key, since the charts are generated in a for-loop aswell -->
          <!-- index is also used to get table data-->
          <table style="width: auto; max-width: 100%; display: inline-block; border: 0px solid darkviolet">
            <tr v-for="(item, index) in filteredGroupList" :key="index" style="width: 100%; display: inline-block; border: 1px solid darkgrey; overflow-x: scroll; overflow-y: auto; margin-bottom: 20px; padding: 10px; background: white; border-radius: 10px; -webkit-box-shadow: inset 0 0 40px 20px darkgrey; box-shadow: inset 0 0 40px 20px darkgrey">
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
                            <td v-for="(info, index_k) in gene" :key="index_k" style="border: 1px solid black; background: white; white-space: nowrap">{{ info }}</td>
                          </tr>
                          <tr>
                            <td>
                              <b-form-checkbox v-model="roundedValues" style="margin-top: 10px; white-space: nowrap">
                                Rounded Values
                              </b-form-checkbox>
                            </td>
                            <td>
                              <div :id="index" style="margin-top: 10px;padding: 0.1rem; text-align: left; margin-left: 10px; white-space: nowrap; border: 1px solid #CCC;background: #CCC; text-align: center; cursor: pointer; border-radius: 5px" @click="downloadOperonTable($event)">
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
      </div>
      <div v-if="showUniqueGenes">
        <b-col>
          <b-row style="margin-top: 10px;">
            <!-- Select DESeq2 data to display uniquely regulated genes for -->
            <multiselect
              v-model="selectedConditionPairData"
              :options="uniquelyConditions"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              :show-labels="true"
              :preselect-first="false"
              placeholder="Choose data"
              selected-label="Selected"
              select-label="Click to select"
              deselect-label="Click to remove"
            >
              <template slot="selection" slot-scope="{ values, search, isOpen }">
                <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
              </template>
            </multiselect>
          </b-row>
        </b-col>
        <div v-if="selectedConditionPairData" style="margin-top: 10px">
          <b-row style="margin-top: 10px">
            <b-col>
              <p>Filter by log2fold change </p>
              <multiselect
                v-model="selectedRegulationType"
                :options="regulationDirections"
                :multiple="false"
                :close-on-select="true"
                :clear-on-select="false"
                :preserve-search="true"
                :show-labels="true"
                :preselect-first="true"
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
            <b-col>
              <p>Filter by strand</p>
              <multiselect
                v-model="selectedStrand"
                :options="strandOptions"
                :multiple="false"
                :close-on-select="true"
                :clear-on-select="false"
                :preserve-search="true"
                :show-labels="true"
                :preselect-first="true"
                placeholder="Choose strand"
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
          <div v-if="selectedConditionPairData && selectedRegulationType" style="margin-top: 10px">
            <b-row style="margin-top: 10px">
              <table>
                <tr>
                  <td>
                    <p>Select condition pairs to display uniquely regulated features for</p>
                    <multiselect
                      v-model="selectedConditionPairs"
                      :options="conditionPairs"
                      :multiple="true"
                      :close-on-select="true"
                      :clear-on-select="false"
                      :preserve-search="true"
                      :show-labels="true"
                      :preselect-first="true"
                      placeholder="Choose regulation"
                      selected-label="Selected"
                      select-label="Click to select"
                      deselect-label="Click to remove"
                    >
                      <template slot="selection" slot-scope="{ values, search, isOpen }">
                        <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
                      </template>
                    </multiselect>
                  </td>
                  <td v-if="selectedConditionPairData && selectedRegulationType && selectedConditionPairs">
                    <label style="margin-top: 0.4rem;">p-value threshold:</label>

                    <b-form-input
                      v-model="significantP"
                      type="number"
                      min="0"
                      max="1"
                      step="0.001"
                      style="width: 10rem; margin-right: 0px"
                    />
                  </td>
                  <td v-if="onlyOne && selectedConditionPairData && selectedRegulationType && selectedConditionPairs">
                    Please note: Only one condition pair was chosen. All significant features are shown, not the uniquely regulated features, since there was nothing chosen to compare to.
                  </td>
                </tr>
              </table>
            </b-row>
          </div>
        </div>
        <b-row>
          <!-- START OF TABLE DISPLAY-->
          <div v-if="selectedConditionPairData && selectedRegulationType && selectedConditionPairs" style="margin-top: 90px; width: 1300px; height: 600px; border: 0px solid blue; ">
            <table style="width: 100%; margin-left: 20px; display: inline-block;">
              <!-- one row for each table -->
              <tr v-for="(oneTable, index) in uniqueGenesTableArray" :key="index" style="width: 100%; height: 300px; display: inline-block; border: 1px solid darkgrey; margin-bottom: 20px; padding: 10px; background: white; border-radius: 15px;  -webkit-box-shadow: inset 0 0 30px 10px darkgrey; box-shadow: inset 0 0 30px 10px darkgrey">
                <!-- one td for each table selection menu and table-->
                <td style="vertical-align: top">
                  <h4>{{ uniqueGenesTitles[index] }}</h4>
                  <table>
                    <tr>
                      <td>
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
                    </tr>
                    <tr>
                      <table>
                        <tr>
                          <!-- ROUNDED VALUES AND DOWNLOAD BUTTON-->
                          <td>
                            <b-form-checkbox v-model="roundedValues" style="margin-top: 10px; white-space: nowrap">
                              Rounded Values
                            </b-form-checkbox>
                          </td>
                          <td>
                            <div :id="index" style="margin-top: 10px;padding: 0.1rem; text-align: left; margin-left: 10px; white-space: nowrap; border: 1px solid #CCC;background: #CCC; text-align: center; cursor: pointer; border-radius: 5px" @click="downloadUniqueGenesTable($event)">
                              <font-awesome-icon :icon="faDownload" /> Download table
                            </div>
                          </td>
                        </tr>
                      </table>
                    </tr>
                  </table>
                </td>
                <td>
                  <div v-if="selectedTableOptions.length !== 0" style="margin-right: 2rem">
                    <table style="width: 100%; margin-left: 20px;">
                      <td>
                        <!--This is the table I want scrollable! -->
                        <div class="scrollableTable">
                          <table class="tableWrapper">
                            <tr v-for="(oneRow, index_j) in oneTable" :key="index_j" style="border: 1px solid black; background: white; white-space: nowrap">
                              <td
                                v-for="(info, index_k) in oneRow"
                                :key="index_k"
                                class="tableWrapper"
                                style="border: 1px solid black; white-space: nowrap"
                              >
                                {{ info }}
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                      <td>
                        <!-- -1 for header of table-->
                        total features found: {{ oneTable.length -1 }}
                      </td>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </b-row>
      </div>
      <div v-if="showHeatMap">
        <b-col style="max-width: 50%;">
          <b-row style="margin-top: 20px;">
            <p style="margin-left: 5px"> Chose Normalization </p>
          </b-row>
          <b-row>
            <multiselect
              v-model="selectedNormalization"
              :options="registeredNormalizationMethods"
              :multiple="false"
              :close-on-select="true"
              :clear-on-select="false"
              :preserve-search="true"
              :show-labels="true"
              :preselect-first="true"
              placeholder="Choose normalization"
              selected-label="Selected"
              select-label="Click to select"
              deselect-label="Click to remove"
            >
              <template slot="selection" slot-scope="{ values, search, isOpen }">
                <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
              </template>
            </multiselect>
          </b-row>
        </b-col>
      </div>
    </b-card>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  import {ConditionPair} from '../../utilities/dge'
  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faDownload, faQuestionCircle} from '@fortawesome/free-solid-svg-icons'

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
        // graphic/visualisation type selection
        showHelp: false,
        selectedGraphic: '',
        graphicTypes:['Jointly regulated features', 'Uniquely regulated features', 'Heatmap', '3D Scatter plot'],
        showGroup: false,
        show3DScatter: false,
        showUniqueGenes: false,
        showHeatMap: false,
        // condition selections
        selectedCondition1: null,
        selectedCondition2: null,
        //log2Fold change type SingleSelect
        selectedRegulationType: null,
        regulationDirections: ["both", "downregulated", "upregulated"],
        // rounded values for tables
        roundedValues: true,
        // BARCHART START //
        // selected threshold defaults for barcharts
        inputPThreshold: 0.001,
        inputLog2FoldThreshold: 0.0,
        //operon Size SingleSelect for barcharts
        selectedOperonSize: "",
        operonSizes:["2","3","4","5","6","7","8","open end"],
        // big dictionary of data for the operon BARCHART
        geneDict: null,
        geneGapSize: 300,
        filteredGroupList: null,
        tableList: null,
        groupCount: 0,
        biggestOperon: 0,
        // concerning BARCHART table download
        tableHeaders: null,
        downloadDict: null,
        tableFileName: "",
        tableOptions:["start", "end", "strand", "phase"],
        selectedTableOptions:[],
        tableList2:[],
        // BARCHART END //
        // UNIQUELY START //
        strandOptions:['both', '+', '-'],
        selectedStrand:'',
        selectedConditionPairData:[],
        conditionPairList:[],
        conditionPairs:[],
        selectedConditionPairs: null,
        significantP: 0.001,
        uniqueGenesDataDict:null,
        uniqueGenesTableArray:[],
        uniqueGenesTitles: [],
        onlyOne: false,
        // UNIQUELY END //
        // HEATMAP START //
          selectedNormalization: '',
          selectedConditions: [...this.$store.state.registeredConditions],
          conditionMapping: this.$store.state.currentDGE.seqRuns[this.selectedNormalization],
          plotGeneNames:[],
          plotCategories:[],
          zScoreDict:null,
          heatmapData:[]
      }
    },
    computed: {
      dgeConditions(){
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
        // returns a list of lists
        return [conditions1, conditions2]
      },
      uniquelyConditions(){
        // empty list to return for nice display in multiselect
        let niceDGEconditions=[];
        // iterating conPairs
        for(let {condition1, condition2} of this.$store.state.currentDGE.conditionPairs){
          // formatting string
          let myDisplayString = condition1 +'_vs_'+condition2;
          // adding formatted string to list
          niceDGEconditions.push(myDisplayString);
          // emptying string
          myDisplayString="";
        }
        return niceDGEconditions
      },
      dge(){
        return this.$store.state.currentDGE;
      },
      faDownload(){
        return faDownload
      },
      faQuestionCircle(){
        return faQuestionCircle
      },
        registeredNormalizationMethods () {
            return this.$store.state.currentDGE.normalizationMethods
        },
        registeredConditions () {
            return this.$store.state.registeredConditions
        },
    },
    watch: {
      // concerning all plots
      selectedGraphic(){
        if (this.selectedGraphic === 'Jointly regulated features'){
          this.showHeatMap = false;
          this.showGroup = true;
          this.showUniqueGenes = false;
          this.show3DScatter = false
        }
        else if(this.selectedGraphic === 'Heatmap'){
          this.showHeatMap = true;
          this.showGroup = false;
          this.showUniqueGenes = false;
          this.show3DScatter = false
        }
        else if(this.selectedGraphic === 'Uniquely regulated features'){
          this.showHeatMap = false;
          this.showGroup = false;
          this.showUniqueGenes = true;
          this.show3DScatter = false
        }
        else if(this.selectedGraphic === '3D Scatter plot'){
          this.showHeatMap = false;
          this.showGroup = false;
          this.showUniqueGenes = false;
          this.show3DScatter = true
        } else {
          this.showHeatMap = false;
          this.showGroup = false;
          this.showUniqueGenes = false;
          this.show3DScatter = false;
        }
        // resetting parameter selections
        this.selectedCondition1 = null;
        this.selectedCondition2 = null;
        this.selectedConditionPairData=[];
        this.selectedRegulationType=null;
        this.selectedOperonSize="";
        this.inputPThreshold= 0.001;
        this.inputLog2FoldThreshold= 0.0;
        this.conditionPairList=[];
        this.significantP=0.001;
        this.downloadDict=null;
        this.tableFileName ="";
        this.selectedConditionPairs=null;
        this.uniqueGenesDataDict=null;
        this.uniqueGenesTableArray=[];
        this.uniqueGenesTitles=[];
        this.onlyOne=false;
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
        if(this.showGroup && this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          this.createGroupTableData();
          this.groupCount= this.filteredGroupList.length;
        }
        else if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType){
          this.conditionPairList=[];
          this.conditionPairs=[];
          //list of condition pairs
          // needed to get DESeq2 analyses data for all chosen conditions
          // splitting nice string at underscore. niceString[1] = 'vs'
          for(let niceString of this.selectedConditionPairData){
            let niceStringArray = niceString.split('_');
            let firstCondition = niceStringArray[0];
            let secondCondition = niceStringArray[2];
            // adding each condition pair to conditionPairList
            this.conditionPairList.push(new ConditionPair(firstCondition, secondCondition));
            this.conditionPairs.push(firstCondition+"_"+ secondCondition);

            // correctly adjusting preselection of condition pair to display data for
            if(this.selectedConditionPairData.length>= 1){
              this.selectedConditionPairs=[];
              this.selectedConditionPairs.push(firstCondition+"_"+ secondCondition);
            }
          }
          if(this.conditionPairList.length>1){
            this.uniqueGenesDataDict=null;
            this.uniqueGenesTableArray=[];
            this.uniqueGenesTitles=[];
            this.onlyOne=false;
            this.getUNIQUEGENESStoreData();
            if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType && this.selectedConditionPairs){
              this.createUNIQUEGENESTableData();
            }
          }
          else if(this.conditionPairList.length === 1){
            this.uniqueGenesDataDict=null;
            this.uniqueGenesTableArray=[];
            this.uniqueGenesTitles=[];
            this.onlyOne=true;
            this.getUNIQUEGENESStoreData();
            if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType && this.selectedConditionPairs){
              this.createUNIQUEGENESTableData();
            }
          }
        }
      },
      selectedTableOptions (){
        if(this.showGroup && this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
          this.createGroupTableData();
        }
        else if (this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType && this.selectedConditionPairs){
          this.createUNIQUEGENESTableData();
        }
      },
      roundedValues (){
        if(this.showGroup){
          this.createGroupTableData();
        }
        else if (this.showUniqueGenes){
          this.createUNIQUEGENESTableData();
        }
      },
      // BARCHART ONLY
      inputPThreshold (){
            if(this.showGroup && this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize) {
                this.getBARCHARTStoreData();
                this.formatBARCHARTdata();
                this.createGroupTableData();

                this.groupCount = this.filteredGroupList.length;
            }
        },
      selectedOperonSize (){
        // if the user does not provide a size distinct size
        // the size is set so small, that all putative operons pass
        if (this.selectedOperonSize === "open end"){
          this.selectedOperonSize = 2;
        }
        if(this.showGroup && this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
          //this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          this.createGroupTableData();

          this.groupCount= this.filteredGroupList.length;
        }
      },
      inputLog2FoldThreshold (){
        if(this.showGroup && this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize) {
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          this.createGroupTableData();

          this.groupCount = this.filteredGroupList.length;
        }
      },
      selectedCondition1(){
        if(this.showGroup && this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          this.createGroupTableData();
          this.groupCount= this.filteredGroupList.length;
        }
      },
      selectedCondition2(){
        if(this.showGroup && this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
          this.getBARCHARTStoreData();
          this.formatBARCHARTdata();
          this.createGroupTableData();
          this.groupCount= this.filteredGroupList.length;
        }
      },
      // UNIQUE GENES ONLY
      selectedConditionPairData (){
        if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType){
          this.conditionPairList=[];
          this.conditionPairs=[];

          //list of condition pairs
          // needed to get DESeq2 analyses data for all chosen conditions
          for(let niceString of this.selectedConditionPairData){
            // splitting nice string at underscore. niceString[1] = 'vs'
            let niceStringArray = niceString.split('_');
            let firstCondition = niceStringArray[0];
            let secondCondition = niceStringArray[2];
            // adding each condition pair to conditionPairList
            this.conditionPairList.push(new ConditionPair(firstCondition, secondCondition));
            this.conditionPairs.push(firstCondition+"_"+ secondCondition);

            // correctly adjusting preselection of condition pair to display data for
            if(this.selectedConditionPairData.length>= 1){
              this.selectedConditionPairs=[];
              this.selectedConditionPairs.push(firstCondition+"_"+ secondCondition);
            }
          }
          if(this.conditionPairList.length>=1){
            this.uniqueGenesDataDict=null;
            this.uniqueGenesTableArray=[];
            this.uniqueGenesTitles=[];
            this.onlyOne=false;
            this.getUNIQUEGENESStoreData();
            if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType && this.selectedConditionPairs){
              this.createUNIQUEGENESTableData();
            }
          }
          else if(this.conditionPairList.length === 1){
            this.onlyOne=true;
            this.uniqueGenesDataDict=null;
            this.uniqueGenesTableArray=[];
            this.uniqueGenesTitles=[];
            this.getUNIQUEGENESStoreData();
            if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType && this.selectedConditionPairs){
              this.createUNIQUEGENESTableData();
            }
          }
        }
      },
      selectedConditionPairs (){
      if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType){
          this.conditionPairList=[];
          this.conditionPairs=[];
          //list of condition pairs
          // needed to get DESeq2 analyses data for all chosen conditions
        for(let niceString of this.selectedConditionPairData){
          // splitting nice string at underscore. niceString[1] = 'vs'
          let niceStringArray = niceString.split('_');
          let firstCondition = niceStringArray[0];
          let secondCondition = niceStringArray[2];
          // adding each condition pair to conditionPairList
          this.conditionPairList.push(new ConditionPair(firstCondition, secondCondition));
          this.conditionPairs.push(firstCondition+"_"+ secondCondition);
        }
          if(this.conditionPairList.length>=1){
            this.uniqueGenesDataDict=null;
            this.uniqueGenesTableArray=[];
            this.uniqueGenesTitles=[];
            this.onlyOne=false;
            this.getUNIQUEGENESStoreData();
            if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType && this.selectedConditionPairs){
              this.createUNIQUEGENESTableData();
            }
          }
        }
      },
      conditionPairList (){
        if(this.conditionPairList.length === 1){
          this.onlyOne = true;
        }
        else if (this.conditionPairList.length >1){
          this.onlyOne = false;
        }
      },
      selectedStrand (){
        if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType){
          this.uniqueGenesTableArray = [];
          this.createUNIQUEGENESTableData();
        }
      },
      significantP (){
        if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType){
          this.conditionPairList=[];
          this.conditionPairs=[];
          //list of condition pairs
          // needed to get DESeq2 analyses data for all chosen conditions
          for(let niceString of this.selectedConditionPairData){
              // splitting nice string at underscore. niceString[1] = 'vs'
              let niceStringArray = niceString.split('_');
              let firstCondition = niceStringArray[0];
              let secondCondition = niceStringArray[2];
              // adding each condition pair to conditionPairList
              this.conditionPairList.push(new ConditionPair(firstCondition, secondCondition));
              this.conditionPairs.push(firstCondition+"_"+ secondCondition);
          }
          if(this.conditionPairList.length>=1){
              this.uniqueGenesDataDict=null;
              this.uniqueGenesTableArray=[];
              this.uniqueGenesTitles=[];
              this.onlyOne=false;
              this.getUNIQUEGENESStoreData();
              if(this.showUniqueGenes && this.selectedConditionPairData && this.selectedRegulationType && this.selectedConditionPairs){
                  this.createUNIQUEGENESTableData();
              }
          }
        }
      },
        // HEATMAP
        selectedNormalization (){
          if(this.showHeatMap){
              this.getHeatmapStoreData();
              this.formatHeatmapData();
          }
        }

    },
    updated(){
        // barcharts can be drawn only, if the html div already exists with a unique ID to render to
        // nextTick waits for DOM model changes (html div creating) and executes draw barchart afterwards
      if(this.selectedCondition1 && this.selectedCondition2 && this.selectedRegulationType && this.selectedOperonSize){
        this.$nextTick(()=>{
          this.drawBARCHART();
        })
      }
     /* else if (this.showHeatMap){
          this.$nextTick(()=>{
              // eslint-disable-next-line no-console
              console.log('heatmap draw function');
          })
      }*/
    },
    methods: {
      // START BARCHART//
      getBARCHARTStoreData() {
        // initializing geneDict
        this.geneDict = {};
        // whole dge data
        let theDGE = this.$store.state.currentDGE;
        // whole gff3 data
        let theGFF3 = this.$store.state.gff3Data;
        // deseq2Type is object with string value. Getting string only
        let deseq2Dummy = this.$store.state.deseq2Type;

        let deseq2Type = Object.values(deseq2Dummy);
        // value-Dict for e.g. gene (if DESeq2Type was gene)
        let deseq2_gff3Match = (theGFF3[deseq2Type]);
        var keys = Object.keys(deseq2_gff3Match);
        var geneNames = theDGE.geneNames; //set !
        var uniqueKeys = [];
        for (let key of keys) {
          if (!geneNames.has(key)) {
            uniqueKeys.push(key);
          }
        }
        // removing keys not present in DESeq2 analyses
        keys = keys.filter(function (el) {
          return !uniqueKeys.includes(el);
        });


        //////////////////////////////////////////////////////////////////////////////
        for (let key of keys) {
          let value = deseq2_gff3Match[key];
          //
          // initializing variables for attribute assignment to features
          var attributes = value['attributes'];
          var splitAttributes = attributes.split(';');
          var dummyDict = {};
          var identifier;
          var info;
          // only if DESeq2 analysis exists for a conPair
          if(theDGE.getGene(key).getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2))) {
            // initializing/defining variables for deseq2Analysis of feature
            let deseq2Analysis = theDGE.getGene(key).getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2));
            var geneName = key;
            var start = value['start'];
            var end = value['end'];
            var strand = value['strand'];
            var phase = value['phase'];
            var parent;
            var child;
            var product;
            if ('parent' in value) {
              parent = value['parent'];
            } else {
              parent = 'none';
            }
            if ('child' in value) {
              child = value['child'];
            } else {
              child = 'none';
            }
            if ('product' in value) {
              product = value['product'];
            } else {
              product = 'unknown';
            }
            // if pValue matches user criteria
            if (deseq2Analysis.pAdj <= this.inputPThreshold) {
              // getting data based on regulation type and inputLog2FoldThreshold
              if (this.selectedRegulationType === "upregulated") {
                if (deseq2Analysis.log2FoldChange >= this.inputLog2FoldThreshold) {
                  this.geneDict[geneName] = {
                    name: geneName,
                    y: Math.round(deseq2Analysis.log2FoldChange * 100) / 100,
                    pAdjrounded: (deseq2Analysis.pAdj).toExponential(2),
                    log2fold: (deseq2Analysis.log2FoldChange),
                    pValue: (deseq2Analysis.pValue),
                    pAdj: (deseq2Analysis.pAdj),
                    baseMean: (deseq2Analysis.baseMean),
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
                  for (let attribute of splitAttributes) {
                    let splitAttribute = attribute.split('=');
                    identifier = splitAttribute[0];
                    // adding identifier to table options
                    if (!this.tableOptions.includes(identifier)) {
                      this.tableOptions.push(identifier);
                    }
                    info = splitAttribute[1];
                    dummyDict[identifier] = info;
                  }
                  this.geneDict[geneName] = Object.assign({}, this.geneDict[geneName], dummyDict);
                }
              } else if (this.selectedRegulationType === "downregulated") {
                if (deseq2Analysis.log2FoldChange <= this.inputLog2FoldThreshold) {
                  this.geneDict[geneName] = {
                    name: geneName,
                    y: Math.round(deseq2Analysis.log2FoldChange * 100) / 100,
                    pAdjrounded: (deseq2Analysis.pAdj).toExponential(2),
                    log2fold: (deseq2Analysis.log2FoldChange),
                    pValue: (deseq2Analysis.pValue),
                    pAdj: (deseq2Analysis.pAdj),
                    baseMean: (deseq2Analysis.baseMean),
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
                  for (let attribute of splitAttributes) {
                    let splitAttribute = attribute.split('=');
                    identifier = splitAttribute[0];
                    // adding identifier to table options
                    if (!this.tableOptions.includes(identifier)) {
                      this.tableOptions.push(identifier);
                    }
                    info = splitAttribute[1];
                    dummyDict[identifier] = info;
                  }
                  this.geneDict[geneName] = Object.assign({}, this.geneDict[geneName], dummyDict);
                }
              } else if (this.selectedRegulationType === "both") {
                if (Math.abs(deseq2Analysis.log2FoldChange) >= this.inputLog2FoldThreshold) {
                  this.geneDict[geneName] = {
                    name: geneName,
                    y: Math.round(deseq2Analysis.log2FoldChange * 100) / 100,
                    pAdjrounded: (deseq2Analysis.pAdj).toExponential(2),
                    log2fold: (deseq2Analysis.log2FoldChange),
                    pValue: (deseq2Analysis.pValue),
                    pAdj: (deseq2Analysis.pAdj),
                    baseMean: (deseq2Analysis.baseMean),
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
                  for (let attribute of splitAttributes) {
                    let splitAttribute = attribute.split('=');
                    identifier = splitAttribute[0];
                    // adding identifier to table options, but not ID, since ID is written to the table always
                    // as first column with tag "feature"
                    if (!this.tableOptions.includes(identifier) && identifier !== 'ID') {
                      this.tableOptions.push(identifier);
                    }
                    info = splitAttribute[1];
                    dummyDict[identifier] = info;
                  }
                  this.geneDict[geneName] = Object.assign({}, this.geneDict[geneName], dummyDict);
                }
              }
            }
          }
        }
        // adding DESeq2 options to selection menu
        if (!this.tableOptions.includes('log2fold', 'pAdj', 'baseMean', 'lfcSE', 'pValue', 'stat')) {
          this.tableOptions.unshift('log2fold', 'pAdj', 'baseMean', 'lfcSE', 'pValue', 'stat');
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
        this.filteredGroupList=[];
        for (let i=0; i< operonList.length; i++){
        if (operonList[i].length >= parseInt(this.selectedOperonSize)) {
            this.filteredGroupList.push(operonList[i]);
          }
        }
      },
      drawBARCHART(){
        let dataList = this.filteredGroupList;
        for (var index in dataList){
          let pointWidth = 30-(dataList[index].length);
          let plotTitle= "";
          // dataList[index] = one operon with data structure: [{name:..., log2fold:..., pValue:..., start:...end:...,strand:..., description:..., etc},{},{},{}]
          for(let item in dataList[index]){
            if(parseInt(item) === 0){
              let myStart = this.thousandSeparator(dataList[index][item]['start']);
              var myEnd= this.thousandSeparator(dataList[index][item]['end']);
              var myStrand = dataList[index][item]['strand'];
              plotTitle=plotTitle+'Pos. '+myStart+" - ";
              this.tableFileName =dataList[index][item]['start'] + '_';
            }
            else if(parseInt(item) === (dataList[index].length-1)){
              plotTitle=plotTitle+'Pos. '+ myEnd + ' ( ' + myStrand + ' )';
              this.tableFileName = this.tableFileName + dataList[index][item]['end']+ '_';
            }
          }
          this.tableFileName = this.tableFileName + this.selectedCondition1 + '_vs_' + this.selectedCondition2;
          // chart Options
          let options = {
            chart: {
              type: 'column',
              zoomType: 'xy',
              height: 'auto',
              borderColor: '#000',
              borderWidth: 1
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
              plotLines: [{
                color: 'rgb(0,0,0)',
                value:0,
                width: 1,
                zIndex:5
              }],
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
                  color: 'rgba(223, 83, 83, .9)'
                }, {
                // upregulated
                  color: 'rgba(16, 16, 238, .9)' // values from zero (including)
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
      createGroupTableData(){
        let oneTable=[];
        this.tableList2 = [];
        if(this.selectedTableOptions.length>0) {
          this.downloadDict={};
          for (let i = 0; i < this.filteredGroupList.length; i++) {
            oneTable = [];
            // adding selected headers as deepcopy due to call by reference of JS
            // and infinite update hook with selectedOptionsWatcher if unshifting 'Feature'
            let tableHeaders = JSON.parse(JSON.stringify(this.selectedTableOptions));
            tableHeaders.unshift('Feature');
            oneTable.push(tableHeaders);
            //let downloadHeaders = this.selectedTableOptions;
            //oneDownloadTable.push(downloadHeaders);
            // adding row info to tables
            // let oneTableData = this.filteredGroupList[i];
            let oneTableData = JSON.parse(JSON.stringify(this.filteredGroupList[i]));
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
                    value = value.toExponential(4);
                    oneTableRow.push(value);
                    // other values & not rounded values
                  }
                /*  else if(identifier === 'start' || identifier === 'end'){
                    let value = this.thousandSeparator(oneTableData[k][identifier]);
                    oneTableRow.push(value);
                  }*/
                  else {
                    oneTableRow.push(oneTableData[k][identifier]);
                  }
                }
                if(! oneTableRow.includes(featureID)){
                  oneTableRow.unshift(featureID);
                }
              }
              // adding row to table
              oneTable.push(oneTableRow);
            }
            // Array of arrays. 1st level inner array = one Table; 2nd level inner array = 1 table row

            this.tableList2.push(oneTable);
            this.downloadDict[i] = oneTable;
          }
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
        downloadFile(csvContent, this.tableFileName+'.csv')
      },
      // END BARCHART //
      // START UNIQUE GENES //
      getUNIQUEGENESStoreData(){
        // whole dge data
        let theDGE= this.$store.state.currentDGE;
        // list of sets. one set = id list of significant genes for one condition pair
        let significantGenes = {};
        let pooledSignificantGenes=[];
        for(let conditionPair of this.conditionPairList){
          // converting original data type set to array for use of array.filter etc to get unique genes
          let onePairGenes = Array.from(theDGE.getNamesOfSignificantGenesFromDESeq2(this.significantP,conditionPair.condition1, conditionPair.condition2,true));
          pooledSignificantGenes.push(onePairGenes);
          significantGenes[conditionPair.condition1 + '_'+ conditionPair.condition2]=onePairGenes;
          let titleString = conditionPair.condition1 + '_'+ conditionPair.condition2;
          this.uniqueGenesTitles.push(titleString);
        }
        // long list of all significant genes of all condition pairs
        pooledSignificantGenes= pooledSignificantGenes.flat();
        // dict for key = cond Pair & value = list of feature IDs
        let uniquelySignificantGenes={};

        //key = condition pair, value = list of IDs of significant genes for condition pair

        for (const [key,value] of Object.entries(significantGenes)){
          // deepcopy
          let pooledDummy = JSON.parse(JSON.stringify(pooledSignificantGenes));
          // iterating single IDs to splice them once from the list
          for(let id of value){
            let index = pooledDummy.indexOf(id);
            pooledDummy.splice(index,1);
          }
          // pooledDummy now contains all elements but the value elements
          // now filtering for unique IDs in the value
          let uniqueValues = [];
          for (let id of value){
            // if the pooledDummy does not include the id, it is unique
            if(!pooledDummy.includes(id)){
              uniqueValues.push(id);
            }
          }
          uniquelySignificantGenes[key]=uniqueValues;
        }

        /////////////////////////////////////////////////////////////////
        // PROOF, that only first occurence is spliced //
        /*let myTestlist = [1,2,3,4,5,4,3,2,1];
        let myTestArray = [1,2,4];
        for (let el of myTestArray){
          let index = myTestlist.indexOf(el);
          myTestlist.splice(index,1);
        }
        /////////////////////////////////////////////////////////////////

        /////////////////////////////////////////////////////////////////
         // vice versa check, if value removed from untreated vs clindamycin appears in the other cond pair's value
         /*if(significantGenes['Untreated_Erythromycin'].includes('cds-NP_414549.1')){
         }*/
        /////////////////////////////////////////////////////////////////

        // whole gff3 data
        let theGFF3 = this.$store.state.gff3Data;
        // deseq2Type is object with string value. Getting string only
        let deseq2Dummy = this.$store.state.deseq2Type;
        let deseq2Type = Object.values(deseq2Dummy);
        // value-Dict for e.g. gene (if DESeq2Type was gene)
        let deseq2_gff3Match = (theGFF3[deseq2Type]);

        // dict of dicts. 1st level: keys = cond pairs; 2nd level: key= feature id, value = data dict for that feature
        // structure: uniqueGenesDataDict={condPair1:{id1:{log2fold:2, pValue: 1, pAdj ...., start: 100, end: 642, strand:....}, id2:{...},....}, condPair2:{},...}
        this.uniqueGenesDataDict={};
        let name;
        let log2fold;
        let pValue;
        let pAdj;
        let baseMean;
        let lfcSE;
        let stat;
        let gff3Data;
        let start;
        let end;
        let strand;
        let phase;
        let parent;
        let child;
        let product;
        for(const [key,value] of Object.entries(uniquelySignificantGenes)){
          let keyArray=key.split('_');
          let cond1 = keyArray[0];
          let cond2 = keyArray[1];
          this.uniqueGenesDataDict[key]={};
          for(let id of value){
            // getting deseq2 analysis for feature and current loop conditions
            if(theDGE.getGene(id).getDESEQ2Analysis((new ConditionPair(cond1,cond2)))){
              // eslint-disable-next-line
              var deseq2Analysis = theDGE.getGene(id).getDESEQ2Analysis(new ConditionPair(cond1, cond2));
            }
            //////////////////////////////////////////////////////
            if (this.selectedRegulationType === "upregulated") {
              if (deseq2Analysis.log2FoldChange >= this.inputLog2FoldThreshold) {
                name = id;
                log2fold= (deseq2Analysis.log2FoldChange);
                pValue= (deseq2Analysis.pValue);
                pAdj= (deseq2Analysis.pAdj);
                baseMean=(deseq2Analysis.baseMean);
                lfcSE=(deseq2Analysis.lfcSE);
                stat = (deseq2Analysis.stat);

                if(deseq2_gff3Match[id]){
                  gff3Data=deseq2_gff3Match[id];
                  let attributes = gff3Data['attributes'];
                  let splitAttributes = attributes.split(';');
                  var dummyDict={};
                  for (let attribute of splitAttributes){
                    let splitAttribute = attribute.split('=');
                    let identifier = splitAttribute[0];
                    // adding attribute identifiers to the choosable table options without the option to choose the ID, since the feature ID will always be written in the 1st column of the tables
                    if(!this.tableOptions.includes(identifier) && identifier !== 'ID'){
                      this.tableOptions.push(identifier);
                    }
                    let info = splitAttribute[1];
                    if(!dummyDict[identifier]){
                      dummyDict[identifier] = info;
                    }
                  }
                  // initializing gff3 data variables
                  start = gff3Data['start'];
                  end = gff3Data['end'];
                  strand=gff3Data['strand'];
                  phase = gff3Data['phase'];

                  if('parent' in gff3Data){
                    parent = gff3Data['parent'];
                  }else{
                    parent = 'none';
                  }
                  if('child' in gff3Data){
                    child=gff3Data['child'];
                  }else{
                    child='none';
                  }
                  if('product' in gff3Data){
                    product = gff3Data['product'];
                  }else{
                    product = 'unknown';
                  }
                }
                // adding DESeq2 and gff3 info to uniqueGenesDataDict as own inner dict
                if(!this.uniqueGenesDataDict[key][id]){
                  this.uniqueGenesDataDict[key][id]={start:start, end:end, strand:strand, phase:phase, Parent:parent, child:child, product: product, name: name, log2fold: log2fold, pValue: pValue, pAdj: pAdj, baseMean: baseMean, lfcSE: lfcSE, stat:stat};
                }
                this.uniqueGenesDataDict[key][id]=Object.assign({}, this.uniqueGenesDataDict[key][id], dummyDict);
              }
            }
            else if (this.selectedRegulationType === "downregulated") {
              if (deseq2Analysis.log2FoldChange <= this.inputLog2FoldThreshold) {
                name = id;
                log2fold= (deseq2Analysis.log2FoldChange);
                pValue= (deseq2Analysis.pValue);
                pAdj= (deseq2Analysis.pAdj);
                baseMean=(deseq2Analysis.baseMean);
                lfcSE=(deseq2Analysis.lfcSE);
                stat = (deseq2Analysis.stat);

                if(deseq2_gff3Match[id]){
                  gff3Data=deseq2_gff3Match[id];
                  let attributes = gff3Data['attributes'];
                  let splitAttributes = attributes.split(';');
                  // eslint-disable-next-line no-redeclare
                  var dummyDict={};
                  for (let attribute of splitAttributes){
                    let splitAttribute = attribute.split('=');
                    let identifier = splitAttribute[0];
                    // adding attribute identifiers to the choosable table options
                    if(!this.tableOptions.includes(identifier) && identifier !== 'ID'){
                      this.tableOptions.push(identifier);
                    }
                    let info = splitAttribute[1];
                    if(!dummyDict[identifier]){
                      dummyDict[identifier] = info;
                    }
                  }
                  // initializing gff3 data variables
                   start = gff3Data['start'];
                   end = gff3Data['end'];
                   strand=gff3Data['strand'];
                   phase = gff3Data['phase'];

                  if('parent' in gff3Data){
                    parent = gff3Data['parent'];
                  }else{
                    parent = 'none';
                  }
                  if('child' in gff3Data){
                    child=gff3Data['child'];
                  }else{
                    child='none';
                  }
                  if('product' in gff3Data){
                    product = gff3Data['product'];
                  }else{
                    product = 'unknown';
                  }
                }
                // adding DESeq2 and gff3 info to uniqueGenesDataDict as own inner dict
                if(!this.uniqueGenesDataDict[key][id]){
                  this.uniqueGenesDataDict[key][id]={start:start, end:end, strand:strand, phase:phase, parent:parent, child:child, product: product, name: name, log2fold: log2fold, pValue: pValue, pAdj: pAdj, baseMean: baseMean, lfcSE: lfcSE, stat:stat};
                }
                this.uniqueGenesDataDict[key][id]=Object.assign({}, this.uniqueGenesDataDict[key][id], dummyDict);
              }
            }
            else if (this.selectedRegulationType === "both") {
              if (Math.abs(deseq2Analysis.log2FoldChange) >= this.inputLog2FoldThreshold) {
                name = id;
                log2fold= (deseq2Analysis.log2FoldChange);
                pValue= (deseq2Analysis.pValue);
                pAdj= (deseq2Analysis.pAdj);
                baseMean=(deseq2Analysis.baseMean);
                lfcSE=(deseq2Analysis.lfcSE);
                stat = (deseq2Analysis.stat);

                if(deseq2_gff3Match[id]){
                  gff3Data=deseq2_gff3Match[id];
                  let attributes = gff3Data['attributes'];
                  let splitAttributes = attributes.split(';');
                  // eslint-disable-next-line no-redeclare
                  var dummyDict={};
                  for (let attribute of splitAttributes){
                    let splitAttribute = attribute.split('=');
                    let identifier = splitAttribute[0];
                    // adding attribute identifiers to the choosable table options
                    if(!this.tableOptions.includes(identifier) && identifier !== 'ID'){
                      this.tableOptions.push(identifier);
                    }
                    let info = splitAttribute[1];
                    if(!dummyDict[identifier]){
                      dummyDict[identifier] = info;
                    }
                  }

                  // initializing gff3 data variables
                   start = gff3Data['start'];
                   end = gff3Data['end'];
                   strand=gff3Data['strand'];
                   phase = gff3Data['phase'];

                  if('parent' in gff3Data){
                    parent = gff3Data['parent'];
                  }else{
                    parent = 'none';
                  }
                  if('child' in gff3Data){
                    child=gff3Data['child'];
                  }else{
                    child='none';
                  }
                  if('product' in gff3Data){
                    product = gff3Data['product'];
                  }else{
                    product = 'unknown';
                  }
                }
                // adding DESeq2 and gff3 info to uniqueGenesDataDict as own inner dict
                if(!this.uniqueGenesDataDict[key][id]){
                  this.uniqueGenesDataDict[key][id]={start:start, end:end, strand:strand, phase:phase, parent:parent, child:child, product: product, name: name, log2fold: log2fold, pValue: pValue, pAdj: pAdj, baseMean: baseMean, lfcSE: lfcSE, stat:stat};
                }
                this.uniqueGenesDataDict[key][id]=Object.assign({}, this.uniqueGenesDataDict[key][id], dummyDict);
              }
            }
          }
        }
        // adding statistical data options to choosable table options
        if(!this.tableOptions.includes('log2fold' , 'pAdj', 'baseMean' , 'lfcSE' , 'pValue' , 'stat')){
          this.tableOptions.unshift('log2fold' , 'pAdj', 'baseMean' , 'lfcSE' , 'pValue' , 'stat');
        }
      },
      createUNIQUEGENESTableData(){
        this.uniqueGenesTableArray=[];
        let tableCounter = 0;
        this.downloadDict={};
         for(const [key,value] of Object.entries(this.uniqueGenesDataDict)){
           if(this.selectedConditionPairs.includes(key)){
             // list of rows for one table
             let oneTableArray=[];
             // adding table headers
             let tableHeaders = JSON.parse(JSON.stringify(this.selectedTableOptions));
             tableHeaders.unshift('Feature');
             oneTableArray.push(tableHeaders);
             // eslint-disable-next-line no-unused-vars
             for(const [innerKey,innerValue] of Object.entries(value)){
               let oneTableRow=[];
               if(this.selectedStrand === 'both'){
                 for(let option of this.selectedTableOptions){
                   if (this.roundedValues && (option === 'log2fold' || option === 'stat' || option === 'baseMean' || option === 'lfcSE')){
                     let value = innerValue[option];
                     value = Math.round(value*100)/100;
                     oneTableRow.push(value);
                     // rounded p Values
                   } else if (this.roundedValues && (option === 'pAdj' || option === 'pValue')) {
                     let value = innerValue[option];
                     value = value.toExponential(4);
                     oneTableRow.push(value);
                     // other values & not rounded values
                   }
                   else {
                     oneTableRow.push(innerValue[option]);
                   }
                 } // end of for
               } else {
                 if(innerValue['strand'] === this.selectedStrand){
                   for(let option of this.selectedTableOptions){
                     if (this.roundedValues && (option === 'log2fold' || option === 'stat' || option === 'baseMean' || option === 'lfcSE')){
                       let value = innerValue[option];
                       value = Math.round(value*100)/100;
                       oneTableRow.push(value);
                       // rounded p Values
                     } else if (this.roundedValues && (option === 'pAdj' || option === 'pValue')) {
                       let value = innerValue[option];
                       value = value.toExponential(4);
                       oneTableRow.push(value);
                       // other values & not rounded values
                     }
                     else {
                       oneTableRow.push(innerValue[option]);
                     }
                   } // end of for
                 } // end of if
               }
               oneTableRow.unshift(innerValue['ID']);
               if(oneTableRow.length>1){
                 // adding row to table
                 oneTableArray.push(oneTableRow);
               }
             }
             // adding table to list of all tables
             this.uniqueGenesTableArray.push(oneTableArray);
             this.downloadDict[tableCounter]=oneTableArray;
             tableCounter = tableCounter +1;
           }
         }
      },
      downloadUniqueGenesTable: function(event) {
        // getting elements ID in order to download one table only
        let targetID= event.currentTarget.id;
        this.tableFileName = 'uniquelyRegulated_'+ this.uniqueGenesTitles[targetID];
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
        downloadFile(csvContent, this.tableFileName+'.csv')
      },
      // END UNIQUE GENES //
      thousandSeparator(number){
        return parseFloat(number).toLocaleString('en-us');
      },
        mean(numbers) {
            let total = 0, i;
            for (i = 0; i < numbers.length; i += 1) {
                total += numbers[i];
            }
            return total / numbers.length;
        },
        sum(numbers) {
            let total = 0, i;
            for (i = 0; i < numbers.length; i += 1) {
                total += numbers[i];
            }
            return total;
        },
        variance: function(array) {
            let mean = this.mean(array);
            return this.mean(array.map(function(num) {
                return Math.pow(num - mean, 2);
            }));
        },


        // HEATMAPS
        getHeatmapStoreData(){
          // read counts for genes with condition
          var conditionDict={};
          // all read counts for gene throughout all conditions
          var geneCountDict={};
          var geneDict={};
          let seqRunNamesMap = {};
          let seqRunNames = [];
          let seqRunIndex = 0;
          for (let cond of this.selectedConditions) {
              for (let [seqRun, seqRunCond] of Object.entries(this.$store.state.currentDGE.seqRuns[this.selectedNormalization])) {
                  if (seqRunCond === cond) {
                      seqRunNames.push(seqRun);
                      seqRunNamesMap[seqRun] = seqRunIndex++
                  }
              }
            }
            let geneNames = Array.from(this.$store.state.currentDGE.geneNames).sort();
            let geneNamesMapping = {};
            for (let [index, geneName] of geneNames.entries()) {
                geneNamesMapping[geneName] = index
            }

            let countData = (this.selectedNormalization === 'unnormalized')
                ? this.$store.state.currentDGE.getAllUnnormalizedCountData()
                : this.$store.state.currentDGE.getAllDeseq2CountData();

            for (let [condition, genes] of Object.entries(countData)) {
                if (this.selectedConditions.indexOf(condition) === -1) {
                    continue
                }else{
                    if(!this.plotCategories.includes(condition)){
                        this.plotCategories.push(condition);
                    }
                    // dict sorted by treatments at top level
                    conditionDict[condition]={};
                    for(let [key,value] of Object.entries(genes)){
                        conditionDict[condition][key]={};
                        // geneDict contains counts for genes throughout all conditions
                        if(!geneCountDict[key]){
                            geneCountDict[key]=[];
                        }
                        let dummyArray=[];
                        // eslint-disable-next-line no-unused-vars
                        for(let [innerKey, innerValue] of Object.entries(value)){
                            dummyArray.push(innerValue);
                            // adding count for gene
                            geneCountDict[key].push(innerValue);
                        }
                        let dummyMean= this.mean(dummyArray);
                        let sampleN = dummyArray.length;
                        let sampleMean = Math.round(dummyMean*100)/100;
                        // dummyArray.push(myMean);
                        // adding mean and number of initial values the mean was calculated of for specific counts at right gene and condition
                        conditionDict[condition][key]={'sampleMean':sampleMean,'sampleN': sampleN} ;
                    }
                    // calculating mean and sigma for genes throught all conditions
                    for(let[key,value] of Object.entries(geneCountDict)){
                        if(!geneDict[key]){
                            geneDict[key]={};
                        }
                        let populationMean = Math.round(this.mean(value)*100)/100;
                        let populationVariance = this.variance(value);
                        let sigma = Math.round((Math.sqrt(populationVariance))*100)/100;
                        geneDict[key]={'populationMean': populationMean, 'sigma': sigma};
                    }
                    // Z-score will be: (sampleMean - populationMean)/(sigma-sqrt(sampleN))
                    // options.xAxis.categories = seqRunNames;
                    // options.yAxis.categories = geneNames;
                    var zScoreDict={};
                    for(let [key,value] of Object.entries(conditionDict)){
                        if(!zScoreDict[key]){
                            zScoreDict[key]={};
                        }
                        for (let [innerKey, innerValue] of Object.entries(value)){
                            if(!zScoreDict[key][innerKey]){
                                zScoreDict[key][innerKey]={};
                            }
                            let zScore = (innerValue['sampleMean'] - geneDict[innerKey]['populationMean'])/(geneDict[innerKey]['sigma']/innerValue['sampleN'])
                            zScoreDict[key][innerKey]=zScore;
                            if(!this.plotGeneNames.includes(innerKey)){
                                this.plotGeneNames.push(innerKey);
                            }
                        }
                    }
                }
            }
            this.zScoreDict=zScoreDict;
            // console.log(this.plotCategories);
        },
        // formatting plotData; axis are formatted already; needed format of z-scores to correclty plot is:
        // array=[cds1_con1, cds1_con2, cds1_con3, cds2_con1, cds2_con2, cds2_con3, etc] -> for correct assignment to axis labels, which are conditions (y) and feature IDs(x)
        formatHeatmapData(){
          let heatmapDataDict={};
            // eslint-disable-next-line no-unused-vars
          for(let [key,value] of Object.entries(this.zScoreDict)){
              for(let[innerKey, innerValue] of Object.entries(value)){
                  if(!heatmapDataDict[innerKey]){
                      // initialization
                      heatmapDataDict[innerKey]=[];
                  }
                  heatmapDataDict[innerKey].push(innerValue);
              }
          }
            // eslint-disable-next-line no-unused-vars
          for(let[key,value] of Object.entries(heatmapDataDict)){
              for(let innerValue of Object.values(value)){
                  this.heatmapData.push(innerValue);
              }
          }
            console.log(this.heatmapData);
        }
    }
  }

</script>

<style scoped>

  .scrollableTable {
    width: 800px;
    height: 270px;
    overflow-x: auto;
    overflow-y: scroll;
  }

  .tableWrapper {
    border-collapse: collapse;
  }

</style>
