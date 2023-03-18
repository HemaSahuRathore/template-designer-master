import Vue from "vue";
import Vuex from "vuex";
import snackbarModule from "./Snackbar/snackbar";
import modalModule from "./Modal/modalStore";
import project from './Project/project'
import treeModule from "./Tree/treeStore";
import request from "../utils/request";

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    isAuthenticated: false,
    loading: true,
    user: null
  },
  mutations: {
    SET_USER(state, user) {
      state.isAuthenticated = true;
      state.user = user;
      state.loading = false;
      localStorage.setItem("currentUser", JSON.stringify(user));
    },
    REMOVE_USER(state) {
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
    },
    RESET_CURRENT_USER(state) {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = JSON.parse(localStorage.getItem("currentUser"));
    }
  },
  actions: {
    async setUser({ commit }) {
      const res = await request({ url: "/user/current", method: "get" });
      if (res && res.data && res.data.currentUser)
        commit("SET_USER", res.data.currentUser);
      else commit("REMOVE_USER");
    },
    removeUser({ commit }) {
      commit("REMOVE_USER");
    },
    resetCurrentUser({ commit }) {
      commit("RESET_CURRENT_USER");
    }
  },
  getters: {
    getUser: state => state.user
  },
  modules: {
    snackbar: snackbarModule,
    modal: modalModule,
    tree: treeModule,
    project : project
  }
});
