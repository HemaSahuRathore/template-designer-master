import request from "./request";

export default {

  async getProject(projectId) {
    if (projectId != undefined && projectId != "projectNullId") {
      const res = await request({
        url: `/project/fetch/one/${projectId}`,
        method: "get"
      });
      if (res) {
        return res.data;
      }
    } else {
      const data = null;
      return data;
    }
  },
};
