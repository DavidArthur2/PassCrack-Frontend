import { createRouter, createWebHistory } from 'vue-router';
import UploadFile from '@/views/Upload/Upload.vue';
import Cracking from '@/views/Cracking/Cracking.vue';
import Reports from '@/views/Reports/Reports.vue';
import Encrypt from '@/views/Encrypt/Encrypt.vue';
import Rules from '@/views/Rules/Rules.vue';
import Home from '@/views/Home/Home.vue';

const routes = [
  { path: '/upload', component: UploadFile },
  { path: '/cracking', component: Cracking },
  { path: '/reports', component: Reports },
  { path: '/encrypt', component: Encrypt },
  { path: '/rules', component: Rules },
  { path: '/', component: Home }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
