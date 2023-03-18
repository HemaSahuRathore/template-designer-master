
import { nanoid } from 'nanoid'
import idLength from "../../../../config/nanoIdConfig.json"

export default {
  namespaced: true,
  state: {
    snackbar: []
  },
  mutations: {
    SET_SNACKBAR(state, snackbar) {
      state.snackbar = state.snackbar.concat(snackbar);
    },
    REMOVE_SNACKBAR(state, snackbarId) {
      state.snackbar = state.snackbar.filter(({ id }) => id !== snackbarId);
    }
  },
  actions: {
    setSnackbar({ commit, dispatch }, snackbar) {
      const id = nanoid(idLength.nanoReferenceIdLength);
     
      const timeout = snackbar.timeout || 3000;

      commit("SET_SNACKBAR", {
        id,
        color: snackbar.color || "success",
        message: snackbar.message,
        timeout
      });
      if (timeout !== -1)
        setTimeout(() => {
          dispatch("removeSnackbar", id);
        }, timeout);
    },
    removeSnackbar({ commit }, snackbarId) {
      commit("REMOVE_SNACKBAR", snackbarId);
    }
  },
  getters: {
    getSnackbar: state => state.snackbar
  }
};
