import { createApp } from 'vue'
import './style.css' // 如果你有這個檔就留著，沒有就刪掉這行
import App from './App.vue'
import router from './router' // 引入我們剛寫的 router

const app = createApp(App)

app.use(router) // 告訴 Vue 使用 router
app.mount('#app')