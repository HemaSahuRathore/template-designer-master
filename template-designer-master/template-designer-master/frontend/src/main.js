import Vue from "vue";
import App from "./App.vue";
import router from "./router/index";
import store from "./store/index";
import vuetify from "./plugins/vuetify";
import MainLayout from "./components/Layouts/MainLayout.vue";
import SidebarLayout from "./components/Layouts/SidebarLayout.vue";
import CKEditor from "@ckeditor/ckeditor5-vue2";
import '@mdi/font/css/materialdesignicons.css'
Vue.use(CKEditor);

Vue.component("main-layout", MainLayout);
Vue.component("sidebar-layout", SidebarLayout);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
