import axios from 'axios'
import router from '../router/index'
// import store from './store/index'

import { getToken, removeToken } from './auth'
import { message } from 'ant-design-vue'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_SERVICE_URL, // api的base_url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000, // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    if (getToken()) {
      config.headers['x-access-token'] = getToken()
    }
    config.headers['environment'] = JSON.stringify({
      userAgent: navigator.userAgent,
    })
    return config
  },
  (error) => {
    // 处理请求错误
    console.log(error)
    return Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
  /**
   * 如果要获得http信息，如头信息或状态信息  可 return  response => response
   */
  /**
   * 通过自定义代码确定请求状态
   * 您还可以通过HTTP状态码来判断状态
   */
  (response) => {
    const res = response.data

    // 处理blob类型 特殊处理 post请求
    if (!res.code && res.size) {
      return res
    }
    // 200请求成功
    if (res.code === 200) {
      return res
    }
    // 接口请求失败
    if (res.code === 400) {
      message.warning(res.message)
      return Promise.reject(res)
    }
    // 登录失效，请重新登陆
    if (res.code === 401) {
      message.warning(res.message)
      removeToken()
      router.push('/login')
    }
    // 无权限
    if (res.code === 402) {
      router.push('/402')
    }
    // 服务器维护中
    if (res.code === 500) {
      router.push('/500')
    }
  },
  (error) => {
    console.log('err:' + error)
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 3 * 1000
    // })
    return Promise.reject(error)
  }
)

export default service
