<template>
  <div>
    <b-container fluid class="mb-1">
      <b-row>
        <b-col cols="10">
          <b-row style="margin-top: 1rem">
            <div style="width:90%; margin: auto;" role="tablist">
              <b-card no-body class="mb-1">
                <b-card-header header-tag="header" class="p-1" role="tab">
                  <b-btn
                    v-b-toggle="'accordion_conditions'"
                    block
                    href="#"
                    variant="secondary"
                  >
                    1. Register Conditions
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
                    <b-row>
                      <b-col sm="4">
                        <label for="conditionName" style="margin-top: 0.4rem; float: right">Register condition:</label>
                      </b-col>
                      <b-col sm="6">
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
                            <b-btn @click="registerCondition">+</b-btn>
                          </b-input-group-append>
                        </b-input-group>
                      </b-col>
                      <b-col sm="2" style="padding-left: 0">
                        <span style="cursor: pointer; float: left" @click="showConditionsHelp = !showConditionsHelp">
                          <font-awesome-icon :icon="faQuestionCircle" />
                        </span>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col>
                        <b-collapse id="helpConditions" v-model="showConditionsHelp" class="mt-2">
                          <transition name="fade">
                            <b-card style="width:80%; margin: auto">
                              Register all conditions you want to visualize. Try to use unambiguous names to benefit from autocompletion in the next steps.
                            </b-card>
                          </transition>
                        </b-collapse>
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
                      <b-col sm="2" />
                      <b-col class="text-center">
                        <span v-if="!showCollapsedConditions" style="cursor: pointer" @click="showCollapsedConditions = true">
                          <font-awesome-icon :icon="faPlusCircle" />
                        </span>
                        <span v-else style="cursor: pointer" @click="showCollapsedConditions = false">
                          <font-awesome-icon :icon="faMinusCircle" />
                        </span>
                        {{ registeredConditions.length }} conditions registered (Click on condition to remove it)

                        <b-collapse id="registeredConditions" v-model="showCollapsedConditions" class="mt-2">
                          <transition name="fade">
                            <b-card v-if="registeredConditions.length > 0" style="width:80%; margin: auto">
                              <transition-group name="conditionList" tag="ul" class="conditionList">
                                <li v-for="cond of registeredConditions" :key="cond" @click="removeCondition">
                                  {{ cond }}
                                </li>
                              </transition-group>
                            </b-card>
                          </transition>
                        </b-collapse>
                      </b-col>
                    </b-row>
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
                    <deseq2-import />
                  </b-card-body>
                </b-collapse>
              </b-card>
            </div>
          </b-row>
        </b-col>

        <b-col cols="2">
          <b-card v-if="this.$store.state.deseqlist.length > 0" class="filesBox">
            DESeq2 Files:
            <li
              v-for="fileName in this.$store.state.deseqlist"
              :key="fileName"
              style="margin-left: 0.5rem"
            >
              <small>{{ fileName }}</small>
            </li>
          </b-card>
          <b-card v-if="this.$store.state.countlist.length > 0" class="filesBox">
            Count files:
            <li
              v-for="fileName in this.$store.state.countlist"
              :key="fileName"
              style="margin-left: 0.5rem"
            >
              <small>{{ fileName }}</small>
            </li>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
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
        validCondition: null,
        showCollapsedConditions: false,
        showConditionsHelp: false
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
      registerCondition () {
        let vueData = this
        if (vueData.conditionName === '') {
          vueData.validCondition = false
          return
        }
        vueData.$store.dispatch(REGISTER_CONDITION, {conditionName: vueData.conditionName})
          .then(() => {
            vueData.conditionName = ''
            vueData.validCondition = null
          }).catch(() => {
            vueData.validCondition = false
          })
      },
      removeCondition (event) {
        this.$store.commit(REMOVE_CONDITION, event.target.textContent)
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
    transition: opacity .5s;
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
