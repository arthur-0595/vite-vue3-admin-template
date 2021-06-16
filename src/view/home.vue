<template>
  <div class="home">
    我是首页{{ content }}{{ date }}
    <br />
    store:{{ $store.state.mo1.count }}
    <br />
    getter:{{ mo1Count }}
    <br />
    <button @click="addCount">addCount:commit</button>
    <button @click="addCount1">addCount:dispach</button>
    <br />
    <svg-icon name="demo1" color="red" />
    <br />
    <a-input-search
      v-model:value="value"
      placeholder="input search text"
      style="width: 200px"
      @search="onSearch"
    />
    <br />
    <button @click="goRouter('Security')">跳转安防</button>
    <button @click="openWindow()">打开引擎</button>
  </div>
</template>

<script>
import { parseTime } from '../utils'
import { mapGetters } from 'vuex'

export default {
  name: '',
  components: {},
  data() {
    return {
      content: '我是内容111',
      date: '',
      value: '我是内容',
    }
  },
  computed: {
    ...mapGetters(['mo1Count']),
  },
  methods: {
    goRouter(name) {
      this.$router.push({ name })
    },
    openWindow() {
      window.open(`${location.origin}/#/engine`)
    },
    addCount() {
      this.$store.commit('mo1/addCount', 3)
    },
    addCount1() {
      this.$store.dispatch('mo1/addCount1', 2)
    },
    // input 输入内容
    onSearch(val) {
      console.log('内容：', val)
    },
  },
  mounted() {},
  created() {
    this.date = parseTime(new Date())

    console.log(this.$store.state.mo1.count)
  },
}
</script>

<style lang="scss" scoped>
.home {
}
</style>
