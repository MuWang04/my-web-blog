import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initTheme } from './theme'

// 全局禁止长按/拖拽（链接、图片、文字）
document.addEventListener(
  'dragstart',
  (e) => {
    e.preventDefault()
  },
  true,
)

initTheme()

createApp(App).use(router).mount('#app')
