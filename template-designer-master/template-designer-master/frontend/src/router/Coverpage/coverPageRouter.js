import CoverPage from "../../views/CoverPage/Index.vue";
import DesignCoverPage from "../../views/CoverPage/DesignCoverPage.vue";
import TestCoverPage from "../../views/CoverPage/TestCoverPage.vue";
import Properties from "../../views/CoverPage/Properties.vue";
import AccessPopup from '../../components/CoverPage/AccessPopup'
const authRouteMeta = { layout: "sidebar", requiresAuth: true };

export default [
  {
    path: "/project/cover-page/:projectId/:docId",
    name: "CoverPages",
    meta: { layout: "sidebar", requiresAuth: true },
    component: CoverPage,
    children: [
      {
        path: "properties",
        component: Properties,
        name: "Properties",
        meta: authRouteMeta
      },
      {
        path: "design",
        component: DesignCoverPage,
        name: "Design",
        meta: { layout: "sidebar", requiresAuth: true }
      },
      {
        path: "test",
        component: TestCoverPage,
        name: "Test",
        meta: { layout: "sidebar", requiresAuth: true }
      },
    ]
  },

  {
    path: "/project/:projectId/coverpage-access",
    component: AccessPopup,
    name: "AccessPopup",
    meta: authRouteMeta
  },
  
];
