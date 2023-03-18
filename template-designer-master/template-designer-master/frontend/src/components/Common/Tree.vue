<template>
  <div>
    <vue-tree-list
      @add-node="onNodeAdd"
      @click="onNodeClick"
      @change-name="onNodeChangeName"
      @delete-node="onNodeDelete"
      @drop="onNodeDrop"
      @drop-before="dropBefore"
      @drop-after="dropAfter"
      @node-lock="onNodeLock"
      @node-visibilty="onNodeVisibilityChange"
      @node-copy="onNodeCopy"
      @node-paste="onNodePaste"
      :model="model"
      :default-expanded="true"
      :default-tree-node-name="'section'"
      :default-leaf-node-name="defaultLeafNodeName"
    >
      <span class="icon" slot="addTreeNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-folder-plus</v-icon
        >Add Section
      </span>
      <span class="icon" slot="addLeafNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-file-plus</v-icon>
        Add
        {{ defaultLeafNodeName }}
      </span>
      <span class="icon" slot="selectCoverPage">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-file</v-icon>Select
        Cover Page
      </span>
      <span class="icon" slot="cutNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-content-cut</v-icon
        >Cut
      </span>
      <span class="icon" slot="copyNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3"
          >mdi-content-copy</v-icon
        >Copy
      </span>
      <span class="icon" slot="pasteNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3"
          >mdi-content-paste</v-icon
        >Paste <span class="ml-8" style="color: rgba(0, 0, 0, 0.54)">></span>
      </span>
      <span class="icon" slot="editNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3"
          >mdi-border-color</v-icon
        >Rename
      </span>
      <span class="icon" slot="delNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-delete</v-icon
        >Delete
      </span>
      <span class="icon" slot="undoNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-undo</v-icon>Undo
      </span>
      <span class="icon" slot="redoNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-redo</v-icon>Redo
      </span>
      <span class="icon" slot="lockNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-lock</v-icon>Lock
      </span>
      <span class="icon" slot="unlockNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-lock-open</v-icon
        >Unlock
      </span>
      <span class="icon" slot="privateNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-eye-off</v-icon
        >Private
      </span>
      <span class="icon" slot="publicNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3">mdi-eye</v-icon>Public
      </span>
      <span class="icon" slot="exportNodeIcon">
        <v-icon color="rgba(0, 0, 0, 0.54)" class="mr-3"
          >mdi-export-variant</v-icon
        >Export
      </span>
      <span class="icon" slot="leafNodeIcon">
        <v-icon>mdi-file</v-icon>
      </span>
      <span class="icon" slot="treeNodeIcon">
        <v-icon>mdi-folder</v-icon>
      </span>
      <span class="icon" slot="folderOpen">
        <v-icon>mdi-folder-open</v-icon>
      </span>
      <span class="icon" slot="leafNodeLockIcon">
        <v-icon>mdi-file-lock</v-icon>
      </span>
      <span class="icon" slot="treeNodeLockIcon">
        <v-icon>mdi-folder-lock</v-icon>
      </span>
      <span class="icon" slot="leafNodeVisibilityIcon">
        <v-icon>mdi-file-eye</v-icon>
      </span>
      <span class="icon" slot="treeNodeVisibilityIcon">
        <v-icon>mdi-folder-eye</v-icon>
      </span>
    </vue-tree-list>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import { VueTreeList } from "../TreeListView";
