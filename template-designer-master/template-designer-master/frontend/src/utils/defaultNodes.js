var defaultNodes = [
    {
      name: "Cover Page",
      isLeaf: true,
      lockedBy: null,
      privateFor: null,
      pid: 1,
      addTreeNodeDisabled: true,
      addLeafNodeDisabled: true,
      editNodeDisabled: true,
      delNodeDisabled: true
    },
    {
      name: "History",
      isLeaf: true,
      lockedBy: null,
      privateFor: null,
      pid: 1,
      disableMenu: false,
      delNodeDisabled: true,
      editNodeDisabled: true
    },
    {
      name: "Table of Contents",
      id: "toc",
      isLeaf: true,
      pid: 1,
      hide: true,
      disableMenu: true
    },
    {
      name: "Table of Figures",
      id: "tof",
      isLeaf: true,
      pid: 1,
      hide: true,
      disableMenu: true
    },
    {
      name: "Table of Tables",
      id: "tot",
      isLeaf: true,
      pid: 1,
      hide: true,
      disableMenu: true
    }
  ];
  export { defaultNodes };
  