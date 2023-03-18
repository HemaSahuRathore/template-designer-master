import applicationRoutePath from "../../config/applicationRoutePath.json";
import request from "../../utils/request";
export default {
  namespaced: true,
  state: {
    openedModal: "",
    tab: "",
    tabOption: "",
    dialog: false,
    navPath: "",
    applicationPathName: "null",
    currentProject: {},
    searchText: "",
    searchType: "",
    wordMatch: "fullMatch",
  },
  mutations: {
    SET_NAV_PATH(state, payload) {
      state.navPath = payload;
    },
    SET_CURRENT_PROJECT(state, payload) {
      state.currentProject = payload;
    },
    SET_APPLICATION_PATH(state, payload) {
      state.applicationPathName = payload;
    },
     SET_SEARCH_SETTING(state, payload) {
      state.searchType = payload.searchType;
      state.wordMatch = payload.wordMatch;
      var isStopWord = false;
      payload.stopWords.forEach(word => {
        if (payload.searchText) {
          if (word.toLowerCase().includes(payload.searchText.toLowerCase())) {
            isStopWord = true;
          }
        }
      });
      if (!isStopWord) state.searchText = payload.searchText;
      else state.searchText = "";
    },


  },
  actions: {
    async searchSetting({ commit, getters: { getHtml5StopWords } }, payload) {
      payload.stopWords = await getHtml5StopWords;
      commit("SET_SEARCH_SETTING", payload);
    },
    setNavPath({ commit }, payload) {
      commit("SET_NAV_PATH", payload);
    },
    setApplicationPathName({ commit }, payload) {
      let pathName = "null";
      applicationRoutePath.applicationRoute.forEach(element => {
        if (element.docType == payload) {
          pathName = element.routePathCode;
        }
      });
      commit("SET_APPLICATION_PATH", pathName);
    },
    setCurrentProject({ commit }, projectId) {
      const projects = JSON.parse(localStorage.getItem("projects"));
      if (projects) {
        const project =projects.find(
          project => project.id === projectId
        );
        commit("SET_CURRENT_PROJECT", project)
      }
    },
  },
  getters: {
    getOptionModal: (state) => state,
    getCurrentProject: state => state.currentProject,
    async getHtml5StopWords() {
      const res = await request({
        url: `/config/get/html5StopWords`,
        method: "get"
      });
      if (res.data) {
        return res.data.StopWords;
      } else return [];
    }
  },
};
