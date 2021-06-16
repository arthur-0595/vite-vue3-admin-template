<template>
  <div class="engine">
    <button @click="$route.go(-1)">返回</button>
    <button @click="fnEmit()">触发事件xx</button>
    <canvas class="engine" id="engine"></canvas>
  </div>
</template>

<script>
import RunEngine from '../../plugins/engine'

export default {
  name: '',
  components: {},
  data() {
    return {
      engine: null, // 引擎对象
    }
  },
  computed: {},
  methods: {
    // 发送消息，交互
    fnEmit() {
      this.engine.emitUIInteraction({
        Category: 2,
        Item: 1,
      })
    },
    initCIM() {
      let data = {
        type: 'sws',
        appId: '123456',
        scene: '1',
      }
      RunEngine(
        {
          url: 'ws://10.32.49.86:5003',
          domId: 'engine',
        },
        data,
        (res) => {
          alert('接收消息：', res)
        }
      ).then((engine) => {
        this.engine = engine
      })
    },
  },
  mounted() {
    this.initCIM()
  },
  created() {},
}
</script>

<style lang="scss" scoped>
.engine {
  width: 100%;
  height: 100%;
  position: relative;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
