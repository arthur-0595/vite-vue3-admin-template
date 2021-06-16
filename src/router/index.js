import { createRouter, createWebHashHistory } from 'vue-router'

// 1. 定义路由组件， 注意，这里一定要使用 文件的全名（包含文件后缀名）
import Layout from '../layout/index.vue'

import engine from '../view/engine/index.vue'

// 2. 定义路由配置
const routes = [
  {
    path: '/',
    redirect: '/engine',
    permissionName: '',
    component: Layout,
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('../view/home.vue'),
        meta: { title: '首页' },
      },
      {
        path: '/security',
        name: 'Security',
        component: () => import('../view/security/index.vue'),
        meta: { title: '安防' },
      },
    ],
  },

  {
    path: '/engine',
    name: 'Engine',
    component: engine,
    meta: { title: '引擎demo' },
  },
]

// 3. 创建路由实例
const router = createRouter({
  // 4. 采用hash 模式
  history: createWebHashHistory(),
  // 采用 history 模式
  // history: createWebHistory(),
  routes, //使用上方定义的路由配置
})

export default router
//导出router
