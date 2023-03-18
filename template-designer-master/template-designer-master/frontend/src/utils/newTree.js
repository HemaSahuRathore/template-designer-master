import { Tree } from "../components/TreeListView";
export const newTree = (treeUpdate, documentName) => {
  if (treeUpdate && documentName) {
    treeUpdate.children[0] = { ...treeUpdate.children[0], name: documentName };
  }
  return new Tree([
    treeUpdate
      ? { ...treeUpdate.children[0] }
      : {
          name: documentName || "DOCUMENT",
          id: 1,
          pid: 0,
          dragDisabled: true,
          editNodeDisabled: false,
          delNodeDisabled: true,
          lockedBy: null,
          privateFor: null,
          children: []
        }
  ]);
};
