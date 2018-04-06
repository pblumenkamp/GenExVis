<template>
  <div>
    <b-container fluid class="mb-1">
      <b-row>
        <b-col sm="3"><label for="conditionName" style="margin-top: 0.4rem; float: right">Register condition:</label></b-col>
        <b-col sm="6">
          <b-input-group>
            <b-form-input v-model="conditionName" :state="validCondition" type="text" id="conditionName"
                          placeholder="Condition name" @input="validCondition = null" @keydown.enter.native="registerCondition" style="width: auto"></b-form-input>
            <b-input-group-append>
              <b-btn @click="registerCondition">+</b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <span @click="showCollapsedConditions = true" v-if="!showCollapsedConditions" style="cursor: pointer">
            <font-awesome-icon :icon="faPlusCircle"></font-awesome-icon>
          </span>
          <span @click="showCollapsedConditions = false" v-else style="cursor: pointer">
            <font-awesome-icon :icon="faMinusCircle"></font-awesome-icon>
          </span>
          {{registeredConditions.length}} conditions registered
          <b-collapse id="registeredConditions" class="mt-2" v-model="showCollapsedConditions">
            <b-card>
              <ul>
                <li v-for="cond of registeredConditions" :key="cond">{{cond}}</li>
              </ul>
            </b-card>
          </b-collapse>
        </b-col>
      </b-row>
    </b-container>

    <div role="tablist">
      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-btn block href="#" v-b-toggle.accordion1 variant="secondary">Count table</b-btn>
        </b-card-header>
        <b-collapse id="accordion1" visible accordion="my-accordion" role="tabpanel" style="padding-bottom: 1rem">
          <b-card-body>
            <count-table-upload></count-table-upload>
          </b-card-body>
        </b-collapse>
      </b-card>
      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-btn block href="#" v-b-toggle.accordion2 variant="secondary">DESeq2 data</b-btn>
        </b-card-header>
        <b-collapse id="accordion2" accordion="my-accordion" role="tabpanel" style="padding-bottom: 1rem">
          <b-card-body>
            <deseq2-upload></deseq2-upload>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
  </div>
</template>

<script>
  import CountTableUpload from './CountTableUpload.vue'
  import Deseq2Upload from './Deseq2Upload.vue'

  import {REGISTER_CONDITION} from '@/store/action_constants'

  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlusCircle from '@fortawesome/fontawesome-free-solid/faPlusCircle'
  import faMinusCircle from '@fortawesome/fontawesome-free-solid/faMinusCircle'

  export default {
    name: 'UploadMain',
    components: {
      CountTableUpload,
      Deseq2Upload,
      FontAwesomeIcon
    },
    data () {
      return {
        conditionName: '',
        validCondition: null,
        showCollapsedConditions: false
      }
    },
    methods: {
      registerCondition () {
        let vueData = this
        vueData.$store.dispatch(REGISTER_CONDITION, {conditionName: vueData.conditionName})
          .then(() => {
            vueData.conditionName = ''
            vueData.validCondition = null
          }).catch(() => {
            vueData.validCondition = false
          })
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
      }
    }
  }
</script>
