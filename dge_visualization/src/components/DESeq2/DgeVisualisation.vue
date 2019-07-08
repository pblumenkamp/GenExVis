<template>
  <div style="width: 90%; height: 600px; margin-left: 48px; text-align: center">
    <h1>Differential Gene Expression - Visualisations</h1>
    <div>
      <!-- Dropdown to selecte the first condition -->
      <b-form-select v-model="selectedCondition1" style="width: auto" @change="selectedCondition2 = ''">
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
        style="width: auto"
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
    </div>
    <div v-if="selectedCondition1 && selectedCondition2" style="margin-top: 10px">
      <h4>Chose chart specifications</h4>
      <b-card style="height: 50%; border: 1px solid lightslategray">
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
      </b-card>
      <!-- P-VALUE and LOG2FOLD THRESHOLD INPUTS -->
      <div v-if="selectedRegulationType && selectedOperonSize" style="margin-top: 10px">
        <hr>
        <b-container fluid border="1">
          <b-row>
            <label style="margin-top: 0.4rem;">p-value threshold:</label>
            <b-col>
              <b-form-input
                v-model="inputPThreshold"
                type="number"
                min="0"
                max="1"
                step="0.001"
                style="width: 10rem;"
                @change="updatePThreshold"
              />
            </b-col>
            <label style="margin-top: 0.4rem;">log2Fold Change threshold:</label>
            <b-col>
              <b-form-input
                v-model="inputLog2FoldThreshold"
                type="number"
                min="0"
                max="1"
                step="0.1"
                style="width: 10rem;"
                @change="updateLog2foldThreshold"
              />
            </b-col>
          </b-row>
        </b-container>
      </div>
    </div>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'

  export default {
    name: 'DgeVisualisation',
    components: {
      Multiselect
    },
    data () {
      return {
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
        operonSizes:["2","3","4","5","6","7","8","open end"]
      }
    },
    computed: {
      // deseq2Type from store to correctly get infos from gff3-data
      deseq2Type (){
        return this.$store.state.deseq2Type;
      },
      gff3data (){
        return this.$store.state.gff3data;
      },
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
      }
    },
    watch: {
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
      }
    },
    methods:{
      drawData(){
        return "hello"
      },
      updatePThreshold () {
        this.drawData()
      },
      updateLog2foldThreshold () {
        this.drawData()
      }
    }
  }


</script>

<style scoped>

</style>
