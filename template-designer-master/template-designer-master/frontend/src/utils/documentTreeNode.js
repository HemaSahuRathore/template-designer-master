import { newRequirementData } from "./newRequirementData";
import { newTestData } from "./newTestData";

export const documentTreeNode = ({
  isLeaf,
  name,
  creatorName,
  type,
  privateFor,
  lockedBy
}) => {
  let data;
  switch (type) {
    case "requirement":
      data = { ...newRequirementData(creatorName) };
      break;
    case "test":
      data = { ...newTestData(creatorName) };
      break;
    default:
      data = { tag: "", text: "" };
  }
  data.hasChanged = true;
  data.isVersioned = false;
  data.authors = [];
  data.comments = [];
  data.discussions = [];
  data.modifiedAt = new Date();
  data.version = 0;
  const nodeData = {
    meta: {
      isLeaf,
      name,
      tag: "",
      privateFor,
      lockedBy,
      extension: type
    },
    data,
    state: [],
    currentStateIndex: 0,
    redoStackData: [],
    redoStackMeta: [],
  };
  return { ...nodeData, state: [{ meta: nodeData.meta, data: nodeData.data }] };
};
