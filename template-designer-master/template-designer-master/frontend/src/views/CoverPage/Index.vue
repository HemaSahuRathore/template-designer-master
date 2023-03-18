<template>
  <div class="fill-height pr-0 mr-0">
    <v-toolbar
      color="white"
      dense
      flat
      z-index="1"
      elevation="1"
      v-show="!['Existing'].includes($route.name)"
    >
      <v-btn
        color="primary"
        class="ml-3"
        :to="path + '/design'"
        :outlined="$route.name.includes('Design')"
        :text="!$route.name.includes('Design')"
        v-if="
          selectedCoverpageMode != 'View' &&
          isDocReadOnly == false &&
          !$route.query.searchResult
        "
        small
        >Design</v-btn
      >
      <v-btn
        color="primary"
        class="ml-3"
        :to="path + '/design'"
        :outlined="$route.name.includes('Design')"
        :text="!$route.name.includes('Design')"
        v-if="
          selectedCoverpageMode == 'View' ||
          isDocReadOnly == true ||
          $route.query.searchResult
        "
        :disabled="$route.query.searchResult=='true' || $route.query.searchResult==true"
        small
        >View</v-btn
      >
      <v-btn
        v-if="
          selectedCoverpageMode != 'View' &&
          isDocReadOnly == false &&
          !$route.query.searchResult
        "
        color="primary"
        class="ml-3"
        :to="path + '/test'"
        :outlined="$route.name.includes('Test')"
        :text="!$route.name.includes('Test')"
        small
        >Test</v-btn
      >
      <v-btn
        color="primary"
        class="ml-3"
        :to="path + '/properties'"
        :outlined="$route.name.includes('Properties')"
        :text="!$route.name.includes('Properties')"
        small
        v-if="!$route.query.searchResult"
        >Properties</v-btn
      >
    </v-toolbar>
    <v-spacer></v-spacer>
    <splitpanes
      @resize="paneSize = $event[0].size"
      class="default-theme mt-1"
      style="height: 90vh; background: #fff"
      v-if="['Design'].includes($route.name)"
      :dbl-click-splitter="false"
    >
      <pane
        v-if="['Design'].includes($route.name)"
        :min-size="paneSize"
        :max-size="paneSize"
        class="overflow-left-pane left-pane"
      >
        <Layouts
          @setPageDiamension="setPageDiamension"
          @setSelectedCoverpageMode="setSelectedCoverpageMode"
          @setPageMargin="setPageMargin"
          @showOrhideMargin="showOrhideMargin"
          @selectedCoverPageMode="selectedCoverPageMode"
          ref="layouts"
        />
      </pane>

      <pane
        :min-size="100 - paneSize"
        :max-size="100 - paneSize"
        class="overflow-auto scroll right-pane mt-0"
      >
        <div
          v-if="
            ['Design'].includes($route.name) &&
            selectedCoverpageMode != 'View' &&
            isDocReadOnly == false
          "
        >
          <DesignCoverPage class="mt-n2 ma-0 pa-0" ref="designCoverPage" />
        </div>
        <div
          class="mt-8"
          v-show="selectedCoverpageMode == 'View'"
          v-else-if="selectedCoverpageMode == 'View'"
        >
          <div>
            <ViewCoverPageMode />
          </div>
        </div>
      </pane>
    </splitpanes>
    <splitpanes
      class="default-theme"
      style="height: 90vh; background: #fff"
      v-else-if="!['Design'].includes($route.name)"
    >
      <pane min-size="100" max-size="100" class="mt-0 pa-0 ma-0 overflow-auto">
        <router-view />
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import { mapActions, mapGetters } from "vuex";
import request from "../../utils/request";
import Layouts from "../../components/CoverPage/Layouts.vue";
import DesignCoverPage from "./DesignCoverPage.vue";
import ViewCoverPageMode from "../../components/CoverPage/ViewCoverpageMode.vue";
import helper from "../../utils/helper";
export default {
  name: "CoverPage",
  components: {
    Splitpanes,
    Pane,
    Layouts,
    DesignCoverPage,
    ViewCoverPageMode,
  },
  data() {
    return {
      paneSize: 28,
      path: "",
      width: 0,
      height: 0,
      items: [],
      contentToPreview: "",
      selectedCoverpageMode: "",
      designTabName: "Design",
    };
  },
  created() {
    localStorage.setItem("templateType", "Cover Page");
    //To set doc type after tab change
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState == "visible")
        localStorage.setItem("templateType", "Cover Page");
    });
  },

  async mounted() {
    let routeString = "Quality > Cover Page ";
    localStorage.setItem("templateType", "Cover Page");
    this.setNavPath(routeString);
    const { projectId, docId } = this.$route.params;

    await this.setCurrentProject(projectId);
    await this.getUserAccess();

    this.path = `/project/cover-page/${projectId}/${docId}`;

    this.setSelectedCoverpageMode();

    helper.fetchDoumentCode();
    await this.fetchDocument();
  },

  computed: {
    ...mapGetters({
      isDocReadOnly: "tree/isDocReadOnly",
      getCurrentProject: "tree/getCurrentProject",
    }),
    ...mapGetters(["isUserHasApplicationAccess"]),
  },
  watch: {
    $route() {
      if (
        this.$route.name == "Design" ||
        this.$route.name == "Test" ||
        this.$route.name == "Properties"
      ) {
        const { projectId, docId } = this.$route.params;
        this.path = `/project/cover-page/${projectId}/${docId}`;

        this.resetData();
        this.setSelectedCoverpageMode();
        if (this.$route.params.docId != "id") this.fetchDocument();
      }
    },
    "$route.params.projectId"(val) {
      this.getUserAccessForProject(val);
    },

    isDocReadOnly(val) {
      let tab = "View";
      if (val == false) {
        tab = "New";
      } else {
        tab = "View";
      }
      localStorage.setItem("selectedCoverPageMode", tab);
      localStorage.setItem("templateType", "Cover Page");
      if (this.$refs.layouts) this.$refs.layouts.changeMode(tab);
    },
  },
  methods: {
   
    async getApplicationDocTypes() {
      let docTypes = [];
      const response = await request({
        url: `/config-data/get-docTypes/Cover Page`,
        method: "get",
      });
      if (response && response.data && response.errors.length == 0) {
        docTypes = response.data;
        return docTypes;
      }
    },
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
      const data = {
        projectId: projectId,
        applicationName: applicationName,
        navPath: "Quality > Cover Page",
      };
      if (applicationName != undefined)
        await this.checkUserAccessForApplication(data);
    },
    ...mapActions({
      fetchDocument: "tree/fetchDocument",
      setCurrentProject: "tree/setCurrentProject",
      setNavPath: "modal/setNavPath",
    }),
    ...mapActions(["checkUserAccessForApplication"]),
    selectedCoverPageMode() {
      this.setSelectedCoverpageMode();
    },

    setPageDiamension(pageSize) {
      if (this.$refs.designCoverPage)
        this.$refs.designCoverPage.setPageDiamension(pageSize);
    },

    showOrhideMargin(data) {
      if (this.$refs.designCoverPage)
        this.$refs.designCoverPage.showOrhideMargin(data);
    },

    //eslint-disable-next-line no-unused-vars
    async setSelectedCoverpageMode() {
      this.selectedCoverpageMode = localStorage.getItem(
        "selectedCoverPageMode"
      );

      if (this.selectedCoverpageMode == "View" || this.isDocReadOnly == true)
        this.designTabName = "View";
      else this.designTabName = "Design";
    },
    setPageMargin(marginData) {
      if (this.$refs.designCoverPage)
        this.$refs.designCoverPage.setPageMargins(marginData);
    },

    resetData() {
      localStorage.setItem("existingTab", false);
      localStorage.setItem("selectedUseFromPopup", "");
      localStorage.setItem("selectedExistingDocRefId", null);
    },
  },
};
</script>
<style scoped lang="scss">
@import "../../assets/scss/colors.scss";
.splited-pane {
  max-height: calc(100vh - 95px);
  overflow-y: visible !important;
  overflow-x: visible !important;
  /* overflow-y: auto; */
}
.overflow-auto {
  overflow-y: auto;
  overflow-x: visible !important;
}

.overflow-left-pane {
  overflow-y: auto;
  overflow-x: hidden !important;
}
.scroll {
  overflow-x: auto;
  overflow-y: auto;
}

.splited-pane {
  max-height: calc(100vh - 95px);
  overflow: auto;
}
.overflow-auto {
  overflow: auto;
}
.splitpanes.default-theme .splitpanes__pane {
  background: inherit;
}
.splitpanes.default-theme .splitpanes__splitter {
  background-color: #f4f4f4;
  transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
}
.splitpanes.default-theme .splitpanes__splitter:hover {
  background-color: #e2e2e2;
}
.theme--light.v-btn--active:hover::before,
.theme--light.v-btn--active::before {
  opacity: 0;
}
</style>