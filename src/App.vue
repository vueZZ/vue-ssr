<template>
  <div id="app">
    <h2>app</h2>
    <h2>{{name}}</h2>
    <h2 @click="test" id="t2">{{a}}</h2>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      name:'zz',
      a: ''
    }
  },
  // computed: {
  //   a (val) {
  //       return this.name
  //   }
  // },
  mounted () {
    this.a = this.name
  },
  methods: {
    test () {
      this.name = this.name + `1`
    }
  }
}
</script>