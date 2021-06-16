<template>
  <a-layout class="layout">
    <LayoutHeader></LayoutHeader>
    <a-layout-content>
      <div
        :style="{
          background: '#fff',
          minHeight: '280px',
          overflow: 'auto',
          height: '100%',
        }"
      >
        <router-view></router-view>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script>
import LayoutHeader from './components/LayoutHeader.vue'

export default {
  name: 'Layout',
  components: {
    LayoutHeader,
  },
  data() {
    return {}
  },
  methods: {},
  mounted() {},
  created() {},
}
</script>

<style lang="scss" scoped>
.layout {
  height: 100%;
}
.site-layout-content {
  min-height: 280px;
  padding: 24px;
  background: #fff;
}
#components-layout-demo-top .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}
.ant-row-rtl #components-layout-demo-top .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

[data-theme='dark'] .site-layout-content {
  background: #141414;
}
</style>
