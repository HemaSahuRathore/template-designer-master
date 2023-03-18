import Settings from "../../views/Common/Settings.vue";
import ApplicationAccessDeniedPage from '../../views/Common/ApplicationAccessDeniedPage.vue'
import SearchResult from "../../views/Common/SearchResult.vue";
const authRouteMeta = { layout: "sidebar", requiresAuth: true };
export default [
  {
    path: "/project/:projectId/setting",
    component: Settings,
    name: "Settings",
    meta: {
      layout: "sidebar",
      requiresAuth: true
    }
  },

  {
    path: "/project/:projectId/appli-access-denied",
    component: ApplicationAccessDeniedPage,
    name: "ApplicationAccessDeniedPage",
    meta: {
      layout: "sidebar",
      requiresAuth: true
    }
  },

  {
    path: "/project/search/:projectId/search-result",
    component: SearchResult,
    name: "SearchResult",
    meta: authRouteMeta
  },
];
