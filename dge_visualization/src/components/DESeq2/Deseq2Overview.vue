<template>
  <div id="app">
    <!--
      A data-table example using it's props and @select handler
    -->
    <data-tablee
      :cols="cols"
      :rows="rows"
      selectable
      @select="(items) => selected = items">
    </data-tablee>

    <!--
      This is just an example that you can do using
      VueDataTablee @select handler...
    -->
    <transition-group
      tag="ul"
      name="selected-users"
      class="selected-users">
      <li class="label" :key="'label'">Selected users:</li>
      <li
        v-for="name in selected.map((_) => _.name)"
        class="user"
        :key="name">
        {{ name }}
      </li>
    </transition-group>

    <!--
      another example using rows as slots
    -->
    <!--<data-tablee-->
      <!--:cols="[-->
      <!--{ label: 'Index', sort: false },-->
      <!--{ label: 'Name', field: 'name' }]"-->
      <!--:rows="rows">-->
      <!--<template slot="row" slot-scope="{ row, index }">-->
        <!--<td class="data-tablee-cell">-->
          <!--<span class="data-tablee-text">{{ index + 1 }}</span>-->
        <!--</td>-->
        <!--<td class="data-tablee-cell">-->
          <!--<span class="data-tablee-text">{{ row.name }}</span>-->
        <!--</td>-->
      <!--</template>-->
    <!--</data-tablee>-->
  </div>
</template>


<script>
  // const getTime = date => new Date(date).getTime()
  // console.log(this.$store.state.dgeData)

  export default {
    name: 'app',
    data () {
      return {
        selected: [],
        rows: getData(this.$store.state.dgeData._data),
        cols:
        [
          {
            label: 'Name',
            field: 'name',
            width: 150
          },
          {
            label: 'Analyse',
            field: 'analysis 0',
            width: 150
          }
        ]
      }
    }
  }

  function getData (storage) {
    let dataarray = []
    Object.keys(storage).forEach(function (key) {
      let tempdict = {}
      tempdict['name'] = key
      let storageAlevel = storage[key]
      Object.keys(storageAlevel).forEach(function (keyA) {
        if (keyA === '_deseq2_analyses') {
          let storageBlevel = storageAlevel[keyA]
          var counter = 0
          Object.keys(storageBlevel).forEach(function (keyB) {
            console.log(keyB)
            let storageClevel = storageBlevel[keyB]
            tempdict['analysis ' + counter] = keyB.toString()
            Object.keys(storageClevel).forEach(function (keyC) {
              // console.log(keyC, '>>>', storageClevel[keyC])
            })
            counter = counter + 1
          })
        }
      })
      dataarray.push(tempdict)
      console.log(tempdict)
    })
    return dataarray
  }

  // function getData () {
  //   let datalist = []
  //   let store = this.$store.state.dgeData
  //   for (let entry of store) {
  //     datalist.push(entry)
  //   }
  //   return datalist
  // }

  // function getData () {
  //   let openlist = []
  //   let store = this.$store.state.dgeData
  //   for (let entry of store) {
  //     openlist.push(entry)
  //   }
  //   console.log(openlist)
  //   return [
  //     openlist
  //   ]
  // }

  // function getUsers () {
  //   return [
  //     {
  //       id: 'daa3daeb-91c6-42f8-aaf4-4e80c297c000',
  //       name: 'Darsie Tellett',
  //       email: 'dtellett1@behance.net',
  //       gender: 'Male',
  //       birth_date: '1990-07-12',
  //       address: {
  //         country: 'United States',
  //         zip: '84130',
  //         province: 'Utah',
  //         city: 'Salt Lake City',
  //         street: 'Schurz',
  //         number: '08529'
  //       }
  //     },
  //     {
  //       id: '37742e75-6839-461a-8727-d00b4333176a',
  //       name: 'Hilarius Jeaffreson',
  //       email: 'hjeaffreson2@ted.com',
  //       gender: 'Male',
  //       birth_date: '1993-06-13',
  //       address: {
  //         country: 'United States',
  //         zip: '34290',
  //         province: 'Florida',
  //         city: 'North Port',
  //         street: 'Milwaukee',
  //         number: '0'
  //       }
  //     },
  //     {
  //       id: 'a6ebf9ee-3cc5-4384-b73c-594a79207774',
  //       name: 'Lyman Haxley',
  //       email: 'lhaxley3@newyorker.com',
  //       gender: null,
  //       birth_date: '1972-12-29',
  //       address: {
  //         country: 'United States',
  //         zip: '77260',
  //         province: 'Texas',
  //         city: 'Houston',
  //         street: 'Scoville',
  //         number: '9514'
  //       }
  //     },
  //     {
  //       id: '77b39998-188a-4967-a960-12372308345c',
  //       name: 'Lock Kearney',
  //       email: 'lkearney4@ucsd.edu',
  //       gender: 'Male',
  //       birth_date: '1983-01-17',
  //       address: {
  //         country: 'United States',
  //         zip: '43215',
  //         province: 'Ohio',
  //         city: 'Columbus',
  //         street: '5th',
  //         number: '36'
  //       }
  //     },
  //     {
  //       id: 'df88b137-fc34-4bd4-b32a-595f79867906',
  //       name: 'Ame Blachford',
  //       email: 'ablachford5@miitbeian.gov.cn',
  //       gender: 'Female',
  //       birth_date: '1974-03-04',
  //       address: {
  //         country: 'United States',
  //         zip: '32803',
  //         province: 'Florida',
  //         city: 'Orlando',
  //         street: 'Hovde',
  //         number: '6251'
  //       }
  //     },
  //     {
  //       id: 'd18a89e9-a707-4bed-9b75-73a1e712714b',
  //       name: 'Bobbye Seldon',
  //       email: 'bseldon6@artisteer.com',
  //       gender: 'Male',
  //       birth_date: '1993-07-23',
  //       address: {
  //         country: 'United States',
  //         zip: '83757',
  //         province: 'Idaho',
  //         city: 'Boise',
  //         street: 'Delaware',
  //         number: '9754'
  //       }
  //     }
  //   ]
  // }
</script>

<!--<template>-->
  <!--<div id="DESeq2Overview">-->
    <!--DESeq2 Overview-->
    <!--<ul v-for="item in deseq2Data">-->
      <!--<li>{{ item._name }}</li>-->
    <!--</ul>-->
  <!--</div>-->
<!--</template>-->

<!--<script>-->
  <!--import { DataTablee } from 'vue-data-tablee'-->

  <!--export default {-->
    <!--components: { DataTablee },-->
    <!--name: 'DESeq2Overview',-->
    <!--data () {-->
      <!--return {}-->
    <!--},-->
    <!--computed: {-->
      <!--deseq2Data () {-->
        <!--return this.$store.state.dgeData._data-->
      <!--}-->
    <!--}-->
  <!--}-->
<!--</script>-->
