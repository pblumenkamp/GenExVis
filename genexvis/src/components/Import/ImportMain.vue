<template>
  <div>
    <h1 class="header">Import Expression Data</h1>
    <b-card style="width: 90%; margin: auto;">
      <small style="text-align: justify">
        On this page, you can upload your differential expression data. In the current version, this is a three-step process. You need to register all conditions,
        import your count table, and import all DESeq2 results. This procedure happens wholly offline only in your web browser. No data will be saved for future uses
        or sent to any kind of server.
        <!--
        <span v-if="longHelp_overview">
          <br><br>
          First, you should register all the conditions you are using in your experiment ("{{ labels["registerConditionsTab"] }}"). GenExVis tries to assign the correct
          condition automatically to each sample if the condition name can be found inside of the sample name. After registering all conditions, you can start to import
          your count tables (e.g., created with featureCounts) and DESeq2 results.
          <br><br>
          For correctly importing your count table, it must only fulfill two criteria. It must be tab-separated and must contain one column with the feature names
          (e.g., gene names) and at least one sample column. If all condition names are unambiguous, GenExVis will assign the condition automatically to a sample column.
          The only information which must be selected manually is the type of normalization used ("Normalization method") and the column containing the feature names
          (select "-- Gene name --") for this column.
          <br><br>
          For a more in-depth and statistically correct differential expression analysis, GenExVis also needs DESeq2 result files. These files can be created by using this R command:

          <div style="text-align: center; padding: 0.5rem; background-color: #eee; margin-top: 1rem; margin-bottom: 1rem">
            <span style="font-family: 'Courier New', 'Roboto Mono', monospace">
              write.table(res, file = 'filepath.tsv', sep = "\t", row.names = TRUE, col.names = NA)
            </span>
          </div>

          In the current version of GenExVis, the DESeq2 result file must be tab-separated and must contain exactly 7 columns (feature name, base mean, log2 fold change, log2 fold change standard error [lfcSE], Wald statistic [stat], Wald test p-value [pvalue], and Benjamini-Hochberg adjusted p-value [padj]).
          <a href="#" style="white-space: nowrap" @click="longHelp_overview = !longHelp_overview">Read less...</a>
        </span>
        <div v-else>
          <a href="#" style="white-space: nowrap" @click="longHelp_overview = !longHelp_overview">Read more...</a>
        </div>
        -->
      </small>
    </b-card>
    <div style="width:90%; margin: auto;" role="tablist">
      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-btn
            v-b-toggle="'accordion_conditions'"
            block
            href="#"
            variant="secondary"
          >
            1. {{ labels["registerConditionsTab"] }}
          </b-btn>
        </b-card-header>
        <b-collapse
          id="accordion_conditions"
          visible
          accordion="my-accordion"
          role="tabpanel"
          style="padding-bottom: 1rem"
        >
          <b-card-body>
            <b-card style="width:80%; margin: auto auto 1rem;">
              <small>Please register all the conditions you want to use. Try to use unambiguous names, which can also be found inside of the sample names, to benefit from autocomplete in the next steps.
                <span v-if="longHelp_condition">
                  <br>
                  There are three ways to register the conditions:
                  <ul>
                    <li>One at a time via the input field.</li>
                    <li>As a comma-separated list via the input field.</li>
                    <li>As a file via Browse button. The file contains just the conditions, one in each line.</li>
                  </ul>
                  <a href="#" style="white-space: nowrap" @click="longHelp_condition = !longHelp_condition">Read less...</a>
                </span>
                <span v-else>
                  <a href="#" style="white-space: nowrap" @click="longHelp_condition = !longHelp_condition">Read more...</a>
                </span>
              </small>
            </b-card>
            <b-container fluid class="mb-1">
              <b-row>
                <b-col sm="4">
                  <label for="conditionName" style="margin-top: 0.4rem; float: right">Register condition:</label>
                </b-col>
                <b-col sm="5">
                  <b-input-group>
                    <b-form-input
                      id="conditionName"
                      v-model="conditionName"
                      :state="validCondition"
                      type="text"
                      placeholder="Condition name"
                      style="width: auto"
                      @input="validCondition = null"
                      @keydown.enter.native="registerCondition"
                    />
                    <b-input-group-append>
                      <b-button @click="registerCondition">+</b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-col>
                <b-col sm="1">
                  <label class="btn btn-secondary btn-file" style="cursor: pointer">
                    Browse... <input id='condition_input' ref='condition_input' type="file" style="display: none;" @input="readConditionFile">
                  </label>
                </b-col>
              </b-row>
              <b-row v-if="validCondition != null" style="margin-top: 0.1rem">
                <b-col sm="4" />
                <b-col sm="6">
                  <span v-if="conditionName === ''" style="color: red">Condition must contain at least one character</span>
                  <span v-if="conditionName !== ''" style="color: red">Condition "{{ conditionName }}" already registered</span>
                </b-col>
              </b-row>
              <b-row style="margin-top: 0.5rem">
                <b-col sm="3" />
                <b-col class="text-center" sm="7">
                  <span v-if="!showCollapsedConditions" style="cursor: pointer" @click="showCollapsedConditions = true">
                    <font-awesome-icon :icon="faPlusCircle" />
                    {{ registeredConditions.length }} conditions registered (Click on condition to remove it)
                  </span>
                  <span v-else style="cursor: pointer" @click="showCollapsedConditions = false">
                    <font-awesome-icon :icon="faMinusCircle" />
                    {{ registeredConditions.length }} conditions registered (Click on condition to remove it)
                  </span>
                </b-col>
                <b-col sm="2" />
              </b-row>
              <b-row>
                <b-col>
                  <b-collapse id="registeredConditions" v-model="showCollapsedConditions" class="mt-2">
                    <b-card v-if="registeredConditions.length > 0" style="width:80%; margin: auto; padding: 1rem" no-body>
                      <div style="display: flex; flex-direction: row; flex-flow: row wrap; justify-content: center">
                        <transition name="fade">
                          <transition-group name="conditionList" tag="div" class="conditionList">
                            <button
                              v-for="cond of registeredConditions"
                              :key="cond"
                              class="btn btn-primary"
                              style="margin: 0.5rem;"
                              @click="removeCondition"
                            >
                              {{ cond }}
                            </button>
                          </transition-group>
                        </transition>
                      </div>
                    </b-card>
                  </b-collapse>
                </b-col>
              </b-row>
            </b-container>
          </b-card-body>
        </b-collapse>
      </b-card>
      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-btn
            v-b-toggle="'accordion_counttable'"
            block
            href="#"
            variant="secondary"
          >
            2. Import Count Table
          </b-btn>
        </b-card-header>
        <b-collapse
          id="accordion_counttable"
          accordion="my-accordion"
          role="tabpanel"
          style="padding-bottom: 1rem"
        >
          <b-card-body>
            <b-card style="width:80%; margin: auto; margin-bottom: 1rem">
              <small>Import your normalized and/or unnormalized count tables. Every tab-separated count table format is supported.
                <span v-if="longHelp_counts">
                  <br><br>
                  A count table is a standard file format in differential expression analysis. It contains - on a one feature per line base - the number of reads mapped to a specific feature per sample.
                  Typical tools for creating this table are <a href="http://subread.sourceforge.net/" @click="openInBrowser('http://subread.sourceforge.net/', $event)">featureCounts</a> and <a href="https://htseq.readthedocs.io" @click="openInBrowser('https://htseq.readthedocs.io', $event)">HTSeq-Count</a>.
                  <br><br>
                  After selecting a file, you will get a summary of the count table columns. You can check if all columns got the correct condition assigned,
                  select a normalization type (only for metadata, no functionality at the moment), and you must select the column with the unique feature identifiers.
                  For selecting the correct feature identifier column, just assign <b>'--Feature name--'</b> to this column.
                  <br>
                  <a href="#" style="white-space: nowrap" @click="longHelp_counts = !longHelp_counts">Read less...</a>
                </span>
                <span v-else>
                  <a href="#" style="white-space: nowrap" @click="longHelp_counts = !longHelp_counts">Read more...</a>
                </span>
              </small>
            </b-card>
            <count-table-import />
          </b-card-body>
        </b-collapse>
      </b-card>
      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-btn
            v-b-toggle="'accordion_deseq2'"
            block
            href="#"
            variant="secondary"
          >
            3. Import DESeq2 Data
          </b-btn>
        </b-card-header>
        <b-collapse
          id="accordion_deseq2"
          accordion="my-accordion"
          role="tabpanel"
          style="padding-bottom: 1rem"
        >
          <b-card-body>
            <b-card style="width:80%; margin: auto auto 1rem;">
              <small>
                Import your DESeq2 result tables. If the file name contains the pattern '&lt;conditionA&gt;_vs_&lt;conditionB&gt;', the condition will be automatically assigned to the correct result table.
                <span v-if="longHelp_deseq">
                  <br><br>
                  A DESeq2 result table has exactly 7 columns and is tab-separated. It must contain the feature name, the base mean, the log2 fold change, the log2 fold change standard error (lfcSE),
                  the Wald statistic (stat), the Wald test p-value (pvalue), and the Benjamini-Hochberg adjusted p-value (padj) in precisely this order. The fastest way to create this file is with the following command:
                  <div style="text-align: center; padding: 0.5rem; background-color: #eee; margin-top: 1rem; margin-bottom: 1rem">
                    <span style="font-family: 'Courier New', 'Roboto Mono', monospace">
                      res &lt;- results(dds, contrast=c("condition","treated","untreated"))
                      <br>
                      write.table(res, file = 'treated_vs_untreated.tsv', sep = "\t", row.names = TRUE, col.names = NA)
                    </span>
                  </div>
                  <br>
                  <a href="#" style="white-space: nowrap" @click="longHelp_deseq = !longHelp_deseq">Read less...</a>
                </span>
                <span v-else>
                  <a href="#" style="white-space: nowrap" @click="longHelp_deseq = !longHelp_deseq">Read more...</a>
                </span>
              </small>
            </b-card>
            <deseq2-import />
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
  </div>
