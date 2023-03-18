import request from "./request";
var docCode = "";
export default {
  truncateString(str, num) {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + "...";
  },

  async getCurrentUserRole(projectId) {
    let userRole = "";
    const res = await request({
      url: `/team/get-my-role/${projectId}`,
      method: "get"
    });
    if (res.data != "" && res.data != undefined && res.data.success != false)
      userRole = res.data;
    return userRole;
  },

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
  async getUserAccessForApplication(data) {
    let role = "";
    let projectId = data.projectId;
    let applicationName = data.applicationName;
    if (data.userRole && data.userRole && data.userRole != false)
      role = data.userRole;
    let isUserRoleHasReadWriteAccess = false;
    if (applicationName) {
      const res = await request({
        url: `/team/get-user-access/${role}/${applicationName}/${projectId}`,
        method: "get"
      });
      if (res.data != "" && res.data != undefined)
        isUserRoleHasReadWriteAccess = res.data;
    }
    return isUserRoleHasReadWriteAccess;
  },
  getAppSettingForApplication(project) {
    const appSettings = project ? project.appSettings : {};
    var docType = localStorage.getItem("templateType");
    if (docType == "CONOPS") docType = "Conops";
    if (docType == "Test") docType = localStorage.getItem("subDocType");
    let setting = {};
    if (appSettings)
      for (var key in appSettings) {
        if (appSettings[key]) {
          const data = appSettings[key];
          if (data.docTypes && data.docTypes.indexOf(docType) != -1) {
            setting = appSettings[key];
          }
        }
      }
    return setting;
  },
  getKeyFromUserLockProperty(project) {
    const appSettings = project.appSettings;

    let docType = localStorage.getItem("templateType");
    if (docType == "Test") docType = localStorage.getItem("subDocType");
    var appName = "";
    for (var key in appSettings) {
      if (appSettings[key]) {
        const data = appSettings[key];
        if (
          data.name &&
          data.docTypes &&
          data.docTypes.indexOf(docType) != -1
        ) {
          appName = key;
        }
      }
    }
    return appName;
  },



  async fetchDoumentCode() {
    let testType = localStorage.getItem("testType");
    let subDocType = localStorage.getItem("subDocType");
    var docType = localStorage.getItem("templateType");
    if (docType == "CONOPS") docType = "Conops";
    const res = await request({
      url: `/config/get/docCode/${docType}/${testType}/${subDocType}`,
      method: "get"
    });
    if (res.data) docCode = res.data;
  },

};
export { docCode }