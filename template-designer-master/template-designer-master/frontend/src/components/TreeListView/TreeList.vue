<template>
  <div class="vtl">
    <div
      v-if="model.name !== 'root' && !model.hide"
      :id="model.id"
      class="vtl-node"
      :class="{ 'vtl-leaf-node': model.isLeaf, 'vtl-tree-node': !model.isLeaf }"
    >
      <div class="vtl-border vtl-up" :class="{ 'vtl-active': isDragEnterUp }" />
      <div
        :class="[
          ...treeNodeClass,
          {
            active:
              (activeNode && model.id === activeNode) ||
              (rootNodeId && rootNodeId === model.id),
          },
          {
            rootNodeActive: rootNodeId && rootNodeId !== model.id,
          },
          {
            highlight: model.includesSearch === true,
          },
        ]"
        :draggable="!model.dragDisabled"
        @dragstart="dragStart"
        @dragover="dragOver"
        @dragenter="dragEnter"
        @dragleave="dragLeave"
        @drop="drop"
        @dragend="dragEnd"
        @contextmenu.prevent="mouseOver"
        v-click-outside="mouseOut"
        @click.stop="click"
      >
        <span v-if="model.isLeaf">
          <slot
            :name="leafIcon"
            :expanded="expanded"
            :model="model"
            :root="rootNode"
          >
            <i class="vtl-icon vtl-menu-icon vtl-icon-file"></i>
          </slot>
        </span>
        <span v-else @click.prevent.stop="toggle">
          <slot
            :name="nodeIcon"
            :expanded="expanded"
            :model="model"
            :root="rootNode"
          >
            <i class="vtl-icon vtl-menu-icon vtl-icon-folder"></i>
          </slot>
        </span>

        <div class="vtl-node-content" v-if="!editable">
          <slot
            name="leafNameDisplay"
            :expanded="expanded"
            :model="model"
            :root="rootNode"
            >{{ model.name }}</slot
          >
        </div>
        <input
          v-else
          class="vtl-input"
          type="text"
          ref="nodeInput"
          :value="model.name"
          @input="updateName"
          @blur="setUnEditable"
        />
        <div
          id="context-menu"
          class="vtl-context"
          v-show="isHover"
          elevation="5"
        >
          <div
            class="vtl-context-item"
            @click.stop.prevent="addChild(false)"
            v-if="canAddNode(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="addTreeNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            >
              <i class="vtl-icon vtl-icon-folder-plus-e"></i>
            </slot>
          </div>
          <div
            class="vtl-context-item"
            @click.stop.prevent="addChild(true)"
            v-if="canAddLeaf(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="addLeafNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            >
              <i class="vtl-icon vtl-icon-plus"></i>
            </slot>
          </div>
          <div
            class="vtl-context-item"
            @click.stop.prevent="cutNodeAction"
            v-if="canCut(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="cutNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            />
          </div>
          <div
            class="vtl-context-item"
            @click.stop.prevent="copyNodeAction"
            v-if="canCopy(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="copyNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            />
          </div>
          <div
            class="vtl-context-item"
            v-if="canPaste(model)"
            @mouseover="isHoveredOnPaste = true"
            :class="!getCopiedNode ? 'disableMenuItem' : ''"
          >
            <slot
              name="pasteNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            />
          </div>
          <div
            class="vtl-context-item"
            @click.stop.prevent="setEditable"
            v-if="canEdit(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="editNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            >
              <i class="vtl-icon vtl-icon-edit"></i>
            </slot>
          </div>
          <div
            class="vtl-context-item"
            @click.stop.prevent="delNode"
            v-if="canDelete(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="delNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            >
              <i class="vtl-icon vtl-icon-trash"></i>
            </slot>
          </div>
          <div
            class="vtl-context-item"
            @click.stop.prevent="openDiscussion"
            v-if="canDiscuss(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="discussNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            >
            </slot>
          </div>
          <div
            class="vtl-context-item"
            @click.stop.prevent="lockNodeAction(true)"
            v-if="canLock(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="lockNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            />
          </div>
          <div
            class="vtl-context-item"
            @click.stop.prevent="lockNodeAction(false)"
            v-if="canUnlock(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="unlockNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            />
          </div>

          <div
            class="vtl-context-item"
            @click.stop.prevent="nodeVisibiltyAction(false)"
            v-if="isPrivate(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="privateNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            />
          </div>
          <div
            class="vtl-context-item"
            @click.stop.prevent="nodeVisibiltyAction(true)"
            v-if="isPublic(model)"
            @mouseover="isHoveredOnPaste = false"
          >
            <slot
              name="publicNodeIcon"
              :expanded="expanded"
              :model="model"
              :root="rootNode"
            />
          </div>
        </div>
      </div>

      <div
        v-if="model.children && model.children.length > 0 && expanded"
        class="vtl-border vtl-bottom"
        :class="{ 'vtl-active': isDragEnterBottom }"
        @drop="dropAfter"
        @dragenter="dragEnterBottom"
        @dragover="dragOverBottom"
        @dragleave="dragLeaveBottom"
      ></div>
    </div>

    <div
      :class="{ 'vtl-tree-margin': model.name !== 'root' }"
      v-show="model.name === 'root' || expanded"
      v-if="isFolder"
    >
      <item
        v-for="model in model.children"
        :default-tree-node-name="defaultTreeNodeName"
        :default-leaf-node-name="defaultLeafNodeName"
        :default-expanded="defaultExpanded"
        :model="model"
        :key="model.id"
        v-show="canRenderNode(model)"
      >
        <template v-slot:leafNameDisplay="slotProps">
          <slot name="leafNameDisplay" v-bind="slotProps" />
        </template>
        <template v-slot:addTreeNodeIcon="slotProps">
          <slot name="addTreeNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:addLeafNodeIcon="slotProps">
          <slot name="addLeafNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:cutNodeIcon="slotProps">
          <slot name="cutNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:copyNodeIcon="slotProps">
          <slot name="copyNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:pasteNodeIcon="slotProps">
          <slot name="pasteNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:editNodeIcon="slotProps">
          <slot name="editNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:delNodeIcon="slotProps">
          <slot name="delNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:undoNodeIcon="slotProps">
          <slot name="undoNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:redoNodeIcon="slotProps">
          <slot name="redoNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:discussNodeIcon="slotProps">
          <slot name="discussNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:lockNodeIcon="slotProps">
          <slot name="lockNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:unlockNodeIcon="slotProps">
          <slot name="unlockNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:privateNodeIcon="slotProps">
          <slot name="privateNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:publicNodeIcon="slotProps">
          <slot name="publicNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:revertNodeIcon="slotProps">
          <slot name="revertNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:revertToBaselineNodeIcon="slotProps">
          <slot name="revertToBaselineNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:exportNodeIcon="slotProps">
          <slot name="exportNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:leafNodeIcon="slotProps">
          <slot name="leafNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:treeNodeIcon="slotProps">
          <slot name="treeNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:folderOpen="slotProps">
          <slot name="folderOpen" v-bind="slotProps" />
        </template>
        <template v-slot:leafNodeLockIcon="slotProps">
          <slot name="leafNodeLockIcon" v-bind="slotProps" />
        </template>
        <template v-slot:treeNodeLockIcon="slotProps">
          <slot name="treeNodeLockIcon" v-bind="slotProps" />
        </template>
        <template v-slot:leafNodeVisibilityIcon="slotProps">
          <slot name="leafNodeVisibilityIcon" v-bind="slotProps" />
        </template>
        <template v-slot:treeNodeVisibilityIcon="slotProps">
          <slot name="treeNodeVisibilityIcon" v-bind="slotProps" />
        </template>
      </item>
    </div>
  </div>
