import './assets/main.css'
import './styles/variables.css'
// import './styles/global.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
