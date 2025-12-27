import { createApp } from 'vue'
import router from './router' // 只引入
import App from './App.vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

//3.加载路由器
app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')