export default {
  components: {
    VueTreeList,
  },
  computed: {
    ...mapGetters({
      model: "tree/getDocumentTree",
      currentUser: "getUser",
      documentProperties: "tree/getDocumentProperties",
      documentTreeData: "tree/getDocumentTreeData",
      documentTree: "tree/getDocumentTree",
    }),
    defaultLeafNodeName() {
      var extension = localStorage.getItem("templateType");
      if (extension == "CONOPS" || extension == "Conops") extension = "Conops";
      extension = extension.split(" ").join("");
      return extension;
    },
  },
  methods: {
    ...mapActions({
      onNodeRedoHandler: "tree/onNodeRedoHandler",
      onNodeAddHandler: "tree/onNodeAddHandler",
      onNodeSelectHandler: "tree/onNodeSelectHandler",
      onNodeDeleteHandler: "tree/onNodeDeleteHandler",
      onNodeUpdateHandler: "tree/onNodeUpdateHandler",
      onNodeLockHandler: "tree/onNodeLockHandler",
      onNodeVisibilityChangeHandler: "tree/onNodeVisibilityChangeHandler",
      onNodeCopyHandler: "tree/onNodeCopyHandler",
      onNodePasteHandler: "tree/onNodePasteHandler",
      onInputFieldUpdate: "tree/onInputFieldUpdate",
    }),
    async onNodeDelete(params, action) {
      params.remove();
      this.onNodeDeleteHandler({
        action: action,
        deletedNode: params,
        updatedTree: this.getUpdateTree(params),
      });
      this.changeModelName();
      await this.nodeRename();
    },
    onNodeChangeName(params) {
      if (params.node.id == 1) {
        this.properties = this.documentProperties;
        this.properties.name = params.newName;
        this.onInputFieldUpdate({
          name: "documentProperties",
          value: this.properties,
        });
        return;
      }
      this.onNodeUpdateHandler({
        data: { id: params.id, name: params.newName },
        updatedTree: this.getUpdateTree(params.node),
      });
      if (!params.nodeNumbering) {
        this.changeModelName();
        this.nodeRename();
      }
    },
    onNodeCopy(params, action) {
      this.onNodeCopyHandler({ params, action });
    },
    async onNodePaste(params) {
      var extension = this.$route.fullPath.split("/")[2].split("-")[0];
      await this.onNodePasteHandler({
        newNode: params,
        updatedTree: this.getUpdateTree(params),
        ...(params.isLeaf ? { extension } : {}),
      });

      this.changeModelName();
      await this.nodeRename();
    },
    // onNodeRevert() {
    //   const { projectId, docId } = this.$route.params;
    //   this.$router
    //     .push({
    //       path: `/project/${this.getOptionModal.applicationPathName}/${projectId}/${docId}/compare`
    //     })
    //     .catch(() => {});
    // },

    async onNodeAdd(params) {
      var extension = localStorage.getItem("templateType");
      extension = extension.split(" ").join("");
      this.onNodeAddHandler({
        newNode: params,
        updatedTree: this.getUpdateTree(params),
        ...(params.isLeaf ? { extension } : {}),
      });
      this.changeModelName();
      await this.nodeRename();
      /** Undo-Redo */
      /* setTimeout(() => {
        this.updateRootNodeState();
      }, 500); */
    },
    async nodeRename() {
      const { documentTree } = this;
      const childrenNodes =
        documentTree.children && documentTree.children[0].children;
      var indexCount = 0;
      childrenNodes.forEach(({ id, children, name, isLeaf }, index) => {
        if (
          name != "Cover Page" &&
          name != "History" &&
          id != "toc" &&
          id != "tof" &&
          id != "tot" &&
          !isLeaf
        ) {
          indexCount++;
          var newName = name.substr(name.indexOf(" ") + 1);
          newName = `${indexCount}.0 ${newName}`;
          this.onNodeChangeName({
            id: id,
            oldName: name,
            newName: newName,
            node: childrenNodes[index],
            eventType: "blur",
            nodeNumbering: true,
          });
          this.childrenNodeRename(children, indexCount);
        }
      });
      await Promise.all(childrenNodes);
    },
    changeModelName() {
      var indexCount = 0;
      this.model.children[0].children.forEach(
        ({ id, children, name, isLeaf }, index) => {
          if (
            name != "Cover Page" &&
            name != "History" &&
            id != "toc" &&
            id != "tof" &&
            id != "tot" &&
            !isLeaf
          ) {
            indexCount++;
            var newName = name.substr(name.indexOf(" ") + 1);
            this.model.children[0].children[
              index
            ].name = `${indexCount}.0 ${newName}`;
          }
          this.changeChildrenModelName(children, indexCount);
        }
      );
    },
    changeChildrenModelName(first_children, section) {
      let sectionCount = 0;
      first_children.forEach(({ children, isLeaf }, index) => {
        if (!isLeaf) {
          const sectionNumber = `${section}.${++sectionCount}`;
          var newName = first_children[index].name.substr(
            first_children[index].name.indexOf(" ") + 1
          );
          first_children[index].name = `${sectionNumber} ${newName}`;
          if (children && children.length)
            this.changeChildrenModelName(children, sectionNumber);
        }
      });
    },
    async childrenNodeRename(first_children, section) {
      const { documentTreeData } = this;
      let sectionCount = 0;
      first_children.forEach(({ id, children, isLeaf }, index) => {
        if (!isLeaf) {
          const { meta } = documentTreeData[id];
          var newName = meta.name.substr(meta.name.indexOf(" ") + 1);
          const sectionNumber = `${section}.${++sectionCount}`;
          newName = `${sectionNumber} ${newName}`;
          this.onNodeChangeName({
            id: id,
            oldName: meta.name,
            newName: newName,
            node: first_children[index],
            eventType: "blur",
            nodeNumbering: true,
          });
          if (children && children.length) {
            this.childrenNodeRename(children, sectionNumber);
          }
        }
      });
      await Promise.all(first_children);
    },
    onNodeClick(params) {
      this.onNodeSelectHandler(params);
    },
    async onNodeDrop(params) {
      const { node, nodeIds, lockedBy, privateFor } = params;
      this.onNodeDropHandler({
        updatedTree: this.getUpdateTree(node),
        nodeIds: nodeIds,
        lockedBy: lockedBy,
        privateFor: privateFor,
      });
      //New-Update
      this.changeModelName();
      await this.nodeRename();
      /** Undo-Redo */
      /* setTimeout(() => {
        this.updateRootNodeState();
      }, 500); */
    },

    /** Undo-Redo */
    /* onNodeRedo(params) {
      this.checkCurrentPath();
      this.onNodeRedoHandler(params);
    },
    onNodeUndo(params) {
      this.checkCurrentPath();
      this.onNodeUndoHandler(params);
    }, */
    // openDiscussion() {
    //   const { projectId, docId } = this.$route.params;
    //   this.$router
    //     .push({
    //       path: `/project/${
    //         this.getoptionModal.applicationPathName
    //       }/${projectId}/${docId}/discussion/${true}`
    //     })
    //     .catch(() => {});
    // },

    onNodeLock(params, fromEditor) {
      this.onNodeLockHandler({ params, fromEditor });
    },
    async onNodeVisibilityChange(params) {
      await this.onNodeVisibilityChangeHandler(params);
    },
    dropBefore: function ({ node, src, target }) {
      return { node, src, target };
    },
    dropAfter: function ({ node, src, target }) {
      return { node, src, target };
    },
    getTree() {
      var vm = this;
      function _dfs(oldNode) {
        var newNode = {};
        for (var k in oldNode)
          if (k !== "children" && k !== "parent") newNode[k] = oldNode[k];

        if (oldNode.children && oldNode.children.length > 0) {
          newNode.children = [];
          for (var i = 0, len = oldNode.children.length; i < len; i++)
            newNode.children.push(_dfs(oldNode.children[i]));
        }
        return newNode;
      }
      return _dfs(vm.model).children[0];
    },
    getUpdateTree(node) {
      let updatedTree = node;
      while (updatedTree.id !== 0) {
        updatedTree = updatedTree.parent;
      }
      return updatedTree;
    },
  },
};
</script>
<style lang="less">
.vtl {
  .vtl-disabled {
    background-color: #d0cfcf;
  }
}
</style>

<style lang="less" scoped>
.icon {
  &:hover {
    cursor: pointer;
  }
}

.muted {
  color: gray;
  font-size: 80%;
}
</style>
