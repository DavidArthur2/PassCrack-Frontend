<template>
  <div id="app">
    <MainNavbar />
    <PageLoader />
  </div>
</template>

<script>
import MainNavbar from './components/MainNavbar.vue';
import PageLoader from './views/PageLoader.vue';

export default {
  components: {
    MainNavbar,
    PageLoader
  }
};
</script>

