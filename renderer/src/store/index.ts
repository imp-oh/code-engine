/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-03-19 09:38:59
 * @LastEditTime: 2021-05-24 10:00:02
 * @Description: ...每位新修改者自己的信息
 */
import { createStore } from "vuex"

let item = {
  mune: [],
  mutations: {},
  actions: {},
  modules: {},
  router: {},
}

export default createStore({
  state: {
    tagList: [],
    tag: {
      name: '', // 标题名称
      id: '', // id
      value: '', // 标题的路径
      params: '', // 标题的路径参数
      query: '', // 标题的参数
      meta: {  //当前对象
        id: ''
      }, // 额外参数
      group: [] // 分组
    },
    dir: [],
    server: []
  },
  ...item
})
