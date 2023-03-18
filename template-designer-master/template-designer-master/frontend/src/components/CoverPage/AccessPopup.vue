<template>
  <div class="pa-2">
    <ErrorCard :errorData="PageErrorData" />
  </div>
</template>

<script>
import ErrorCard from "../Common/ErrorCard.vue";
import { mapGetters, mapActions } from "vuex";
import helper from "../../utils/helper";

export default {
  components: {
    ErrorCard,
  },
  data() {
    return {
      PageErrorData: {},
      currentUserRole: "",
    };
  },

  watch: {
    $route() {
      let routeString = "";
      if (this.$route.query.action == "create")
        routeString = "Quality > Cover Page > New";
      else routeString = "Quality > Cover Page > Edit";
      this.setNavPath(routeString);
    },
  },

  async mounted() {
    const { projectId } = this.$route.params;

    await this.setCurrentProject(projectId);
    this.currentUserRole = await helper.getCurrentUserRole(projectId);
    await this.getUserAccess();
    this.getPageData();
  },
  computed: {
    ...mapGetters({
      getCurrentProject: "tree/getCurrentProject",
    }),
  },
  methods: {
    ...mapActions({
      setNavPath: "modal/setNavPath",
      setCurrentProject: "tree/setCurrentProject",
    }),
    ...mapActions(["checkUserAccessForApplication"]),

    async getCurrentAppsetting() {
      const project = await this.getCurrentProject;
      let applicationSetting = await helper.getAppSettingForApplication(
        project
      );
      return applicationSetting;
    },

    async getUserAccess() {
      const applicationSetting = await this.getCurrentAppsetting();
      const applicationName = applicationSetting.name;
      const { projectId } = this.$route.params;
      const navPath = localStorage.getItem("accessDeniedNavPath");
      const data = {
        projectId: projectId,
        applicationName: applicationName,
        navPath: navPath,
      };
      await this.checkUserAccessForApplication(data);
    },

    getPageData() {
      let routeString = "";
      if (this.$route.query.action == "create")
        routeString = "Quality > Cover Page > New";
      else routeString = "Quality > Cover Page > Edit";
      this.setNavPath(routeString);
      const infoMsg = `Your role ${
        this.currentUserRole ? "as " + this.currentUserRole : ""
      } does not have access to creation. Contact the administrator to get access.`;
      this.PageErrorData = {
        breadCrumb: "Error",
        icon: "mdi-alert-octagon-outline",
        errorMessage: "Access Denied",
        color: "red",
        infoMessage: infoMsg,
      };
    },
  },
};
</script>

