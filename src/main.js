import { createApp } from 'vue'
import App from './App.vue'
import '../node_modules/flowbite-vue/dist/index.css'
import './tailwind.css'
import router from './router'
import axios from "axios";
import { getApiUrl } from './utils/config'

axios.defaults.baseURL = getApiUrl("");
createApp(App).use(router).mount('#app')
