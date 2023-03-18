<template>
  <v-app :class="{ 'collapse-main': isCollapsed }">
    <v-app-bar
      clipped-left
      flat
      app
      color="white"
      height="45"
      primary
      z-index="1000000"
      elevation="1"
    >
      <v-app-bar-nav-icon
        :disabled="isDocReadOnly && getReasonForDocDisable != 'noAccess'"
        @click="isCollapsed = !isCollapsed"
      ></v-app-bar-nav-icon>
      <span
        v-if="
          getCurrentActiveProjectData != null &&
          getCurrentActiveProjectData != undefined
        "
      >
        <v-avatar
          v-if="
            (!getCurrentActiveProjectData.projectImage ||
              getCurrentActiveProjectData.projectImage == '') &&
            getCurrentActiveProjectData.name
          "
          VALIGN="middle"
          class="ml-6 mr-6"
          rounded
          color="#42A5F5"
          size="32"
          ><span
            VALIGN="middle"
            class="white--text headline"
            style="text-transform: uppercase"
            >{{ getCurrentActiveProjectData.name[0] }}</span
          ></v-avatar
        >
        <span
          v-else-if="
            getCurrentActiveProjectData.projectImage &&
            getCurrentActiveProjectData.projectImage != ''
          "
        >
          <v-img
            alt="company Logo"
            class="shrink ml-3 mr-2"
            contain
            :src="getCurrentActiveProjectData.projectImage"
            height="37"
            width="100"
          />
        </span>
      </span>
      <span>
        <div class="mt-6 project-dropdown ml-4">
          <v-select
            :disabled="
              (isDocReadOnly && getReasonForDocDisable != 'noAccess') ||
              $route.query.searchResult == 'true' ||
              $route.query.searchResult == true
            "
            :menu-props="{ bottom: true, offsetY: true }"
            class="project-selector"
            v-if="getActiveProjectForSelectDropdown"
            :items="getActiveProjectForSelectDropdown"
            :item-text="'name'"
            :item-value="'refId'"
            v-model="selectedProjectId"
            @change="navigateToProject"
            :placeholder="selectedProjectName"
            dense
            flat
            outlined
          >
          </v-select>
        </div>
      </span>
      <div>
        <v-breadcrumbs class="font-weight-bold" large>
          <v-breadcrumbs-item class="text-primary">
            {{ getoptionModal.navPath }}
          </v-breadcrumbs-item>
        </v-breadcrumbs>
      </div>

      <v-spacer></v-spacer>
      <div class="mt-0">
        <v-menu
          ref="menu"
          v-model="menu"
          content-class="searchMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              class="mx-4 mt-6"
              dense
              prepend-inner-icon="mdi-magnify"
              outlined
              v-model="search"
              @click="menu = false"
              v-on:keyup.enter="showSearchResults"
              @click:clear="clearSearch"
              clearable
              v-on="on"
              v-if="
                !isDocReadOnly ||
                (isDocReadOnly && getReasonForDocDisable == 'noAccess')
              "
            ></v-text-field>
          </template>
          <v-row dense class="mt-1">
            <v-col v-if="$route.name != 'SearchResult'">
              <span style="margin-left: 40px">Search Type</span>
              <v-radio-group v-model="searchType" column class="mt-1 ml-2">
                <v-radio
                  v-if="
                    (!nodeMeta.isLeaf &&
                      $route.name != 'Workflow' &&
                      getDocType() != 'Project' &&
                      getDocType() != 'Wiki' &&
                      getDocType() != 'Risk' &&
                      getDocType() != 'WBS' &&
                      getDocType() != 'Easy Kanban' &&
                      getDocType() != 'Cover Page' &&
                      getDocType() != 'Task') ||
                    nodeMeta.name == 'History' ||
                    $route.name.includes('DocView')
                  "
                  label="Current view"
                  color="primary"
                  value="currentView"
                ></v-radio>
                <v-radio
                  label="Current document"
                  color="primary"
                  value="searchDoc"
                  v-if="
                    $route.name != 'Workflow' &&
                    getDocType() != 'Project' &&
                    getDocType() != 'Wiki' &&
                    getDocType() != 'Risk' &&
                    getDocType() != 'WBS' &&
                    getDocType() != 'Easy Kanban' &&
                    getDocType() != 'Cover Page' &&
                    getDocType() != 'Task'
                  "
                ></v-radio>
                <v-radio
                  label="Application"
                  color="primary"
                  value="searchApp"
                  v-if="
                    getDocType() != 'Project' &&
                    getDocType() != 'Wiki' &&
                    getDocType() != 'WBS' &&
                    $route.name != 'Home'
                  "
                ></v-radio>
                <v-radio
                  label="Project"
                  color="primary"
                  value="searchProject"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col>
              <span style="margin-left: 40px">Word Match</span>
              <v-radio-group v-model="wordMatch" column class="mt-1 ml-2">
                <v-radio
                  label="Exact"
                  color="primary"
                  value="fullMatch"
                ></v-radio>
                <v-radio label="Like" color="primary" value="like"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
        </v-menu>
      </div>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            :disabled="
              isDocReadOnly ||
              $route.query.searchResult == 'true' ||
              $route.query.searchResult == true
            "
            v-bind="attrs"
            v-on="on"
            @click="handleAppSetting"
            >mdi-cog</v-icon
          >
        </template>
        <span>App Setting</span>
      </v-tooltip>
      <v-icon class="mr-3 ml-2">mdi-lifebuoy</v-icon>
      <v-menu
        open-on-hover
        :nudge-width="145"
        close-delay="50"
        content-class="profile-menu-position mt-n3 mr-n6"
      >
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }">
              <v-icon
                v-bind="attrs"
                v-on="{ ...tooltip, ...menu }"
                :disabled="
                  isDocReadOnly && getReasonForDocDisable != 'noAccess'
                "
                >mdi-account</v-icon
              >
            </template>
            <span>User Profile</span>
          </v-tooltip>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title style="font-weight: bold">{{
              currentUserName
            }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>{{ currentUserEmail }}</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="handleUserSettings">
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="handleLogout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <span>
        <v-img
          alt="company Logo"
          class="shrink ml-5"
          contain
          src="../../assets/images/COSYS-Logo.svg"
          height="50"
          width="70"
        />
      </span>
    </v-app-bar>
    <v-navigation-drawer
      v-model="sidebarMenu"
      app
      :class="{ collapsed: isCollapsed }"
      class="sidenav"
      clipped
      fixed
      :permanent="sidebarMenu"
      :temporary="!toggleMini"
      elevation="1"
    >
      <v-icon
        class="float-right mr-2 mt-2"
        color="red"
        @click="toggleMini = !toggleMini"
        >{{ toggleMini ? "" : "mdi-close-circle" }}</v-icon
      >
      <v-list class="mt-2" :class="!isCollapsed ? 'ml-n4' : ''">
        <v-list-item v-for="item in items" :key="item.title" :id="item.id">
          <v-list-item>
            <v-list-item-icon v-if="!item.mainItems">
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-show="item.image == false"
                    v-bind="attrs"
                    v-on="on"
                    color="dark"
                    v-on:click="navigateToItemPage(item)"
                    >{{ item.icon }}</v-icon
                  >
                </template>
                <span>{{ item.title }}</span>
              </v-tooltip>

              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-img
                    v-bind="attrs"
                    v-on="on"
                    v-if="item.image == true"
                    contain
                    :src="require(`../../assets/${item.src}`)"
                    height="19"
                    width="19"
                    v-on:click="navigateToItemPage(item)"
                  />
                </template>
                <span>{{ item.title }}</span>
              </v-tooltip>
              <span class="ml-5" v-if="!isCollapsed">{{ item.title }}</span>
            </v-list-item-icon>
            <v-list-item-icon
              v-if="item.mainItems && isCollapsed"
              class="collapsed-sidebar"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on: tooltip }">
                  <v-menu
                    v-model="item.isOpened"
                    :nudge-width="115"
                    right
                    bottom
                    content-class="collapsed-menu-position mt-n1"
                  >
                    <template
                      width="30px"
                      v-slot:activator="{ on: menu, attrs }"
                    >
                      <v-icon
                        v-if="item.image == false"
                        color="rgba(0, 0, 0, 0.54)"
                        v-bind="attrs"
                        v-on="{ ...tooltip, ...menu }"
                        :disabled="
                          (isDocReadOnly &&
                            getReasonForDocDisable != 'noAccess') ||
                          $route.query.searchResult == 'true' ||
                          $route.query.searchResult == true
                        "
                      >
                        {{ item.icon }}
                      </v-icon>
                      <v-img
                        v-else-if="item.image == true"
                        color="dark"
                        v-bind="req"
                        v-on="on"
                        alt="project Logo"
                        contain
                        :src="require(`../../assets/${item.src}`)"
                        height="19"
                        width="19"
                      />
                    </template>
                    <v-list>
                      <v-list-item>
                        <h4 class="mt-n7 font-class-name text-color">
                          {{ item.title }}
                        </h4>
                      </v-list-item>
                      <hr class="mt-n5 mb-n1" />
                      <v-list
                        class="mt-2"
                        v-for="mainItem in item.mainItems"
                        :key="mainItem.title"
                      >
                        <v-menu
                          bottom
                          right
                          content-class="collapsed-submenu-position"
                          v-if="
                            mainItem.subItems && mainItem.subItems.length != 0
                          "
                        >
                          <template
                            width="200px"
                            v-slot:activator="{ on, req }"
                          >
                            <v-list-item
                              v-bind="req"
                              v-on="on"
                              dense
                              class="mb-n4 mt-n3 font-class-name"
                              v-on:click="
                                checkApplication(mainItem.title, item)
                              "
                              >{{ mainItem.title }}
                            </v-list-item>
                          </template>
                          <v-list
                            v-if="
                              mainItem.subItems && mainItem.subItems.length != 0
                            "
                          >
                            <v-list-item>
                              <h4 class="mt-n7 font-class-name text-color">
                                {{ mainItem.title }}
                              </h4>
                            </v-list-item>
                            <hr class="mt-n5 mb-n1" />
                            <v-list
                              class="mt-2"
                              v-for="subItem in mainItem.subItems"
                              :key="subItem.title"
                            >
                              <v-menu
                                v-model="subItem.isOpened"
                                close-delay="1000"
                                bottom
                                right
                                max-width="100px"
                                :nudge-width="11"
                              >
                                <template
                                  width="200px"
                                  v-slot:activator="{ on, attrs }"
                                >
                                  <v-list-item
                                    v-on="on"
                                    dense
                                    v-bind="attrs"
                                    @click="
                                      goToApplicationModal(
                                        item.title,
                                        mainItem.title,
                                        subItem.title
                                      )
                                    "
                                    class="mb-n4 mt-n3 font-class-name"
                                    >{{ subItem.title }}
                                  </v-list-item>
                                </template>
                              </v-menu>
                            </v-list>
                          </v-list>
                        </v-menu>
                        <v-list-item
                          v-else
                          dense
                          class="mb-n4 mt-n3 font-class-name"
                          v-on:click="checkApplication(mainItem.title, item)"
                          >{{ mainItem.title }}
                        </v-list-item>
                      </v-list>
                    </v-list>
                  </v-menu>
                </template>
                <span>{{ item.title }}</span>
              </v-tooltip>
            </v-list-item-icon>
            <v-list-item-icon v-if="item.mainItems && !isCollapsed">
              <v-menu
                :nudge-width="115"
                v-model="item.isOpened"
                right
                bottom
                content-class="collapsed-menu-position mt-n1"
              >
                <template width="30px" v-slot:activator="{ on, req }">
                  <v-icon
                    v-if="item.image == false"
                    color="rgba(0, 0, 0, 0.54)"
                    v-bind="req"
                    v-on="on"
                    :disabled="
                      (isDocReadOnly && getReasonForDocDisable != 'noAccess') ||
                      $route.query.searchResult == 'true' ||
                      $route.query.searchResult == true
                    "
                  >
                    {{ item.icon }}
                  </v-icon>
                  <v-img
                    v-else-if="item.image == true"
                    color="dark"
                    v-bind="req"
                    v-on="on"
                    alt="project Logo"
                    contain
                    :src="require(`../../assets/${item.src}`)"
                    height="19"
                    width="19"
                  />
                </template>
                <v-list>
                  <v-list-item>
                    <h4 class="mt-n7 font-class-name text-color">
                      {{ item.title }}
                    </h4>
                  </v-list-item>
                  <hr class="mt-n5 mb-n1" />
                  <v-list
                    class="mt-2"
                    v-for="mainItem in item.mainItems"
                    :key="mainItem.title"
                  >
                    <v-menu
                      v-model="mainItem.isOpened"
                      bottom
                      right
                      content-class="collapsed-submenu-position"
                      v-if="mainItem.subItems && mainItem.subItems.length != 0"
                    >
                      <template width="200px" v-slot:activator="{ on, req }">
                        <v-list-item
                          v-bind="req"
                          v-on="on"
                          dense
                          class="mb-n4 mt-n3 font-class-name"
                          v-on:click="checkApplication(mainItem.title, item)"
                          >{{ mainItem.title }}
                        </v-list-item>
                      </template>
                      <v-list
                        v-if="
                          mainItem.subItems && mainItem.subItems.length != 0
                        "
                      >
                        <v-list-item>
                          <h4 class="mt-n7 font-class-name text-color">
                            {{ mainItem.title }}
                          </h4>
                        </v-list-item>
                        <hr class="mt-n5 mb-n1" />
                        <v-list
                          class="mt-2"
                          v-for="subItem in mainItem.subItems"
                          :key="subItem.title"
                        >
                          <v-menu
                            v-model="subItem.isOpened"
                            close-delay="1000"
                            bottom
                            right
                            max-width="100px"
                            :nudge-width="11"
                          >
                            <template
                              width="200px"
                              v-slot:activator="{ on, attrs }"
                            >
                              <v-list-item
                                v-on="on"
                                dense
                                v-bind="attrs"
                                @click="
                                  goToApplicationModal(
                                    item.title,
                                    mainItem.title,
                                    subItem.title
                                  )
                                "
                                class="mb-n4 mt-n3 font-class-name"
                                >{{ subItem.title }}
                              </v-list-item>
                            </template>
                          </v-menu>
                        </v-list>
                      </v-list>
                    </v-menu>
                    <v-list-item
                      v-else
                      dense
                      class="mb-n4 mt-n3 font-class-name"
                      v-on:click="checkApplication(mainItem.title, item)"
                      >{{ mainItem.title }}
                    </v-list-item>
                  </v-list>
                </v-list>
              </v-menu>
              <span class="ml-5">{{ item.title }}</span>
            </v-list-item-icon>
          </v-list-item>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container class="px-0 py-0 fill-height" fluid>
        <v-row class="fill-height">
          <v-col class="py-0">
            <transition name="fade">
              <slot />
            </transition>
          </v-col>
        </v-row>
        <Snackbar />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Snackbar from "../Common/Snackbar";
