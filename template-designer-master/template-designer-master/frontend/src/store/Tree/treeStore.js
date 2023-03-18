import router from "../../router/index.js";
import { newTree } from "../../utils/newTree";
import { documentTreeNode } from "../../utils/documentTreeNode";
import request from "../../utils/request";
import { TreeNode } from "../../components/TreeListView/Tree.js";
import cloneDeep from "lodash/cloneDeep";
import helper from '../../utils/helper'
export default {
  namespaced: true,
  state: {
    documentTree: {
      data: newTree(),
      state: [newTree()]
    },
    documentProperties: {
      name: "Undefined",
      subject: "",
      creator: "",
      company: "",
      keywords: [],
      description: "",
      createdAt: Date(),
      modifiedAt: Date(),
      templateName: "",
      authors: [],
      use: "",
      text: "",
      type: '',
      docType: '',

      category: '',
      pageSize: '',
      selectedMode: '',
      margin: '',
      margins: {
        leftMargin: '',
        rightMargin: '',
        bottomMargin: '',
        topMagin: ''
      }
    },
    timeout: null,
    initialTimeOut: null,
    documentTreeData: {},
    copiedDocumentTreeData: {},
    cutNodeData: null,
    currentDocumentItem: null,
    rootNode: false,
    copiedNode: null,
    copiedNodeParams: {},
    hasScrollbar: false,
    isDocFetchSuccess: true,
    discussFromNode: false,
    readonly: false,
    coverPageInstanceId: null,
    version: 0,
    updatedTreeData: {},
    currentProject: {},
    reasonForDocDisable: ''
  },
  mutations: {
    SET_TIMEOUT(state, payload) {
      state.timeout = payload;
    },
    UNSET_TIMEOUT(state) {
      state.timeout = null;
    },
    SET_INITIAL_TIMEOUT(state, autoSaveTime) {
      state.initialTimeOut = autoSaveTime;
    },
    UNSET_INITIAL_TIMEOUT(state) {
      state.initialTimeOut = null;
    },
    // ON_NODE_UNDO(state, payload) {
    //   const id = payload;
    //   state.documentTreeData[id].currentStateIndex--;
    //   const currentStateIndex = state.documentTreeData[id].currentStateIndex;
    //   const redoData =
    //     state.documentTreeData[id].state[currentStateIndex + 1].data;
    //   const redoMeta =
    //     state.documentTreeData[id].state[currentStateIndex + 1].meta;
    //   state.documentTreeData[id].redoStackData.push(redoData);
    //   state.documentTreeData[id].redoStackMeta.push(redoMeta);
    //   state.documentTreeData[id].data =
    //     state.documentTreeData[id].state[currentStateIndex].data;
    //   state.documentTreeData[id].meta =
    //     state.documentTreeData[id].state[currentStateIndex].meta;
    // },
    // ON_NODE_REDO(state, payload) {
    //   const id = payload;
    //   state.documentTreeData[id].data =
    //     state.documentTreeData[id].redoStackData[
    //     state.documentTreeData[id].redoStackData.length - 1
    //     ];
    //   state.documentTreeData[id].meta =
    //     state.documentTreeData[id].redoStackMeta[
    //     state.documentTreeData[id].redoStackMeta.length - 1
    //     ];
    //   state.documentTreeData[id].redoStackData.pop();
    //   state.documentTreeData[id].redoStackMeta.pop();
    // },
    // ON_TREE_UNDO(state) {
    //   state.documentTree.currentStateIndex--;
    //   const currentStateIndex = state.documentTree.currentStateIndex;
    //   const redoData = state.documentTree.state[currentStateIndex + 1];
    //   state.documentTree.redoStack.push(redoData);
    //   state.documentTree.data = state.documentTree.state[currentStateIndex];
    // },
    // ON_TREE_REDO(state) {
    //   state.documentTree.currentStateIndex++;
    //   const currentStateIndex = state.documentTree.currentStateIndex;
    //   state.documentTree.data = state.documentTree.state[currentStateIndex];
    // },
    ON_NODE_CREATE(state, payload) {
      const { newNode, extension, currentUsername, updatedTree } = payload;
      state.rootNode = null;
      state.currentDocumentItem = newNode.id;
      state.documentTree.data = newTree(updatedTree);
      state.documentTreeData = {
        ...state.documentTreeData,
        [newNode.id]: {
          ...documentTreeNode({
            isLeaf: newNode.isLeaf,
            name: newNode.name,
            creatorName: currentUsername,
            type: extension,
            privateFor: newNode.parent.privateFor,
            lockedBy: newNode.parent.lockedBy
          })
        }
      };
    },
    HANDLE_DISCUSSION(state, payload) {
      state.discussFromNode = payload;
    },
    SET_SCROLLBAR_VISIBILITY(state, payload) {
      state.hasScrollbar = payload.visible;
    },
    ON_DEFAULT_NODE_CREATE(state, payload) {
      const { data } = payload;
      for (var index = 0; index < data.length; index++) {
        state.documentTreeData = {
          ...state.documentTreeData,
          [data[index].id]: {
            ...documentTreeNode({
              isLeaf: data[index].isLeaf,
              name: data[index].name,
              creatorName: "",
              type: "",
              privateFor: null,
              lockedBy: null
            }),
          },
        };
      }
      if (data[0]) state.coverPageInstanceId = data[0].id;
    },
    SET_COVER_PAGE_INSTANCE_ID(state, payload) {
      state.coverPageInstanceId = payload.coverPageInstanceId;
    },
    ON_LOAD_TREE_FROM_TEMPLATE(state, payload) {
      state.documentTree.data = newTree(payload.tree);
    },
    ON_NODE_SELECTOR(state, payload) {
      if (payload == 1) state.rootNode = payload;
      else {
        state.rootNode = null;
      }
      state.currentDocumentItem = payload;
    },
    ON_NODE_DELETE(state, payload) {
      const { updatedDocumentTreeData, updatedTree, action } = payload;
      state.documentTree.data = newTree(updatedTree);
      state.documentTreeData = { ...updatedDocumentTreeData };
      if (action == "delete") state.currentDocumentItem = 1;
    },
    ON_NODE_NAME_UPDATE(state, payload) {
      const { data, updatedTree } = payload;
      state.documentTreeData = {
        ...state.documentTreeData,
        [data.id]: {
          ...state.documentTreeData[data.id],
          meta: { ...state.documentTreeData[data.id].meta, name: data.name },
        },
      };
      state.documentTree.data = newTree(updatedTree);
    },
    ON_NODE_DROP(state, payload) {
      const { nodeIds, updatedTree, lockedBy, privateFor } = payload;
      for (var index = 0; index < nodeIds.length; index++) {
        const id = nodeIds[index];
        if (lockedBy && privateFor) {
          state.documentTreeData = {
            ...state.documentTreeData,
            [id]: {
              ...state.documentTreeData[id],
              meta: {
                ...state.documentTreeData[id].meta,
                lockedBy: lockedBy,
                privateFor: privateFor
              }
            }
          };
        } else if (lockedBy) {
          state.documentTreeData = {
            ...state.documentTreeData,
            [id]: {
              ...state.documentTreeData[id],
              meta: { ...state.documentTreeData[id].meta, lockedBy: lockedBy }
            }
          };
        } else if (privateFor) {
          state.documentTreeData = {
            ...state.documentTreeData,
            [id]: {
              ...state.documentTreeData[id],
              meta: {
                ...state.documentTreeData[id].meta,
                privateFor: privateFor
              }
            }
          };
        }
      }
      state.documentTree.data = newTree(updatedTree);
    },
    ON_INPUT_UPDATE(state, { name, value }) {
      const { currentDocumentItem: currentItem } = state;
      if (name == "text" && typeof value == "string") {
        value = value.replaceAll("<mark>", "");
        value = value.replaceAll("</mark>", "");
      }
      state.documentTreeData = {
        ...state.documentTreeData,
        [currentItem]: {
          ...state.documentTreeData[currentItem],
          data: {
            ...state.documentTreeData[currentItem].data,
            [name]: value,
          },
        },
      };
    },
    ON_DOCUMENT_PROPERTIES_UPDATE(state, value) {
      if (value.name) {
        state.documentTree.data = newTree(state.documentTree.data, value.name);
      }
      state.documentProperties = value;
    },
    ON_NODE_META_UPDATE(state, payload) {
      const { id } = payload;
      if (id == 1 || id == "toc" || id == "tof" || id == "tot") return;
      state.documentTreeData = {
        ...state.documentTreeData,
        [id]: {
          ...state.documentTreeData[id],
          meta: {
            ...state.documentTreeData[id].meta,
            name: payload.name,
            privateFor: payload.privateFor,
            lockedBy: payload.lockedBy,
          },
        },
      };
    },

    // IS_EXISTING_DOC_SELECTED(state, payload) {
    //   state.templateType = payload.templateType;
    // },
    SET_DOC_FETCH_STATUS(state, payload) {
      state.isDocFetchSuccess = payload;
    },
    FETCH_DOCUMENT(state, documentData) {
      const payload = documentData.docData;
      state.isDocFetchSuccess = true;
      const parsedTreeString = payload.document.tree
        ? JSON.parse(payload.document.tree)
        : null;
      const tree = newTree(parsedTreeString, payload.document.properties.name);
      state.documentTree = {
        data: tree,
        state: [cloneDeep(tree)]
      };
      if (
        payload.document.properties.lockedBy &&
        payload.document.properties.lockedBy.email == documentData.currentUser
      )
        payload.document.properties.lockedBy = null;
      state.documentProperties = payload.document.properties;
      let fetchedDocumentTreeData = {};
      for (let i = 0; i < payload.documentData.length; i++) {
        const node = payload.documentData[i];
        fetchedDocumentTreeData = {
          ...fetchedDocumentTreeData,
          [node.id]: {
            data: node.data,
            meta: node.meta
          }
        };
      }
      state.documentTreeData = fetchedDocumentTreeData;
      state.copiedNodeData = null;
      state.copiedDocumentTreeData = {};
      state.version = payload.document.version;
      state.refId = payload.document.refId;
      state._key = payload.document._key;
      if (!router.currentRoute.name.includes("DocView")) {
        state.documentTree.data.children[0].children.forEach(child => {
          if (child.id == "toc" || child.id == "tof" || child.id == "tot") {
            child.hide = true;
          }
        });
      } else
        state.documentTree.data.children[0].children.forEach(child => {
          child.hide = false;
        });
    },
    ON_NODE_COPY(state, payload) {
      const { copiedNodeData, copiedDocumentTreeData } = payload;
      state.copiedNode = copiedNodeData;
      state.copiedDocumentTreeData = { ...copiedDocumentTreeData };
      if (payload.action == "cut") {
        state.cutNodeData = payload.params;
      } else state.cutNodeData = null;
      state.copiedNodeParams = payload.params;
    },
    // TODO: add tree logic to add node
    ON_NODE_PASTE(state, payload) {
      state;
      payload;
      state.documentTreeData = {
        ...state.documentTreeData,
        ...state.copiedDocumentTreeData,
      };
      state.documentTree.data = payload;
    },
    DISABLE_DOC_EDIT(state, payload) {
      state.readonly = true;
      state.reasonForDocDisable = payload;
    },
    ENABLE_DOC_EDIT(state) {
      state.readonly = false;
      state.reasonForDocDisable = "";
    },
    PREPARE_DOCUMENT_DATA(state, payload) {
      state.updatedTreeData = payload.getDocumentData;
    },
    SET_CURRENT_PROJECT(state, payload) {
      state.currentProject = payload;
    }
  },
  actions: {
    unsetTimeout({ commit }) {
      commit("UNSET_INITIAL_TIMEOUT")
      commit("UNSET_TIMEOUT");
    },
    onNodeUndoHandler({ commit, dispatch, rootState }, id) {
      const { tree } = rootState;
      const { documentTree, documentTreeData } = tree;
      if (id === 1 && documentTree.currentStateIndex > 0)
        commit("ON_TREE_UNDO");
      else if (
        id &&
        documentTreeData[id] &&
        documentTreeData[id].currentStateIndex > 0
      )
        commit("ON_NODE_UNDO", id);
      dispatch("autoSave");
    },
    onNodeRedoHandler({ commit, dispatch, rootState }, id) {
      const { tree } = rootState;
      const { documentTree, documentTreeData } = tree;
      if (
        id === 1 &&
        documentTree.currentStateIndex < documentTree.state.length - 1
      )
        commit("ON_TREE_REDO");
      else if (
        id &&
        documentTreeData[id] &&
        documentTreeData[id].redoStackData.length > 0
      ) {
        commit("ON_NODE_REDO", id);
      }
      dispatch("autoSave");
    },
    onNodeAddHandler({ commit, dispatch, rootState }, data) {
      const { tree } = rootState;
      const { newNode, extension, updatedTree } = data;
      if (tree.documentTreeData[newNode.id]) return;
      commit("ON_NODE_CREATE", {
        newNode,
        extension,
        currentUsername: rootState.user.name,
        updatedTree,
      });
      dispatch("autoSave");
    },
    handleDiscussion({ commit }, payload) {
      commit("HANDLE_DISCUSSION", payload);
    },
    setScrollbarVisibility({ commit }, payload) {
      commit("SET_SCROLLBAR_VISIBILITY", payload);
    },
    onNodeSelectHandler({ commit }, data) {
      commit("ON_NODE_SELECTOR", data.id);
    },
    disableDocEdit({ commit }, payload) {
      commit("DISABLE_DOC_EDIT", payload);
    },
    enableDocEdit({ commit }) {
      commit("ENABLE_DOC_EDIT");
    },
    onNodeDeleteHandler({ commit, dispatch, rootState }, data) {
      const { updatedTree, deletedNode, action } = data;
      const treeId = deletedNode.getDeletedChildren();
      const {
        tree: { documentTreeData },
      } = rootState;
      const updatedDocumentTreeData = {};
      Object.keys(documentTreeData).forEach((key) => {
        const treeIdIndex = treeId.indexOf(key);
        if (treeIdIndex === -1)
          updatedDocumentTreeData[key] = documentTreeData[key];
      });
      commit("ON_NODE_DELETE", {
        updatedDocumentTreeData,
        updatedTree,
        action
      });
      dispatch("autoSave");
    },
    onNodeUpdateHandler({ commit, dispatch }, { data, updatedTree }) {
      commit("ON_NODE_NAME_UPDATE", { data, updatedTree });
      dispatch("autoSave");
    },
    onNodeLockHandler({ commit, dispatch }, payload) {
      const { params } = payload;
      const { fromEditor } = payload;
      if (params) commit("ON_NODE_META_UPDATE", params);
      dispatch("autoSave", {
        nodeName: params.name,
        action: "lock",
        fromEditor: fromEditor
      });
    },
    onNodeVisibilityChangeHandler({ commit, dispatch }, params) {
      if (params) commit("ON_NODE_META_UPDATE", params);
      dispatch("autoSave", { nodeName: params.name, action: "private" });
    },
    prepareDocumentData({ commit, rootState, getters: { getDocumentData } }) {
      const currentUser = rootState.user;
      commit("PREPARE_DOCUMENT_DATA", { getDocumentData, currentUser });
    },
    setCurrentProject({ commit }, projectId) {
      const projects = JSON.parse(localStorage.getItem("projects"));
      const project = projects.find(project => project.id === projectId);
      commit("SET_CURRENT_PROJECT", project);
    },

    autoSave({ state,
      commit,
      dispatch,
      getters: { getDocumentData, getCurrentProject },
      rootState: {
        tree: { timeout },
      },
    },
      //eslint-disable-next-line
      payload) {
      if (timeout) {
        clearTimeout(timeout);
        commit("UNSET_TIMEOUT");
      }
      const initialTimeOut = state.initialTimeOut;
      const timeoutId = setTimeout(async () => {
        dispatch("prepareDocumentData");
        const { docId, projectId } = router.currentRoute.params;
        if (docId != "" && docId && docId == getDocumentData.document.refId) {
          var templateType = localStorage.getItem("templateType");
          const response = await request({
            url: `/document/update/${projectId}/${docId}/${templateType}`,
            body: state.updatedTreeData,
            method: "put",
          });
          commit("UNSET_TIMEOUT");
          //Taking autosave time from project appsetting.
          const project = getCurrentProject;
          let applicationSetting = await helper.getAppSettingForApplication(project);
          const autoSaveTime =
            applicationSetting && applicationSetting.settings
              ? applicationSetting.settings.autoSaveTime * 1000
              : 3000;
          commit("SET_INITIAL_TIMEOUT", autoSaveTime);
          // Ends here  
          if (response !== undefined) {
            if (response.data) {
              state.newDataSaved = true;
              setTimeout(() => {
                state.newDataSaved = false;
              }, 1000);
              if (
                payload &&
                payload.action &&
                payload.action == "lock" &&
                payload.fromEditor
              )
                state.nodeLockSuccess = true;
              dispatch(
                "snackbar/setSnackbar",
                {
                  message: "Auto saved",
                  color: "success",
                  timeout: 1000,
                },
                { root: true }
              );
            } else {
              if (payload && payload.action == "lock") state.lockError = true;
              if (payload && payload.action == "private")
                state.privateError = true;
            }
            if (response.error)
              dispatch(
                "snackbar/setSnackbar",
                {
                  message: "Error while auto saving",
                  color: "error",
                },
                { root: true }
              );
          }
        }
        state.isDocPropertyUpdate = false;
      }, initialTimeOut);
      commit("SET_TIMEOUT", timeoutId);
    },
    onInputFieldUpdate(
      {
        state,
        commit,
        dispatch,
        rootState: {
          modal: { searchText },
          tree: { documentTreeData },
        },
        getters: { getActiveNode },
      },
      { name, value }
    ) {
      if (
        getActiveNode === null &&
        name !== "documentProperties" &&
        name !== "coverPage"
      ) {
        return dispatch(
          "snackbar/setSnackbar",
          {
            message: "Please create file/folder.",
            color: "error",
          },
          { root: true }
        );
      }
      if (name === "documentProperties") {
        state.isDocPropertyUpdate = true;
        commit("ON_DOCUMENT_PROPERTIES_UPDATE", value);
        dispatch("autoSave");
      } else if (
        documentTreeData[getActiveNode] &&
        typeof documentTreeData[getActiveNode].data[name] !== "undefined"
      ) {
        if (!searchText) {
          commit("ON_INPUT_UPDATE", { name, value });
          dispatch("autoSave");
        }
      }
    },
    async fetchDocument({ commit, dispatch, rootState }) {
      const { docId, projectId } = router.currentRoute.params;
      var templateType = localStorage.getItem("templateType");

      //for documet fetch
      if (docId != "" && docId && docId != "id") {
        const response = await request({
          url: `/document/fetch/${projectId}/${docId}/${templateType}`,
          method: "get",
        });
        if (response.errors.length != 0 || response.data.length == 0) {
          commit("SET_DOC_FETCH_STATUS", false);
          return dispatch(
            "snackbar/setSnackbar",
            {
              message: "Error while fetching document",
              color: "error",
            },
            { root: true }
          );
        }
        commit("SET_DOC_FETCH_STATUS", true);
        commit("FETCH_DOCUMENT", {
          docData: response.data,
          currentUser: rootState.user.email
        });
      }
    },

    setFetchedDocDataFromSvn({ commit }, payload) {
      commit("SET_DOC_FETCH_STATUS", true);
      commit("FETCH_DOCUMENT", payload);
    },

    onDefaultNodeAddHandler({ commit, dispatch, rootState }, payload) {
      const { data } = payload;
      commit("ON_DEFAULT_NODE_CREATE", {
        data,
        currentUsername: rootState.user.name
      });
      dispatch("autoSave");
    },
    setCoverPageInstanceId({ commit, dispatch }, payload) {
      commit("SET_COVER_PAGE_INSTANCE_ID", payload);
      dispatch("autoSave");
    },
    onLoadTreeFromTemplate({ commit, dispatch }, payload) {
      commit("ON_LOAD_TREE_FROM_TEMPLATE", payload);
      dispatch("autoSave");
    },
    // todo: update tree node id and content
    onNodeCopyHandler({ commit, rootState }, data) {
      const { tree } = rootState;
      const { documentTreeData } = tree;
      if (!data) return;
      let copiedDocumentTreeData = {};
      const generateCopiedDocumentTreeData = nodeData => {
        const updateNodeData = new TreeNode({ ...nodeData, id: undefined });
        copiedDocumentTreeData[updateNodeData.id] = {
          ...documentTreeData[nodeData.id]
        };
        if (updateNodeData.children) {
          const children = [];
          for (let i = 0; i < nodeData.children.length; i++) {
            children.push(
              generateCopiedDocumentTreeData(updateNodeData.children[i])
            );
          }
          updateNodeData.children = children;
        }
        return updateNodeData;
      };
      const copiedNodeData = generateCopiedDocumentTreeData(
        new TreeNode(data.params)
      );
      const action = data.action;
      const params = data.params;
      commit("ON_NODE_COPY", {
        copiedNodeData,
        copiedDocumentTreeData,
        action,
        params
      });
    },
    onNodePasteHandler({ commit, dispatch }, { updatedTree }) {
      commit("ON_NODE_PASTE", newTree(updatedTree));
      dispatch("autoSave");
    },

    hightlightNode({ rootState }, payload) {
      const { tree } = rootState;
      const { documentTree } = tree;

      const checkChidrenNodes = children => {
        children.forEach(node => {
          const isMatched = payload.keys.some(id => id == node.id);
          if (isMatched) {
            node.includesSearch = payload.status;
          }
          if (node.children) checkChidrenNodes(node.children);
        });
      };
      documentTree.data.children[0].children.forEach(node => {
        const isMatched = payload.keys.some(id => id == node.id);
        if (isMatched) {
          node.includesSearch = payload.status;
        }
        if (node.children) checkChidrenNodes(node.children);
      });
    },
    removeHighlight({ rootState }) {
      const { tree } = rootState;
      const { documentTree } = tree;
      const checkChidrenNodes = children => {
        children.forEach(node => {
          node.includesSearch = false;
          if (node.children) checkChidrenNodes(node.children);
        });
      };

      documentTree.data.children[0].children.forEach(node => {
        node.includesSearch = false;
        if (node.children) checkChidrenNodes(node.children);
      });
    },
    resetNodeCut({ commit }) {
      commit("RESET_NODE_CUT");
    }
  },
  getters: {
    getDocumentProperties: (state) => state.documentProperties,
    getDocumentName: (state) => state.documentProperties.name,
    hasScrollbar: (state) => state.hasScrollbar,
    isDocFetchSuccess: (state) => state.isDocFetchSuccess,






    getNodeData: (state) =>
      state.currentDocumentItem
        ? state.documentTreeData[state.currentDocumentItem].data
        : {},
    getNodeMeta: state =>
      state.currentDocumentItem &&
        state.documentTreeData[state.currentDocumentItem]
        ? state.documentTreeData[state.currentDocumentItem].meta
        : {},
    getIsNodeLocked: (state, _getters, rootState) => {
      if (
        state.currentDocumentItem &&
        state.documentTreeData[state.currentDocumentItem]
      ) {
        const isLocked =
          state.documentTreeData[state.currentDocumentItem].meta.lockedBy !==
          null;
        if (isLocked) {
          return (
            state.documentTreeData[state.currentDocumentItem].meta.lockedBy
              .id !== rootState.user.id
          );
        }
        return false;
      }
    },
    getDocumentTree: (state) => state.documentTree.data,
    getActiveNode: (state) => state.currentDocumentItem,
    getRootNode: (state) => state.rootNode,
    getDocumentDataCount: (state) => {
      let documentCountData = {};
      Object.values(state.documentTreeData).forEach(({ meta }) => {
        let { extension } = meta;
        if (!extension) extension = "section";
        documentCountData = {
          ...documentCountData,
          [extension]: (documentCountData[extension] || 0) + 1,
        };
      });
      return documentCountData;
    },
    IsDiscussionFromNode: (state) => state.discussFromNode,
    isDocReadOnly: state => state.readonly,
    getReasonForDocDisable: state => state.reasonForDocDisable,
    getDocumentTreeData: (state) => state.documentTreeData,
    getCopiedNode: (state) => state.copiedNode,
    getCurrentProject: state => state.currentProject,
    // lockEditViewAutomatically: state => state.lockEditViewAutomatically,
    getDocumentData: (state) => {
      const {
        documentTree: { data },
        documentTreeData,
        documentProperties,
        coverPageInstanceId,
        version,
        refId,
        _key
      } = state;
      const document = {};
      document.tree = data.toString();
      document.dataFiles = [];
      document.properties = documentProperties;
      document.coverPageInstanceId = coverPageInstanceId;
      document.version = version;
      document.refId = refId
      document._key = _key
      const documentData = [];
      const path = window.location.href;
      const docId = path.split("/")[6];

      Object.keys(documentTreeData).forEach((dataKey) => {
        if (dataKey != "toc" && dataKey != "tof" && dataKey != "tot") {
          documentData.push({
            data: documentTreeData[dataKey].data,
            meta: documentTreeData[dataKey].meta,
            //maintain this sequence for commit changes
            id: dataKey,
            docId: docId,
            _key: dataKey,
          });
          document.dataFiles.push(dataKey);
        }
      });
      return { document, documentData };
    },
  },
};
