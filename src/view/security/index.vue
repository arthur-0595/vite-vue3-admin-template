<template>
  <div class="security">
    安防页面
    <button @click="goHome">跳转首页</button>
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  data() {
    return {}
  },
  computed: {},
  methods: {
    goHome() {
      this.$router.push({
        name: 'Home',
      })
    },
  },
  mounted() {},
  created() {},
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.security {
}
</style>
