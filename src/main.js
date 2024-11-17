import { createApp } from 'vue'
import App from './App.vue'
import '../node_modules/flowbite-vue/dist/index.css'
import './tailwind.css'
import router from './router'
import axios from "axios";

axios.defaults.baseURL = "http://127.0.0.1:8001";
createApp(App).use(router).mount('#app')
