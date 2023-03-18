import Vue from "vue";
import Router from "vue-router";
import AuthenticationPage from "../views/Login/AuthenticationPage.vue";
import projectRoutes from "./Project/projectRouter";
import store from "../store/index";

import coverPageRoutes from "./Coverpage/coverPageRouter";
Vue.use(Router);

const routes = [
  {
    path: "/",
    name: "AuthenticationPage",
    component: AuthenticationPage
  },
  ...projectRoutes,
  ...coverPageRoutes
];

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.isAuthenticated) {
      await store.dispatch("setUser");
    }
    if (!store.state.isAuthenticated) {
      next({ name: "AuthenticationPage" });
    } else {
      next();
    }
  } else {
    if (to.name === "AuthenticationPage") {
      if (!store.state.isAuthenticated) {
        await store.dispatch("setUser");
      }
      // if (store.state.isAuthenticated) {
      //   next({ name: "ProjectList" });
      // } 
      // else 
      {
        next();
      }
    }
    next();
  }
});

export default router;
