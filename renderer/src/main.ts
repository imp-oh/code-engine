import { createApp } from 'vue'

import App from './App.vue'
import store from "./store";
import router from './router'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import 'element-plus/dist/index.css'

// 需要全局引入再添加
import 'virtual:svg-icons-register'
import svgIcon from './components/SvgIcon/index.vue' // 全局svg图标组件
import { resetNotify, resetMessage } from './utils/resetMessage'

// 组件
import returnPage from './components/returnPage.vue'


let app = createApp(App)
// app.use(ElementPlus)
app.use(store)
app.use(router)
app.component('svg-icon', svgIcon)
app.component('return-page', returnPage)



app.config.globalProperties.$message = resetMessage
app.config.globalProperties.$notify = resetNotify
app.mount('#app')