import request from "../../utils/request";
import helper from "../../utils/helper";

export default {
  components: {
    Snackbar,
  },
  data: () => ({
    searchType: "searchProject",
    wordMatch: "fullMatch",
    menu: false,
    search: "",
    getCurrentActiveProjectData: null,
    sidebarMenu: true,
    Opened: true,
    toggleMini: true,
    isCollapsed: true,
    projects: [],
    selectedProjectId: null,
    selectedProjectName: "",
    currentUserName: "",
    currentUserEmail: "",
    items: [
      {
        title: "Home",
        icon: "mdi-home-outline",
        id: "home",
        isOpened: false,
        image: false,
      },
      {
        title: "Quality",
        icon: "mdi-check-decagram-outline",
        id: "quality",
        isOpened: false,
        image: false,

        mainItems: [
          {
            title: "Cover Page",
            isOpened: false,
            subItems: [
              { title: "New", isOpened: false },
              { title: "Edit", isOpened: false },
              { title: "View", isOpened: false },
            ],
          },
        ],
      },
    ],

    getActiveProjectForSelectDropdown: [],
  }),
  computed: {
    ...mapGetters({
      getoptionModal: "modal/getOptionModal",
      navSelectedProjectIds: "navSelectedProjectId",
      isDocReadOnly: "tree/isDocReadOnly",
      getReasonForDocDisable: "tree/getReasonForDocDisable",
      nodeMeta: "tree/getNodeMeta",
      currentUser: "getUser",
    }),

    ...mapGetters(["allProjects"]),
    navSelectedProjectId: {
      get() {
        return this.navSelectedProjectIds;
      },
      set(navSelectedProjectIds) {
        return navSelectedProjectIds;
      },
    },
    mini: {
      get() {
        return this.toggleMini;
      },
      set() {
        return this.toggleMini;
      },
    },
  },
  watch: {
    $route(val, oldVal) {
      this.isCollapsed = true;
      this.isOpened = false;
      const newPageAnchor = val.path.split("/")[2];
      const oldPageAnchor = oldVal.path.split("/")[2];
      if (newPageAnchor !== oldPageAnchor) {
        const newActiveAnchor = document.getElementById(newPageAnchor);
        const oldActiveAnchor = document.getElementById(oldPageAnchor);
        if (newActiveAnchor)
          newActiveAnchor.classList.add("v-list-item--active");
        if (oldActiveAnchor)
          oldActiveAnchor.classList.remove("v-list-item--active");
      }
    },
    "$route.params.projectId"() {
      this.selectedProjectId = this.$route.params.projectId;
      this.navSelectedProjectId = this.selectedProjectId;
      this.getCurrentSelectedProjectData();
    },
    search: {
      handler() {
        if (this.search != "table" && this.search != "img") {
          this.searchSetting({
            searchText: this.search,
            searchType: this.getoptionModal.searchType,
            wordMatch: this.getoptionModal.wordMatch,
          });
          if (this.search == "" || this.search == null) {
            this.removeHighlight();
          }
        }
      },
    },
    searchType: {
      handler() {
        if (this.searchType != this.getoptionModal.searchType) {
          this.searchSetting({
            searchText: this.search,
            searchType: this.searchType,
            wordMatch: this.getoptionModal.wordMatch,
          });
          if (this.searchType === "searchDoc") {
            this.getSearchResults();
          } else {
            this.removeHighlight();
          }
        }
      },
    },
    wordMatch: {
      handler() {
        if (this.wordMatch != this.getoptionModal.wordMatch) {
          this.searchSetting({
            searchText: this.search,
            searchType: this.getoptionModal.searchType,
            wordMatch: this.wordMatch,
          });
          if (this.searchType === "searchDoc") {
            this.getSearchResults();
          } else {
            this.removeHighlight();
          }
        }
      },
    },
    "getoptionModal.searchText"() {
      if (this.getoptionModal.searchText && !this.search) {
        this.search = this.getoptionModal.searchText;
        this.wordMatch = this.getoptionModal.wordMatch;
      }
    },
  },
  methods: {
    ...mapActions(["checkUserAccessForApplication", "getProjects"]),
    ...mapActions({
      setSnackbar: "snackbar/setSnackbar",
      removeUser: "removeUser",
      setCurrentProject: "tree/setCurrentProject",
      searchSetting: "modal/searchSetting",
      removeHighlight: "tree/removeHighlight",
      hightlightNode: "tree/hightlightNode",
    }),

    getDocType() {
      const docType = localStorage.getItem("templateType");
      return docType;
    },

    //Search methods
    clearSearch() {
      this.search = "";
    },
    showSearchResults() {
      this.searchSetting({
        searchText: this.search,
        searchType: this.searchType,
        wordMatch: this.wordMatch,
      });
      if (
        (this.searchType == "searchApp" ||
          this.searchType == "searchProject") &&
        this.getoptionModal.searchText &&
        this.$route.name != "SearchResult"
      ) {
        const { projectId } = this.$route.params;
        let routeData = this.$router.resolve({
          path: `/project/search/${projectId}/search-result`,
          query: {
            searchText: this.getoptionModal.searchText,
            wordMatch: this.getoptionModal.wordMatch,
            searchType: this.searchType,
          },
        });
        window.open(routeData.href, "_blank");
      } else if (this.searchType === "searchDoc") {
        this.getSearchResults();
      }
    },
    async getSearchResults() {
      this.removeHighlight();
      if (this.search) {
        const { projectId, docId } = this.$route.params;
        var searchText = this.getoptionModal.searchText;
        var wordMatch = this.getoptionModal.wordMatch;
        var nullData = null;
        var docType = localStorage.getItem("templateType");
        if (docType == "Test") docType = localStorage.getItem("subDocType");
        const response = await request({
          url: `/document/get-search-results/${projectId}/${docId}/${nullData}/${nullData}/${searchText}/${wordMatch}/${docType}`,
          method: "get",
        });
        if (response.data) {
          var keySet = [];
          response.data.searchResults.forEach((obj) => {
            keySet.push(obj._key);
          });
          this.hightlightNode({ keys: keySet, status: true });
        }
      }
    },
    //ends here
    //access for application

    //access for application ends
    handleAppSetting() {
      const { projectId } = this.$route.params;
      this.$router.push(`/project/${projectId}/setting`).catch(() => {});
    },
    async getInitData() {
      await this.getProjects();
      const projects = await JSON.parse(localStorage.getItem("projects"));
      this.projects = projects;
      await this.getRefIdAndNameFromProject();
      await this.getActiveProjectsForSelectDropdown();
    },
    getActiveProjectsForSelectDropdown() {
      this.getActiveProjectForSelectDropdown = [];
      this.projects.map((project) => {
        this.getActiveProjectForSelectDropdown.push(project);
      });
    },
    async getCurrentSelectedProjectData() {
      const { projectId } = this.$route.params;
      if (projectId != undefined && projectId != "projectNullId") {
        this.getCurrentActiveProjectData = await helper.getProject(projectId);
      } else this.getCurrentActiveProjectData = null;
    },

    //eslint-disable-next-line
    checkApplication(page, item) {},

    async goToApplicationModal(title, tabOption, tab) {
      if (tabOption === "Cover Page") {
        this.openCoverPageApplication(tab);
        this.closeMenu();
      }
    },
    closeMenu() {
      this.items.forEach((item) => {
        item.isOpened = false;
      });
    },
    openCoverPageApplication(tab) {
      const { projectId } = this.$route.params;
      if (this.isDocReadOnly == true && tab == "New") {
        this.$router
          .push(`/project/${projectId}/coverpage-access?action=create`)
          .catch(() => {});
      } else if (this.isDocReadOnly == true && tab == "Edit") {
        this.$router
          .push(`/project/${projectId}/coverpage-access?action=edit`)
          .catch(() => {});
      } else {
        localStorage.setItem("selectedCoverPageMode", tab);
        localStorage.setItem("templateType", "Cover Page");
        this.$router
          .push(`/project/cover-page/${projectId}/id/design?tab=${tab}`)
          .catch(() => {});
      }
    },

    // eslint-disable-next-line
    navigateToItemPage(item) {},
    async navigateToProject(id) {
      localStorage.setItem("selectedCoverPageMode", "View");
      localStorage.setItem("templateType", "Cover Page");
      this.$router
        .push(`/project/cover-page/${id}/id/design?tab=View`)
        .catch(() => {});
    },

    onLogoutSuccess() {
      this.removeUser();
      this.setSnackbar({ message: "Logout Successfully", color: "info" });
      this.$router.push("/").catch(() => {});
    },
    handleUserSettings() {
      const { projectId } = this.$route.params;
      this.$router.push(`/project/${projectId}/userSetting`).catch(() => {});
    },
    async handleLogout() {
      await request({
        url: "/user/signout",
        method: "get",
        onSuccess: this.onLogoutSuccess,
      });
    },
    getRefIdAndNameFromProject() {
      if (this.projects != null) {
        const project = this.projects.find(
          (project) => project.refId === this.selectedProjectId
        );
        if (project) {
          this.selectedProjectName = project.name;
          this.navSelectedProjectId = project.id;
        }
      }
    },
  },

  async mounted() {
    this.selectedProjectId = this.$route.params.projectId;
    this.navSelectedProjectId = this.selectedProjectId;
    await this.setCurrentProject(this.selectedProjectId);
    this.getInitData();
    await this.getCurrentSelectedProjectData();
    this.openedAppli = localStorage.getItem("templateType");
    this.selectedProjectId = this.$route.params.projectId;
    if (this.currentUser) {
      this.currentUserName = this.currentUser.name;
      this.currentUserEmail = this.currentUser.email;
    }
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors.scss";

.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.25s;
}
.text-color {
  color: $textColor;
}
.project-dropdown {
  width: 200px;
}
.fade-enter-active {
  transition-delay: 0.25s;
}

.text-primary {
  color: #1976d2;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.v-application ul {
  padding-left: 12px;
}

.v-responsive__content {
  width: 120px !important;
}

.search {
  height: 55px;
}

.sidenav ::-webkit-scrollbar {
  display: none;
}

.v-menu__content {
  background-color: white;
}
.collapsed-menu-position {
  left: 50px !important;
  z-index: 10 !important;
}
.profile-menu-position {
  top: 60px !important;
}

.font-class-name {
  font-size: 14px;
}
.collapsed-submenu-position {
  left: 200px !important;
}
.collapsed {
  margin-left: -20px;
  width: 70px !important;
}
.collapse-main .v-main {
  padding-left: 50px !important;
}

@media only screen and (max-width: 1024px) {
  .font-size {
    font-size: 14px;
  }
}
.searchMenu {
  width: 320px;
}
</style>
