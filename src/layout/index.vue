<template>
  <a-layout class="main">
    <LayoutHeader></LayoutHeader>
    <a-layout>
      <a-layout-sider width="278" style="background: #fff">
        <div class="user-info">
          <img
            src="https://citydo-engine.oss-cn-hangzhou.aliyuncs.com/web-public/engine/WechatIMG7343.jpeg"
            class="avatar-image"
          />
          <div class="avatar-name">{{ name }}</div>
          <div
            class="sign-out-btn"
            @mouseover="mouseover"
            @mouseout="mouseout"
            @click="handleOut"
          >
            <svg-icon name="out" class="svgClass" />
            <div class="out-name">退出登陆</div>
          </div>
        </div>
        <a-menu
          mode="inline"
          theme="dark"
          v-model:selectedKeys="activeMenu"
          v-model:defaultSelectedKeys="defaultSelectedKeys"
        >
          <template v-for="item in permission_routes" :key="item.name">
            <a-menu-item
              @click="handleMenu(item)"
              :key="item.name"
              v-if="!item.hidden"
            >
              <svg-icon class="navSvgClass" :name="item.meta.icon" />
              <span class="title">{{ item.meta.title }}</span>
            </a-menu-item>
          </template>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 20px 20px">
        <div class="breadcrumb-wrapper">
          <svg-icon :name="breadcrumb.icon" class="breadcrumb-icon" />
          <a-breadcrumb>
            <a-breadcrumb-item>{{
              breadcrumb ? breadcrumb.title : undefined
            }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <a-layout-content
          :style="{
            margin: 0,
            minHeight: '280px',
            overflow: 'auto',
          }"
        >
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script>
import { UserOutlined } from '@ant-design/icons-vue'

import LayoutHeader from './components/LayoutHeader.vue'
import { mapGetters } from 'vuex'
import { removeToken } from '../utils/auth'

export default {
  name: 'Layout',
  components: {
    UserOutlined,
    LayoutHeader,
  },
  data() {
    return {
      selectedKeys: ['Case'],
      defaultSelectedKeys: ['Case'],
      nav: [
        {
          title: '左侧导航1',
          id: 1,
          children: [
            {
              title: '左侧导航1-1',
              id: 2,
            },
            {
              title: '左侧导航1-2',
              id: 3,
            },
          ],
        },
        {
          title: '左侧导航3',
          id: 7,
        },
        {
          title: '左侧导航2',
          id: 4,
          children: [
            {
              title: '左侧导航2-1',
              id: 5,
            },
            {
              title: '左侧导航2-2',
              id: 6,
            },
          ],
        },
      ],
      outColor: '#fff',
      name: undefined,
    }
  },
  computed: {
    ...mapGetters([
      'permission_routes', //渲染侧边栏
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, name } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return [name]
    },
    breadcrumb() {
      let { meta } = this.$route
      console.log('meta', meta)
      return meta
    },
  },
  watch: {
    permission_routes: {
      handler(val) {
        console.log('val', val)
      },
      immediate: true,
    },
  },
  methods: {
    // 登出
    handleOut() {
      console.log('登出')
    },
    handleMenu(item) {
      this.$router.push({ name: item.name })
    },
  },
  mounted() {
    const userInfo = this.$store.getters['userInfo']
    this.name = userInfo ? userInfo.phone : undefined
  },
  created() {},
}
</script>

<style lang="scss" scoped>
.main {
  height: 100%;
}
#components-layout-demo-top-side-2 .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side-2 .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: #fff;
}

.user-info {
  width: 100%;
  height: 296px;
  background: url('https://citydo-engine.oss-cn-hangzhou.aliyuncs.com/web-public/engine/userBg.jpg')
    no-repeat;
  background-size: 100% 100%;
  box-shadow: 2px 0px 6px 0px rgba(0, 21, 41, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  .avatar-image {
    width: 118px;
    height: 118px;
    margin-top: 20px;
    border-radius: 50%;
    object-fit: cover;
  }
  .avatar-name {
    margin-top: 12px;
    font-size: 18px;
    font-weight: 500;
    color: #ffffff;
  }
  .sign-out-btn {
    margin-top: 26px;
    width: 114px;
    height: 36px;
    border-radius: 18px;
    border: 1px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .svgClass {
      color: #fff;
    }
    &:hover {
      border: 1px solid #218cff;
      .out-name,
      .svgClass {
        color: #218cff;
      }
    }
    .out {
      width: 14px;
      height: 14px;
    }
    .out-name {
      font-size: 14px;
      color: #ffffff;
      margin-left: 6px;
    }
  }
}

.ant-menu {
  min-height: calc(100% - 296px);
  overflow: auto;
  border-right: 0;
  background: #072339;
  // padding: 0 35px;
  ::v-deep(.ant-menu-item) {
    display: flex;
    align-items: center;
    .title {
      margin-left: 15px;
    }
  }
  .navSvgClass {
    font-size: 18px;
  }
}

.breadcrumb-wrapper {
  display: flex;
  align-items: center;
  .ant-breadcrumb {
    margin: 12px 0 12px 12px;
  }
  .breadcrumb-icon {
    font-size: 16px;
  }
}

::v-deep(.ant-menu-item-selected) {
  background: #0e4672 !important;
}
</style>
