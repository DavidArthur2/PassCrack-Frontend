import { createRouter, createWebHistory } from 'vue-router';
import UploadFile from '@/views/Upload/Upload.vue';
import Cracking from '@/views/Cracking/Cracking.vue';
import Reports from '@/views/Reports/Reports.vue';
import Encrypt from '@/views/Encrypt/Encrypt.vue';
import Regex from '@/views/Regex/Regex.vue';
import Home from '@/views/Home/Home.vue';
import Tester from '@/views/Tester/Tester.vue';

const routes = [
  { path: '/upload', component: UploadFile },
  { path: '/cracking', component: Cracking },
  { path: '/reports', component: Reports },
  { path: '/encrypt', component: Encrypt },
  { path: '/regex', component: Regex },
  { path: '/tester', component: Tester },
  { path: '/', component: Home }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
