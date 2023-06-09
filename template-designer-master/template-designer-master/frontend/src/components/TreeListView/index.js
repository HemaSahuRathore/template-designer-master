import VueTreeList from "./TreeList";
import { Tree, TreeNode } from "./Tree";

VueTreeList.install = Vue => {
  Vue.component(VueTreeList.name, VueTreeList);
};

export default VueTreeList;
export { Tree, TreeNode, VueTreeList };
