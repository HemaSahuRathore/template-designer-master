<template>
  <component :is="layout">
    <router-view />
    
  </component>
</template>

<script>
const main_layout = "main";
export default {
  name: "App",
  computed: {
    layout() {
      return (this.$route.meta.layout || main_layout) + "-layout";
    },
  },

  created() {
   
  },
};
</script>
