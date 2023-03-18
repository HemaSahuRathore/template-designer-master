import request from "./request";

export default {
  async catchError(msg) {
    const docType = localStorage.getItem("templateType");
    const body = {
      errorMsg: msg
    };
    let userRole = false;
    const res = await request({
      url: `/error-handle/log-error/${docType}`,
      body,
      method: "put"
    });
    if (res.data != "" || res.data != undefined) userRole = res.data;
    return userRole;
  }
};