</template>

<script>
  import CountTableImport from './CountTableImport.vue'
  import Deseq2Import from './Deseq2Import.vue'

  import {REGISTER_CONDITION} from '@/store/action_constants'
  import {REMOVE_CONDITION} from '@/store/mutation_constants'

  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faPlusCircle, faMinusCircle, faQuestionCircle} from '@fortawesome/free-solid-svg-icons'

  export default {
    name: 'ImportMain',
    components: {
      CountTableImport: CountTableImport,
      Deseq2Import: Deseq2Import,
      FontAwesomeIcon
    },
    data () {
      return {
        conditionName: '',
        conditionFile: null,
        validCondition: null,
        showCollapsedConditions: false,
        showConditionsHelp: false,
        longHelp_overview: false,
        longHelp_condition: false,
        longHelp_counts: false,
        longHelp_deseq: false,
        labels: {
          registerConditionsTab: "Register Conditions"
        }
      }
    },
    computed: {
      registeredConditions () {
        return this.$store.state.registeredConditions
      },
      faPlusCircle () {
        return faPlusCircle
      },
      faMinusCircle () {
        return faMinusCircle
      },
      faQuestionCircle () {
        return faQuestionCircle
      }
    },
    methods: {
      readConditionFile (event) {
        let vueData = this
        let file = event.target.files[0]

        const reader = new FileReader()
        let readFile = new Promise((resolve, reject) => {
          reader.onerror = () => {
            reader.abort()
            reject(new DOMException('Problem parsing input file.'))
          }

          reader.onload = () => {
            resolve({content: reader.result})
          }
          reader.readAsText(file)
        })

        readFile.then(file => {
          let conditions = file.content.split('\n')
          for (let cond of conditions) {
            if (cond.trim()) {
              vueData.$store.dispatch(REGISTER_CONDITION, {conditionName: cond.trim()}).catch(() => {})
            }
          }
          vueData.$refs.condition_input.value = ''
        })
      },
      registerCondition () {
        let vueData = this
        if (vueData.conditionName === '') {
          vueData.validCondition = false
          return
        }

        let conditions = vueData.conditionName.split(",")
        for (let cond of conditions) {
          if (cond.trim()) {
            vueData.$store.dispatch(REGISTER_CONDITION, {conditionName: cond.trim()})
              .then(() => {
                vueData.conditionName = ''
                vueData.validCondition = null
              }).catch(() => {
              vueData.validCondition = false
            })
          }
        }
      },
      removeCondition (event) {
        this.$store.commit(REMOVE_CONDITION, event.target.textContent.trim())
      },
      openInBrowser: function(url, event) {
        nw.Shell.openExternal(url);
        event.preventDefault()
      }
    }
  }
</script>

<style scoped>
  .filesBox {
    text-align: left;
    overflow-y: scroll;
    overflow-x: scroll;
    height: auto;
    max-height: 25rem;
    white-space: nowrap;
    padding: 0.5rem
  }

  .accordion-90 {
    width: 90%;
    margin: 0 auto
  }

  ul.conditionList {
    list-style-position: inside;
  }

  ul.conditionList li {
    cursor: pointer;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
  {
    opacity: 0;
  }

  .conditionList-enter-active, .conditionList-leave-active {
    transition: opacity .5s;
  }

  .conditionList-enter, .conditionList-leave-to /* .fade-leave-active below version 2.1.8 */
  {
    opacity: 0;
  }
</style>
