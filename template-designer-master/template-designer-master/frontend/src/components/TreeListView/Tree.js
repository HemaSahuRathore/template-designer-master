import { traverseTree } from "./tools";
const { nanoid } = require("nanoid");
import { docCode } from "../../utils/helper";
import idLength from "../../../../config/nanoIdConfig.json"
/**
 * Tree data struct
 * @param data: treenode's params
 *   name: treenode's name
 *   isLeaf: treenode is leaf node or not
 *   id: id
 *   dragDisabled: decide if it can be dragged
 *   disabled: desabled all operation
 */
export class TreeNode {
  constructor({ id, isLeaf, ...data }) {
    const nanoId = nanoid();
    const randId = `${docCode}-${nanoId.substring(0, idLength.nanoIdLength)}`;
    this.id = typeof id === "undefined" ? randId : id;
    this.parent = null;
    this.children = null;
    this.isLeaf = !!isLeaf;
    this.includesSearch = false;
    // other params
    for (let k in data) this[k] = data[k];
  }
  changeName(name) {
    this.name = name;
  }
  changeNodeAccess(data) {
    this.lockedBy = data;
  }
  changeNodeVisibilty(data) {
    this.privateFor = data;
  }
  addChildren(children) {
    if (!this.children) this.children = [];
    if (Array.isArray(children)) {
      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];
        child.parent = this;
        child.pid = this.id;
      }
      this.children.concat(children);
    } else {
      const child = children;
      child.parent = this;
      child.pid = this.id;
      if (child.isLeaf) {
        var index = 0;
        this.children.forEach(({ isLeaf }) => {
          if (isLeaf) {
            index++;
            return;
          }
        });
        this.children.splice(index, 0, child);
      } else this.children.push(child);
    }
  }
  addBefore(children, modelId) {
    const child = children;
    const index = this.children.findIndex(child => child.id == modelId);
    if (index > -1) {
      this.children.splice(index, 0, child);
    }
  }
  addAfter(children, modelId) {
    const child = children;
    const index = this.children.findIndex(child => child.id == modelId);
    if (index > -1) {
      this.children.splice(index + 1, 0, child);
    }
  }
  remove() {
    const parent = this.parent;
    const index = parent.findChildIndex(this);
    parent.children.splice(index, 1);
  }
  _removeChild(child) {
    for (let i = 0, len = this.children.length; i < len; i++)
      if (this.children[i] === child) {
        this.children.splice(i, 1);
        break;
      }
  }
  isTargetChild(target) {
    let parent = target.parent;
    while (parent) {
      if (parent === this) return true;
      parent = parent.parent;
    }
    return false;
  }
  moveInto(target) {
    if (this.name === "root" || this === target) return;
    if (this.isTargetChild(target)) return;
    if (target.isLeaf) return;
    this.parent._removeChild(this);
    this.parent = target;
    this.pid = target.id;
    if (!target.children) target.children = [];
    target.children.unshift(this);
  }
  findChildIndex(child) {
    var index;
    for (let i = 0, len = this.children.length; i < len; i++)
      if (this.children[i] === child) {
        index = i;
        break;
      }
    return index;
  }
  _canInsert(target) {
    if (this.name === "root" || this === target) return false;
    if (this.isTargetChild(target)) return false;
    this.parent._removeChild(this);
    this.parent = target.parent;
    this.pid = target.parent.id;
    return true;
  }
  insertBefore(target) {
    if (!this._canInsert(target)) return;
    const pos = target.parent.findChildIndex(target);
    target.parent.children.splice(pos, 0, this);
  }
  insertAfter(target) {
    if (!this._canInsert(target)) return;
    const pos = target.parent.findChildIndex(target);
    target.parent.children.splice(pos + 1, 0, this);
  }
  getDeletedChildren() {
    return this.deleteNodesSearch(this);
  }

  deleteNodesSearch(node) {
    const treeId = [];
    treeId.push(node.id);
    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        treeId.push(...this.deleteNodesSearch(node.children[i]));
      }
    }
    return treeId;
  }

  toString() {
    return JSON.stringify(traverseTree(this));
  }
}

export class Tree {
  constructor(data) {
    this.root = new TreeNode({
      name: "root",
      isLeaf: false,
      id: 0,
    });
    this.initNode(this.root, data[0]);
    return this.root;
  }

  initNode(rootNode, childNode) {
    let children = [];
    if (childNode instanceof TreeNode)
      childNode = JSON.parse(childNode.toString());
    if (childNode.children) children = childNode.children;
    childNode.children = [];
    const newChild = new TreeNode(childNode);
    if (children) children.forEach((child) => this.initNode(newChild, child));
    rootNode.addChildren(newChild);

  }
}
