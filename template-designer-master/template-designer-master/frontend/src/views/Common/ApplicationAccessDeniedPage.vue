<template>
  <div class="pa-2">
    <ErrorCard :errorData="PageErrorData" />
  </div>
</template>

<script>
import ErrorCard from "../../components/Common/ErrorCard.vue";
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
    //eslint-disable-next-line
    isUserHasApplicationAccess(val) {
      if (val == true) {
        let tab = "View";
        const { projectId } = this.$route.params;
        localStorage.setItem("selectedCoverPageMode", tab);
        localStorage.setItem("templateType", "Cover Page");
        if (this.$refs.coverPageLayout)
          this.$refs.coverPageLayout.changeMode(tab);
        this.$router
          .push(`/project/cover-page/${projectId}/id/design`)
          .catch(() => {});
      }
    },
    "$route.params.projectId"(val) {
      this.getUserAccessForProject(val);
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
    ...mapGetters(["isUserHasApplicationAccess"]),
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
    async getUserAccessForProject(projectId) {
      await this.setCurrentProject(projectId);
      this.getUserAccess();
    },
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
      if (applicationName) await this.checkUserAccessForApplication(data);
    },

    getPageData() {
      let routeString = localStorage.getItem("accessDeniedNavPath");
      this.setNavPath(routeString);
      this.PageErrorData = {
        breadCrumb: "Error",
        icon: "mdi-alert-octagon-outline",
        errorMessage: "Access Denied",
        color: "red",
        infoMessage: `Your role ${
          this.currentUserRole ? "as " + this.currentUserRole : ""
        } does not have access to this application. Contact the administrator to get access.`,
      };
    },
  },
};
</script>

