<template>
  <a-layout-header class="layoutHeader">
    <div class="logo">
      <svg-icon name="logo"></svg-icon>
      <div class="title">数智引擎</div>
    </div>
  </a-layout-header>
</template>

<script>
export default {
  name: '',
  components: {},
  data() {
    return {}
  },
  computed: {},
  methods: {},
  mounted() {},
  created() {},
}
</script>

<style lang="scss" scoped>
.layoutHeader {
  height: 60px;
  overflow: hidden;
  .logo {
    display: flex;
    height: 100%;
    .title {
      font-size: 20px;
      font-weight: 500;
      color: #ffffff;
      margin-left: 24px;
      line-height: 60px;
    }
  }
  .svg-icon {
    font-size: 60px;
  }
}
</style>
