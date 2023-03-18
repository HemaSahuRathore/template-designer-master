import request from "../../utils/request";
import helper from "../../utils/helper";
import router from "../../router/index.js";
const state = {
  selectedId: "",
  projectData: null,
  userProjects: [],
  storeProjects: [],
  isUserHasApplicationAccess: false,
  currentProject:{},

};

const getters = {
  navSelectedProjectId: state => state.selectedId,
  getCurrentActiveProjectData: state => state.projectData,
  allProjects: state => state.userProjects,
  getStoredProject: state => state.storeProjects,
  isUserHasApplicationAccess: state => state.isUserHasApplicationAccess,
  getCurrentProject: state => state.currentProject
};

const actions = {
  async checkUserAccessForApplication({ commit, dispatch }, userData) {
    const userRole = await helper.getCurrentUserRole(userData.projectId);
    let isUserHasApplicationAccess = false;
    let isUserRoleHasReadWriteAccess = false;
    const data = {
      projectId: userData.projectId,
      userRole: userRole,
      applicationName: userData.applicationName
    };
    const userRoleAccess = await helper.getUserAccessForApplication(data);
    if (userRoleAccess != false) {
      isUserHasApplicationAccess = userRoleAccess.isUserHasApplicationAccess;
      isUserRoleHasReadWriteAccess =
        userRoleAccess.isUserRoleHasReadWriteAccess;
    }
    commit("SET_USER_APPLICATION_ACCESS", isUserHasApplicationAccess);
    if (isUserHasApplicationAccess == false) {
      dispatch("modal/setNavPath", userData.navPath);
      localStorage.setItem("accessDeniedNavPath", userData.navPath);
      router
        .push({
          name: "ApplicationAccessDeniedPage"
        })
        .catch(() => { });
    } else localStorage.setItem("accessDeniedNavPath", "");
    let hideTabs = router.currentRoute.query.hideTabs;
    if (isUserRoleHasReadWriteAccess == true) {
      if (!hideTabs) dispatch("tree/enableDocEdit");
    } else if (
      isUserRoleHasReadWriteAccess ||
      isUserRoleHasReadWriteAccess == false
    ) {
      dispatch("tree/disableDocEdit", "noAccess");
    } else if (isUserRoleHasReadWriteAccess == true) {
      if (!hideTabs) dispatch("tree/enableDocEdit");
    }
  },

  async getProjects({ commit }) {
    const res = await request({ url: "/project/fetch/all", method: "get" });
    if (res.data && res.data != undefined && res.data != "undefined") {
      const projects = res.data;
      commit("SET_ALL_PROJECTS", projects);
      let projectData = [];

      projectData = res.data.map(project => ({
        id: project.id,
        refId: project.refId,
        name: project.name,
        state: project.state,
        appSettings: project.appSettings,
        code: project.projectCode
      }));
      localStorage.setItem("projects", JSON.stringify(projectData));

      commit("SET_ALL_PROJECTS_TO_LOCALSTORAGE", projectData);
      const { projectId } = router.currentRoute.params;
      if (projectId && projectId != "projectNullId") {
        const res = await request({
          url: `/project/fetch/one/${projectId}`,
          method: "get"
        });
        if (res && res.data) {
          commit("getProjectData", res.data);
        }
      }
      return res.data;
    }
  },
  async getProject({ commit }, id) {
    if (id) {
      const res = await request({
        url: `/project/fetch/one/${id}`,
        method: "get"
      });
      if (res) {
        commit("getProjectData", res.data);
      } else commit("getProjectData", null);
    }
  },

  setCurrentProject({ commit }, projectId) {
    const projects = JSON.parse(localStorage.getItem("projects"));
    const project = projects.find(project => project.id === projectId);
    commit("SET_CURRENT_PROJECT", project);
  }
};

const mutations = {
  SET_USER_APPLICATION_ACCESS: (state, data) =>
    (state.isUserHasApplicationAccess = data),
  getProjectData: (state, data) => (state.projectData = data),
  SET_ALL_PROJECTS: (state, data) => (state.userProjects = data),
  SET_ALL_PROJECTS_TO_LOCALSTORAGE: (state, data) =>
    (state.storeProjects = data),
  SET_CURRENT_PROJECT(state, payload) {
    state.currentProject = payload;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
