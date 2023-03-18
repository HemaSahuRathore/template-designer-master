<template>
  <div class="ma-8">
    <v-row dense>
      <v-col cols="4">
        <v-select
          dense
          v-model="selectedDocTypes"
          :items="docTypes"
          label="Doc Type"
          outlined
          small-chips
          multiple
          @change="getMatchingData"
        >
          <template v-slot:selection="{ item, index }">
            <v-chip small v-if="index === 0" class="mt-2">
              <span>{{ item }}</span>
            </v-chip>
            <span v-if="index === 1" class="grey--text text-caption mt-1">
              (+{{ selectedDocTypes.length - 1 }} others)
            </span>
          </template>
          <template v-slot:prepend-item>
            <v-list-item ripple @mousedown.prevent @click="toggle">
              <v-list-item-action>
                <v-icon
                  :color="selectedDocTypes.length > 0 ? 'indigo darken-4' : ''"
                >
                  {{ icon }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title> Select All </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-select>
      </v-col>
    </v-row>
    <div v-for="(item, i) in items" :key="i" class="ml-1">
      <div v-if="item.docType && item.docType == 'Workflow'" class="mb-5">
        <a @click="getSelectedResult(item, item.docType)">{{
          item.workflowName
        }}</a
        ><br />
        <span style="color: gray; fontweight: bold"
          >Doc Type: {{ item.docType }}</span
        >
      </div>

      <div v-if="item.docType && item.docType == 'Wiki'" class="mb-5">
        <a
          @click="getSelectedResult(item, item.docType, item.subDocType)"
          v-if="item.title"
        >
          {{ item.subDocType }}, {{ item.title }}</a
        >
        <a
          @click="getSelectedResult(item, item.docType, item.subDocType)"
          v-else
          >{{ item.subDocType }}</a
        ><br />
        <span style="color: gray; fontweight: bold"
          >Doc Type: {{ item.docType }}</span
        >
      </div>
      <div v-if="item.docType && item.docType == 'Risk'" class="mb-5">
        <a @click="getSelectedResult(item, item.docType)"
          >{{ item.riskId }}, {{ item.brief }}</a
        ><br />
        <span style="color: gray; fontweight: bold"
          >Doc Type: {{ item.docType }}</span
        >
      </div>
      <div v-else-if="item.docType && item.docType == 'WBS'" class="mb-5">
        <a @click="getSelectedResult(item, item.docType)">{{ item.wbsName }}</a
        ><br />
        <span style="color: gray; fontweight: bold"
          >Doc Type: {{ item.docType }}</span
        >
      </div>
      <div
        v-else-if="
          item.docType &&
            (item.docType == 'Easy Kanban' || item.docType == 'Taskman')
        "
        class="mb-5"
      >
        <a @click="getSelectedResult(item, item.docType)"
          >{{ item.refId }}, {{ item.description }}</a
        ><br />
        <span style="color: gray; fontweight: bold">Doc Type: Tasks</span>,
        <span style="color: gray; fontweight: bold"
          >Application Name: {{ item.docType }}</span
        >
      </div>
      <div
        v-else-if="item.docType && item.docType == 'Cover Page'"
        class="mb-5"
      >
        <a @click="getSelectedResult(item, item.docType)"
          >{{ item.name }}, {{ item.description }}</a
        >
        <br />
        <span style="color: gray; fontweight: bold"
          >Doc Type: {{ item.docType }}</span
        >
      </div>

      <div
        v-if="item.searchResults && item.searchResults.length > 0"
        class="mt-2 ml-1"
      >
        <v-row dense justify="start">
          <div v-for="(result, index) in item.searchResults" :key="result.id">
            <a @click="getSelectedResult(result, item.docType)">
              <span :class="index != 0 ? 'ml-2' : ''">{{ result.name }}</span>
              <span v-if="index != item.searchResults.length - 1">,</span>
            </a>
          </div>
        </v-row>
        <v-row dense class="mb-5" justify="start">
          <span style="color: gray; fontweight: bold"
            >Doc Type: {{ item.docType }},</span
          >
          <span style="color: gray; fontweight: bold" class="ml-2"
            >Doc Name: {{ item.docName }}</span
          >
        </v-row>
      </div>
    </div>
    <div v-show="emptyResults">
      <v-row align="center" justify="center">
        <span style="fontsize: 18px; color: gray; fontweight: bold"
          >No matching records found</span
        >
      </v-row>
    </div>
    <div class="pagination">
      <v-pagination
        v-model="pagination.page"
        :length="numberOfPages"
        @input="next"
        v-if="items.length > 0"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import request from "../../utils/request";

export default {
  data() {
    return {
      numberOfPages: 0,
      selectedDocTypes: [],
      docTypes: [],
      searchText: "",
      wordMatch: "",
      searchType: "",
      emptyResults: false,
      resultCount: 0,
      appNameList: [],
      items: [],
      loading: true,
      headers: [
        {
          text: "Matching Results",
          align: "start",
          sortable: false,
          value: "name"
        }
      ],
      searchResults: [],
      totalSearchResults: 0,
      pagination: { page: 1, itemsPerPage: 10 }
    };
  },
  watch: {
    pagination: {
      handler() {
        this.getMatchingData();
      },
      deep: true
    },
    $route() {
      this.getMatchingData();
    },
    "getoptionModal.searchText"() {
      if (this.getoptionModal.searchText) this.getMatchingData();
      else this.items = [];
    },
    "getoptionModal.wordMatch"() {
      this.getMatchingData();
    }
  },
  created() {
    this.setCurrentUser();
  },
  async mounted() {
    const { projectId } = this.$route.params;
    await this.setCurrentProject(projectId);
    this.searchType = this.$route.query.searchType;
    this.searchSetting({
      searchText: this.$route.query.searchText,
      searchType: this.$route.query.searchType,
      wordMatch: this.$route.query.wordMatch
    });
   
    this.getDocumentTypes();
    this.setRouteString();
    if (this.searchType == "searchApp") {
      if (localStorage.getItem("templateType") == "Test")
        this.selectedDocTypes = [localStorage.getItem("subDocType")];
      else this.selectedDocTypes = [localStorage.getItem("templateType")];

      if (this.selectedDocTypes == "CONOPS") this.selectedDocTypes = ["Conops"];
    } else this.selectedDocTypes = this.docTypes;
    this.getMatchingData();
  },
  computed: {
    ...mapGetters({
      getoptionModal: "modal/getOptionModal",
      getDocumentName: "tree/getDocumentName",
      getCurrentProject: "tree/getCurrentProject"
    }),
    icon() {
      if (this.selectedDocTypes.length == this.docTypes.length)
        return "mdi-close-box";
      if (this.selectedDocTypes.length > 0) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    }
  },
  methods: {
    ...mapActions({
      setActiveNode: "tree/setActiveNode",
      setNavPath: "modal/setNavPath",
      setApplicationPathName: "modal/setApplicationPathName",
      searchSetting: "modal/searchSetting",
      resetCurrentUser: "resetCurrentUser",
      setCurrentProject: "tree/setCurrentProject"
    }),
    setCurrentUser() {
      if (this.currentUser == null) {
        this.resetCurrentUser();
      }
    },
    next(page) {
      this.items = [];
      this.changePage(page);
    },

    changePage(page) {
      // Validate page
      if (page < 1) page = 1;
      if (page > this.numberOfPages) page = this.numberOfPages;
      this.getMatchingData();
    },
    toggle() {
      this.$nextTick(() => {
        if (this.selectedDocTypes.length == this.docTypes.length) {
          this.selectedDocTypes = [];
        } else {
          this.selectedDocTypes = this.docTypes;
        }
        this.getMatchingData();
      });
    },
    setRouteString() {
      const routeString = `> Search`;
      this.setNavPath(routeString);
    },
    getDocumentTypes() {
      const project = this.getCurrentProject;
      const appSettings = project.appSettings;
      for (var key in appSettings) {
        if (appSettings[key].docTypes) {
          const documentTypes = appSettings[key].docTypes;
          documentTypes.forEach(type => {
            if (this.docTypes.indexOf(type) == -1) {
              this.docTypes.push(type);
            }
          });
        }
      }
    },
    async getMatchingData() {
      this.items = [];
      if (this.searchType == "searchApp" && this.selectedDocTypes.length == 1)
        this.getSearchResultsFromApp();
      else if (
        this.searchType == "searchProject" ||
        this.selectedDocTypes.length > 1
      )
        this.getSearchResultsFromProject();
    },
    async getSearchResultsFromApp() {
      const { projectId } = this.$route.params;
      const { page, itemsPerPage } = this.pagination;
      const searchText = this.getoptionModal.searchText;
      const wordMatch = this.getoptionModal.wordMatch;
      const docType = this.selectedDocTypes[0];
      this.items = [];
      const response = await request({
        url: `/document/get-search-results-from-app/${projectId}/${itemsPerPage}/${page}/${searchText}/${wordMatch}/${docType}`,
        method: "get"
      });

      this.emptyResults = true;
      if (response.data) {
        this.items = [];
        this.loading = false;
        var result = response.data.searchData;
        if (result) {
          if (docType == "Workflow") {
            this.items = result;
            if (this.items.length > 0) this.emptyResults = false;
          } else if (docType == "Risk") {
            this.items = result;
            if (this.items.length > 0) this.emptyResults = false;
          } else if (docType == "Easy Kanban" || docType == "Task") {
            this.items = result;
            if (this.items.length > 0) this.emptyResults = false;
          } else if (docType == "Cover Page") {
            this.items = result;
            if (this.items.length > 0) this.emptyResults = false;
          } else {
            for (var index = 0; index < result.length; index++) {
              var searchResults = [];
              if (result[index].searchResults) {
                for (var i = 0; i < result[index].searchResults.length; i++) {
                  searchResults.push({
                    id: result[index].searchResults[i].id,
                    name: result[index].searchResults[i].meta.name,
                    docId: result[index].searchResults[i].docId,
                    text: result[index].searchResults[i].data.text || ""
                  });
                  this.emptyResults = false;
                }
                var data = {
                  searchResults: searchResults,
                  docName: result[index].docName,
                  docType: result[index].docType
                };
                this.items.push(data);
              }
            }
          }
          this.numberOfPages = Math.ceil(
            response.data.totalResults / this.pagination.itemsPerPage
          );
        }
      }
    },
    async getSearchResultsFromProject() {
      const { projectId } = this.$route.params;
      const { page, itemsPerPage } = this.pagination;

      var searchText = this.searchText;
      if (this.getoptionModal.searchText)
        searchText = this.getoptionModal.searchText;
      var wordMatch = this.wordMatch;
      if (this.getoptionModal.wordMatch)
        wordMatch = this.getoptionModal.wordMatch;
      var currentDocType = localStorage.getItem("templateType");
      if (currentDocType == "CONOPS") currentDocType = "Conops";

      const response = await request({
        url: `/document/get-search-results-from-project/${projectId}/${itemsPerPage}/${page}/${searchText}/${wordMatch}/${currentDocType}/${this.selectedDocTypes}`,
        method: "get"
      });
      this.emptyResults = true;
      this.items = [];
      if (response.data) {
        this.items = [];
        this.loading = false;
        var result = response.data.searchData;
        for (var index = 0; index < result.length; index++) {
          var searchResults = [];
          if (result[index].searchResults) {
            for (var i = 0; i < result[index].searchResults.length; i++) {
              searchResults.push({
                id: result[index].searchResults[i].id,
                name: result[index].searchResults[i].meta.name,
                docId: result[index].searchResults[i].docId
              });

              this.emptyResults = false;
            }
            var data = {
              totalResults: result[index].totalResults,
              numberOfPages: result[index].numberOfPages,
              searchResults: searchResults,
              docName: result[index].docName,
              docType: result[index].docType
            };
            if (this.appNameList.indexOf(result[index].docType) == -1)
              this.appNameList.push(result[index].docType);
            this.items.push(data);
          } else {
            this.items.push(result[index]);
            this.emptyResults = false;
          }
        }
        this.numberOfPages = Math.ceil(
          response.data.totalResults / this.pagination.itemsPerPage
        );
      }
    },
    getSelectedResult(value, docType, subDocType) {
      let routeData = {};
      const { projectId } = this.$route.params;
      if (docType == "Workflow") {
        routeData = this.$router.resolve({
          path: `/project/workflow/${projectId}`,
          query: {
            workflow: value.workflowName,
            searchResult: true
          }
        });
      } else if (docType == "Wiki") {
        if (subDocType == "Announcements") {
          routeData = this.$router.resolve({
            path: `/project/wiki-tool/${projectId}/announcements/history`,
            query: {
              refId: value.refId,
              searchResult: true
            }
          });
        } else if (subDocType == "Learnings") {
          routeData = this.$router.resolve({
            path: `/project/wiki-tool/${projectId}/${value.refId}/learning/content/false`,
            query: {
              searchResult: true
            }
          });
        } else if (subDocType == "Glossary") {
          routeData = this.$router.resolve({
            path: `/project/wiki-tool/${projectId}/glossary`,
            query: {
              searchResult: true
            }
          });
        }
      } else if (docType == "Risk") {
        routeData = this.$router.resolve({
          path: `/project/${projectId}/riskman/editor`,
          query: {
            riskId: value.riskId,
            refId: value.refId,
            searchResult: true
          }
        });
      } else if (docType == "WBS") {
        routeData = this.$router.resolve({
          path: `/project/wbs-tool/${projectId}/${value.refId}/wbs`,
          query: {
            searchResult: true
          }
        });
      } else if (docType == "Review") {
        this.setApplicationPathName(docType);
        routeData = this.$router.resolve({
          path: `/project/${this.getoptionModal.applicationPathName}/${projectId}/${value.docId}/edit`,
          query: {
            hideTabs: true,
            searchResult: true,
            search: this.getoptionModal.searchText,
            wordMatch: this.getoptionModal.wordMatch,
            nodeName: value.name
          }
        });
      } else if (docType == "Easy Kanban") {
        this.setApplicationPathName(docType);
        routeData = this.$router.resolve({
          path: `/project/${this.getoptionModal.applicationPathName}/${projectId}/${value.refId}/view-task`,
          query: {
            searchResult: true,
            search: this.getoptionModal.searchText,
            wordMatch: this.getoptionModal.wordMatch,
            nodeName: value.name
          }
        });
      } else if (docType == "Cover Page") {
        routeData = this.$router.resolve({
          path: `/project/cover-page/${projectId}/${value.refId}/design`,
          query: {
            searchResult: true
          }
        });
      } else if (docType == "Taskman") {
        routeData = this.$router.resolve({
          path: `/project/taskman/${projectId}/taskView`,
          query: {
            searchResult: true,
            taskData: value.refId
          }
        });
      } else {
        this.setApplicationPathName(docType);
        routeData = this.$router.resolve({
          path: `/project/${this.getoptionModal.applicationPathName}/${projectId}/${value.docId}/doc`,
          query: {
            searchResult: true,
            hideTabs: true,
            search: this.getoptionModal.searchText,
            wordMatch: this.getoptionModal.wordMatch,
            nodeName: value.name
          }
        });
      }
      window.open(routeData.href, "_blank");
    }
  }
};
</script>

<style scoped>
.node-text {
  display: inline-block;
  white-space: nowrap;
  width: 500px;
  text-overflow: ellipsis;
  overflow: hidden;
}
.pagination {
  padding-top: 10px;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: white;
  align-items: center;
}
</style>
