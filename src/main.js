import { createApp } from 'vue'
import App from './App.vue'

import 'ant-design-vue/dist/antd.css'
import './styles/index.scss'

import router from './router/index'
import store from './store/index'
import Antd from 'ant-design-vue'

import SvgIcon from './components/SvgIcon/index.vue'

createApp(App)
  .use(router)
  .use(store)
  .use(Antd)
  .component('svg-icon', SvgIcon)
  .mount('#app')

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

// import * as serviceWorker from './serviceWorker'
// serviceWorker.unregister()
