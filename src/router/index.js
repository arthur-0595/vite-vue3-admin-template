import { createRouter, createWebHashHistory } from 'vue-router'

// 1. 定义路由组件， 注意，这里一定要使用 文件的全名（包含文件后缀名）
import home from '../view/home.vue'
import security from '../view/security/index.vue'
import engine from '../view/engine/index.vue'

// 2. 定义路由配置
const routes = [
  {
    path: '/',
    redirect: '/engine',
  },
  { path: '/home', name: 'Home', component: home },
  { path: '/security', name: 'Security', component: security },
  { path: '/engine', name: 'Engine', component: engine },
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