</template>

<script>
import { TreeNode } from "./Tree.js";
import { addHandler, removeHandler } from "./tools.js";
import { mapGetters } from "vuex";

let compInOperation = null;

export default {
  name: "vue-tree-list",
  data: function () {
    return {
      isHoveredOnPaste: false,
      menu_class: "vtl-context",
      isHover: false,
      editable: false,
      isDragEnterUp: false,
      isDragEnterBottom: false,
      isDragEnterNode: false,
      expanded: this.defaultExpanded,
    };
  },
  /* components: {
    SelectCoverPageDesign
  }, */
  props: {
    model: {
      type: Object,
    },
    defaultLeafNodeName: {
      type: String,
      default: "New leaf node",
    },
    defaultTreeNodeName: {
      type: String,
      default: "New tree node",
    },
    defaultExpanded: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    "$route.path"() {
      if (
        this.$route.name == "DocView" &&
        (this.model.id == "toc" ||
          this.model.id == "tof" ||
          this.model.id == "tot")
      ) {
        this.model.hide = false;
      } else if (
        this.$route.name != "DocView" &&
        (this.model.id == "toc" ||
          this.model.id == "tof" ||
          this.model.id == "tot")
      ) {
        this.model.hide = true;
      }
    },
  },
  computed: {
    ...mapGetters({
      currentUser: "getUser",
      activeNode: "tree/getActiveNode",
      rootNodeId: "tree/getRootNode",
      getDocumentDataCount: "tree/getDocumentDataCount",
      getCopiedNode: "tree/getCopiedNode",
      nodeMeta: "tree/getNodeMeta",
      hasScrollbar: "tree/hasScrollbar",
     
    }),
    nodeIcon() {
      const { lockedBy, privateFor } = this.model;
      if (lockedBy) return "treeNodeLockIcon";
      else if (privateFor) return "treeNodeVisibilityIcon";
      else if (this.expanded || this.model.children.length == 0)
        return "folderOpen";
      else return "treeNodeIcon";
    },
    leafIcon() {
      const { lockedBy, privateFor } = this.model;
      if (lockedBy) return "leafNodeLockIcon";
      else if (privateFor) return "leafNodeVisibilityIcon";
      else return "leafNodeIcon";
    },
    rootNode() {
      let node = this.$parent;
      while (
        node._props &&
        node._props.model &&
        node._props.model.name !== "root"
      )
        node = node.$parent;
      return node;
    },
    caretIcon() {
      return !this.expanded ? "mdi-plus" : "mdi-minus";
    },
    isFolder() {
      return this.model.children && this.model.children.length;
    },
    treeNodeClass() {
      const {
        model: { dragDisabled, disabled },
        isDragEnterNode,
      } = this;
      return [
        { "vtl-node-main": true },
        { "vtl-container": true },
        { "vtl-active": isDragEnterNode },
        { "vtl-drag-disabled": dragDisabled },
        { "vtl-disabled": disabled },
      ];
    },
  },
  beforeCreate() {
    this.$options.components.item = require("./TreeList").default;
  },
  mounted() {
    const vm = this;
    addHandler(window, "keyup", function (e) {
      if ((e.keyCode === 13 || e.keyCode === 113) && vm.editable) {
        // click enter
        vm.editable = false;
      }
    });
    if (
      !this.$route.path.includes("/doc") &&
      (this.model.id == "toc" ||
        this.model.id == "tof" ||
        this.model.id == "tot")
    )
      this.model.hide = true;
    else this.model.hide = false;
  },
  beforeDestroy() {
    removeHandler(window, "keyup");
  },
  methods: {
    canAddLeaf(model) {
      var docType = localStorage.getItem("templateType");
      return (
        !model.isLeaf &&
        !model.addLeafNodeDisabled &&
        !model.lockedBy &&
        model.id !== 1 &&
        model.id !== 0 &&
        this.$route.fullPath.split("/")[2].split("-")[0] != "quality" &&
        docType != "Conops"
      );
    },
    canAddNode(model) {
      return !model.isLeaf && !model.addTreeNodeDisabled && !model.lockedBy;
    },
    canEdit(model) {
      return !model.editNodeDisabled && !model.lockedBy;
    },
    canDelete(model) {
      return !model.delNodeDisabled && !model.lockedBy;
    },
    canDiscuss() {
      return true;
    },
    canUndo(model) {
      return !model.lockedBy;
    },
    canCopy(model) {
      return (
        !model.lockedBy &&
        !model.privateFor &&
        model.id !== 1 &&
        model.id !== 0 &&
        model.name !== "Cover Page"
      );
    },
    canCut(model) {
      return (
        !model.lockedBy &&
        !model.privateFor &&
        model.id !== 1 &&
        model.id !== 0 &&
        model.name !== "Cover Page"
      );
    },
    canPaste(model) {
      return (
        !model.lockedBy &&
        !model.privateFor &&
        model.id !== 0 &&
        !model.isLeaf &&
        model.id !== 1 &&
        model.name !== "Cover Page"
      );
    },
    canRedo(model) {
      return !model.lockedBy;
    },
    canLock(model) {
      return !model.editNodeDisabled && !model.lockedBy && !model.privateFor;
    },
    canUnlock(model) {
      return !model.editNodeDisabled && !!model.lockedBy;
    },
    isPrivate(model) {
      return !model.editNodeDisabled && !model.privateFor && !model.lockedBy;
    },
    isPublic(model) {
      return (
        !model.editNodeDisabled &&
        !!model.privateFor &&
        !model.lockedBy &&
        !model.parent.privateFor
      );
    },
    canRevert(model) {
      return model.id !== 1;
    },
    canExport(model) {
      return model.id === 1;
    },
    canRenderNode(model) {
      const isSection = model.extension === undefined;
      const isRequiredNode =
        !isSection && model.extension === this.defaultLeafNodeName;
      return (
        (!model.privateFor || model.privateFor.id === this.currentUser.id) &&
        (isSection || isRequiredNode)
      );
    },
    updateName(e) {
      var oldName = this.model.name;
      this.model.changeName(e.target.value);
      this.rootNode.$emit("change-name", {
        id: this.model.id,
        oldName: oldName,
        newName: e.target.value,
        node: this.model,
      });
      this.mouseOut();
    },

    delNode() {
      this.rootNode.$emit("delete-node", this.model);
      this.mouseOut();
    },
    openDiscussion() {
      this.rootNode.$emit("open-discussion", this.model);
    },
    setEditable() {
      this.editable = true;
      this.$nextTick(() => {
        const $input = this.$refs.nodeInput;
        $input.focus();
        $input.setSelectionRange(0, $input.value.length);
      });
      this.mouseOut();
    },

    setUnEditable(e) {
      this.editable = false;
      var oldName = this.model.name;
      this.model.changeName(e.target.value);
      this.rootNode.$emit("change-name", {
        id: this.model.id,
        oldName: oldName,
        newName: e.target.value,
        eventType: "blur",
        node: this.model,
      });
    },

    toggle() {
      if (this.isFolder) {
        this.expanded = !this.expanded;
      }
    },

    mouseOver() {
      if (localStorage.getItem("subDocType") != "Status") {
        if (this.model.disabled) return;
        if (this.model.disableMenu) return;
        this.hasScrollbar
          ? (this.menu_class = "vtl-context-top")
          : (this.menu_class = "vtl-context");
        if (this.model.id == "1" || this.model.name == "Cover Page")
          this.menu_class = "vtl-context";
        this.isHover = true;
      }
    },

    mouseOut() {
      this.isHover = false;
    },

    click() {
      this.rootNode.$emit("click", this.model);
    },
    // todo : change node naming
    addChild(isLeaf) {
      const name = isLeaf ? this.defaultLeafNodeName : this.defaultTreeNodeName;
      const nodeCount = this.getDocumentDataCount[name || "section"] + 1 || 1;
      this.expanded = true;
      const node = new TreeNode({
        name: `${name}-${nodeCount}`,
        isLeaf,
        lockedBy: null,
        privateFor: null,
        ...(!isLeaf ? {} : { extension: this.defaultLeafNodeName }),
      });
      this.model.addChildren(node);
      this.rootNode.$emit("add-node", node);
      this.mouseOut();
      if (node.parent.privateFor)
        this.nodeChildrenVisibiltyChange(node, node.parent.privateFor);
    },
    dragStart(e) {
      if (this.model.lockedBy) return;
      if (!(this.model.dragDisabled || this.model.disabled)) {
        compInOperation = this;
        // for firefox
        e.dataTransfer.setData("data", "data");
        e.dataTransfer.effectAllowed = "move";
        return true;
      }
      return false;
    },
    dragEnd() {
      compInOperation = null;
    },
    dragOver(e) {
      e.preventDefault();
      return true;
    },
    dragEnter() {
      if (!compInOperation) return;
      if (
        compInOperation.model.id === this.model.id ||
        !compInOperation ||
        this.model.isLeaf
      )
        return;
      this.isDragEnterNode = true;
    },
    dragLeave() {
      this.isDragEnterNode = false;
    },
    drop() {
      if (this.model.lockedBy) return;
      if (!compInOperation) return;
      const oldParent = compInOperation.model.parent;
      compInOperation.model.moveInto(this.model);
      this.isDragEnterNode = false;
      const target = this.model;
      const node = compInOperation.model;
      this.rootNode.$emit("drop", {
        target,
        node,
        src: oldParent,
      });

      if (
        JSON.stringify(node.privateFor) !== JSON.stringify(target.privateFor)
      ) {
        this.nodeChildrenVisibiltyChange(
          compInOperation.model,
          this.model.privateFor
        );
      }
    },

    dragEnterUp() {
      if (!compInOperation) return;
      this.isDragEnterUp = true;
    },
    dragOverUp(e) {
      e.preventDefault();
      return true;
    },
    dragLeaveUp() {
      if (!compInOperation) return;
      this.isDragEnterUp = false;
    },
    dropBefore() {
      if (!compInOperation) return;
      const oldParent = compInOperation.model.parent;
      compInOperation.model.insertBefore(this.model);
      this.isDragEnterUp = false;
      this.rootNode.$emit("drop-before", {
        target: this.model,
        node: compInOperation.model,
        src: oldParent,
      });
    },

    dragEnterBottom() {
      if (!compInOperation) return;
      this.isDragEnterBottom = true;
    },
    dragOverBottom(e) {
      e.preventDefault();
      return true;
    },
    dragLeaveBottom() {
      if (!compInOperation) return;
      this.isDragEnterBottom = false;
    },
    dropAfter() {
      if (!compInOperation) return;
      const oldParent = compInOperation.model.parent;
      compInOperation.model.insertAfter(this.model);
      this.isDragEnterBottom = false;
      this.rootNode.$emit("drop-after", {
        target: this.model,
        node: compInOperation.model,
        src: oldParent,
      });
    },
    undoNodeAction() {
      this.rootNode.$emit("node-undo", this.model.id);
    },
    redoNodeAction() {
      this.rootNode.$emit("node-redo", this.model.id);
    },
    lockNodeChildrenAction(childNode, lockedByUser) {
      if (childNode.lockedBy && lockedByUser) return;
      else if (
        childNode.lockedBy &&
        !lockedByUser &&
        childNode.lockedBy.id !== this.currentUser.id
      )
        return;
      else if (!childNode.lockedBy && !lockedByUser) return;
      if (!childNode.isLeaf && childNode.children)
        childNode.children.forEach((child) =>
          this.lockNodeChildrenAction(child, lockedByUser)
        );
      childNode.changeNodeAccess(lockedByUser);
      this.rootNode.$emit("node-lock", childNode);
    },
    lockNodeAction(canLock) {
      if (this.model.lockedBy && this.model.lockedBy.id !== this.currentUser.id)
        return;
      if (canLock) {
        const lockedByUser = {
          name: this.currentUser.name,
          id: this.currentUser.id,
        };
        this.model.changeNodeAccess(lockedByUser);
        if (!this.model.isLeaf && this.model.children)
          this.model.children.forEach((child) =>
            this.lockNodeChildrenAction(child, lockedByUser)
          );
      } else {
        this.model.changeNodeAccess(null);
        if (!this.model.isLeaf && this.model.children)
          this.model.children.forEach((child) =>
            this.lockNodeChildrenAction(child, null)
          );
      }
      this.rootNode.$emit("node-lock", this.model);
      this.mouseOut();
    },
    nodeChildrenVisibiltyChange(childNode, visibilityChangedBy) {
      if (childNode.privateFor && visibilityChangedBy) return;
      if (!childNode.isLeaf && childNode.children) {
        childNode.children.forEach((child) =>
          this.nodeChildrenVisibiltyChange(child, visibilityChangedBy)
        );
      }
      childNode.changeNodeVisibilty(visibilityChangedBy);
      this.rootNode.$emit("node-visibilty", this.model);
    },
    nodeVisibiltyAction(isVisible) {
      if (
        this.model.privateFor &&
        this.model.privateFor.id !== this.currentUser.id
      )
        return;
      if (this.model.privateFor && isVisible && this.model.parent.privateFor)
        return;
      if (!isVisible) {
        const visibilityChangedBy = {
          name: this.currentUser.name,
          id: this.currentUser.id,
        };
        this.model.changeNodeVisibilty(visibilityChangedBy);
        if (!this.model.isLeaf && this.model.children)
          this.model.children.forEach((child) =>
            this.nodeChildrenVisibiltyChange(child, visibilityChangedBy)
          );
      } else {
        this.model.changeNodeVisibilty(null);
        if (!this.model.isLeaf && this.model.children)
          this.model.children.forEach((child) =>
            this.nodeChildrenVisibiltyChange(child, null)
          );
      }
      this.rootNode.$emit("node-visibilty", this.model);
      this.mouseOut();
    },
    revertNode() {
      this.rootNode.$emit("node-revert", this.model);
    },
    exportNodeAction() {
      this.mouseOut();
    },
    copyNodeAction() {
      this.rootNode.$emit("node-copy", this.model);
      this.mouseOut();
    },
    cutNodeAction() {
      // old-logic
      /* const cutNode = new TreeNode({ ...this.model, parent: null });
      this.rootNode.$emit("delete-node", this.model);
      this.rootNode.$emit("node-copy", cutNode);
      this.mouseOut(); */

      // new-logic
      this.rootNode.$emit("node-copy", this.model);
      this.rootNode.$emit("delete-node", this.model);
      this.mouseOut();
    },
    pasteNodeAction() {
      if (!this.model.isLeaf && this.getCopiedNode) {
        const newNode = new TreeNode({
          ...this.getCopiedNode,
          id: this.getCopiedNode.id,
        });
        this.model.addChildren(newNode);
        this.rootNode.$emit("node-paste", this.model);
      }
      this.mouseOut();
    },
  },
};
</script>

