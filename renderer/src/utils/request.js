/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2020-07-06 09:16:10
 * @LastEditTime: 2022-02-14 16:34:12
 * @Description: ...每位新修改者自己的信息
 */
import axios from 'axios'
import qs from 'qs'
import { ipcRenderer } from '@/global'

const service = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://www.xxxxx.top/api/' : '/api',
  timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    /** ie 禁止缓存 */
    // config.headers['Cache-Control'] = 'no-cache'
    // config.headers['Pragma'] = 'no-cache'
    /**
     *  启用XSS过滤。 如果检测到跨站脚本攻击，浏览器将清除页面并使用CSP report-uri指令的功能发送违规报告。
     *  https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/X-XSS-Protection
     */
    config.headers['X-XSS-Protection'] = '1;report=<reporting-uri>'
    let token = ipcRenderer.sendSync('handle-store-users')
    if (token) {
      config.headers['gitce'] = token.codeengine
    }

    if (config.type === 'qs') {
      config.data = qs.stringify(Object.assign(config.data))
    }
    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.status === 401 || res.code === 401) {
      ipcRenderer.sendSync('handle-store-users', 'set', '')
    }
    return res
  },
  error => {
    try {
      const res = error.response
      return res
    } catch (e) {
      console.log(e)
    }
    return Promise.reject(error)
  }
)

export default service
