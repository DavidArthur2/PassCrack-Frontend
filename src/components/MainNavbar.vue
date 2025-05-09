<template>
  <fwb-navbar solid class="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg px-6 py-4">
    <template #logo>
      <fwb-navbar-logo class="text-white text-lg font-bold" alt="PassCrack" image-url="images/lock_icon.ico">
        PassCrack
      </fwb-navbar-logo>
    </template>
    <template #default="{isShowMenu}">
      <fwb-navbar-collapse :is-show-menu="isShowMenu" class="space-y-2 md:space-y-0 md:space-x-6" >
        <router-link
          v-for="(item, index) in items"
          :key="index"
          :to="item.link"
          :class="{
            'font-bold text-lg bg-white text-blue-500 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105': isActive(item.link) && !isShowMenu,
            'font-bold text-white hover:text-blue-400 transition duration-200 text-lg ease-in-out transform hover:scale-105': !isActive(item.link) && !isShowMenu,
            'font-bold text-lg bg-blue-500 text-white rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105': isActive(item.link) && isShowMenu,
            'font-bold text-blue-500 hover:text-blue-400 transition duration-200 text-lg ease-in-out transform hover:scale-105': !isActive(item.link) && isShowMenu,
          }"
        >
          {{ item.name }}
        </router-link>
      </fwb-navbar-collapse>
    </template>
  </fwb-navbar>
</template>

<script setup>
import {
  FwbNavbar,
  FwbNavbarCollapse,
  FwbNavbarLogo,
} from 'flowbite-vue'
</script>

<script>
  
  export default {
    name: 'MainNavbar',

    data(){
      return{
        items: [
          {name: "Főoldal", link: "/"},
          {name: "Fájl feltöltő", link: "/upload"},
          {name: "Visszafejtés", link: "/cracking"},
          {name: "Kimutatások", link: "/reports"},
          {name: "Jelszó titkosító", link: "/encrypt"},
          {name: "Regex futtató", link: "/regex"},
          {name: "Jelszó tesztelő", link: "/tester"},
          {name: "Eredmények", link: "/results"}
        ]
      }
    },
    methods: {
      isActive(link) {
        return this.$route.path === link;
      }
    }
  };
</script>