<style lang="less">
.vtl-node-content {
  margin: 7px 20px 0px 5px;
  /*  &:hover {
    background-color: lightgray;
  } */
}
.vtl-icon {
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;

  /* Better Font Rendering =========== */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  &.vtl-menu-icon {
    margin-right: 4px;
    &:hover {
      color: inherit;
    }
  }
  &:hover {
    color: blue;
  }
}

.vtl-icon-file:before {
  content: "\e906";
}
.vtl-icon-folder:before {
  content: "\e907";
}
.vtl-icon-caret-down:before {
  content: "\e901";
}
.vtl-icon-caret-right:before {
  content: "\e900";
}
.vtl-icon-edit:before {
  content: "\e902";
}
.vtl-icon-folder-plus-e:before {
  content: "\e903";
}
.vtl-icon-plus:before {
  content: "\e904";
}
.vtl-icon-trash:before {
  content: "\e905";
}

.vtl-border {
  height: 5px;
  &.vtl-up {
    margin-top: -2px;
    background-color: transparent;
  }
  &.vtl-bottom {
    background-color: transparent;
  }
  &.vtl-active {
    border-bottom: 3px dashed blue;
    //background-color: blue;
  }
}

.vtl-node-main {
  display: flex;
  align-items: center;
  padding: 5px 0 5px 1rem;
  position: relative;
  white-space: nowrap;
  .vtl-input {
    border: none;
    /* max-width: 150px; */
    border-bottom: 1px solid blue;
  }
  &:hover {
    background-color: #f0f0f0;
    width: fit-content;
  }
  &.active {
    background-color: #1976d2;
    color: white;
    width: fit-content;
  }
  &.rootNodeActive {
    background-color: inherit;
    color: currentColor;
  }
  &.highlight {
    background-color: yellow;
    color: currentColor;
    width: fit-content;
  }
  &.vtl-active {
    outline: 2px dashed pink;
  }
  .vtl-caret {
    margin-left: -1rem;
  }
  .vtl-operation {
    margin-left: 2rem;
    letter-spacing: 1px;
  }
  .vtl-context {
    padding: 5px 10px;
    background-color: rgb(60, 60, 60);
    position: absolute;
    left: 50px;
    top: 80%;
    width: 220px;
    z-index: 10;
    width: fit-content;
    word-wrap: break-word;
  }
  .vtl-context-top {
    padding: 5px 10px;
    background-color: rgb(60, 60, 60);
    position: absolute;
    left: 50px;
    bottom: 80%;
    z-index: 10;
    width: 220px;
    word-wrap: break-word;
  }
  .vtl-context-item {
    padding: 5px 10px;
    border-bottom: 1px solid rgb(131, 131, 131);
    color: white;
  }
  .vtl-context-item:last-child {
    border-bottom: none;
  }
}

.vtl-item {
  cursor: pointer;
}
.vtl-tree-margin {
  margin-left: 2em;
}
.vtl-tree-active {
  background-color: blue !important;
}
</style>
