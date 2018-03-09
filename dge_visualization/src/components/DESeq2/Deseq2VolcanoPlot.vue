<template>
  <div>
    <h1>
      Volcano Plot
    </h1>

    <b-form-select v-model="selectedCondition1" style="width: auto" @change="selectedCondition2 = ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select the first condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[0])" :value="cond">{{ cond }}</option>
    </b-form-select>

    <b-form-select v-model="selectedCondition2" style="width: auto" :disabled="selectedCondition1 === ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select the second condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[1])" value="cond" :disabled="!conditions2.has(cond)">{{ cond }}</option>
    </b-form-select>

    <highcharts :options="options" style="width: 99%; "></highcharts>
  </div>
</template>

<script>
  export default {
    name: 'DESeq2VolcanoPlot',
    data () {
      return {
        selectedCondition1: '',
        selectedCondition2: '',
        options: {
          chart: {
            type: 'scatter',
            zoomType: 'xy'
          },
          title: {
            text: 'Fruit Consumption'
          },
          xAxis: {
            title: {
              enabled: true,
              text: 'Height (cm)'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
          },
          yAxis: {
            title: {
              text: 'Weight (kg)'
            }
          },
          legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: '#FFFFFF',
            borderWidth: 1
          },
          plotOptions: {
            scatter: {
              marker: {
                radius: 5,
                states: {
                  hover: {
                    enabled: true,
                    lineColor: 'rgb(100,100,100)'
                  }
                }
              },
              states: {
                hover: {
                  marker: {
                    enabled: false
                  }
                }
              },
              tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{point.x} cm, {point.y} kg'
              }
            }
          },
          series: [{
            name: 'Jane',
            data: [[11, 5], [13, 1]]
          },
          {
            name: 'John',
            data: [[5, 7], [6, 8]]
          }]
        }
      }
    },
    computed: {
      dgeConditions () {
        let conditions1 = new Set()
        let conditions2 = new Set()
        for (let {condition1, condition2} of this.$store.state.dgeData.conditionPairs) {
          conditions1.add(condition1)
          conditions2.add(condition2)
        }
        return [conditions1, conditions2]
      },
      conditions2 () {
        let conditions2 = new Set()
        for (let {condition1, condition2} of this.$store.state.dgeData.conditionPairs) {
          if (condition1 === this.selectedCondition1) {
            conditions2.add(condition2)
          }
        }
        return conditions2
      }
    }
  }
</script>
