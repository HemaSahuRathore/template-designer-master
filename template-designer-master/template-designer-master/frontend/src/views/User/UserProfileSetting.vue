<template>
  <div class="ma-5 mt-8">
    <v-expansion-panels multiple focusable>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <span>Auto Lock Edit View</span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="mt-8">
            <v-row>
              <div v-for="item in applications" :key="item.name">
                <v-checkbox
                  dense
                  :label="item.name"
                  v-model="item.lockEditViewAutomatically"
                  readonly
                  class="mt-n1 mr-8"
                ></v-checkbox>
              </div>
            </v-row>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import request from "../../utils/request";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      applications: [],
    };
  },
  mounted() {
    this.setNavPath("User Settings");
    const { projectId } = this.$route.params;
    this.setCurrentProject(projectId);
    this.getUserSetting();
  },
  methods: {
    ...mapGetters({
      currentUser: "getUser",
      getCurrentproject: "tree/getCurrentProject",
    }),
    ...mapActions({
      setNavPath: "modal/setNavPath",
      setCurrentProject: "tree/setCurrentProject",
    }),
    async getUserSetting() {
      const email = this.currentUser().email;
      const response = await request({
        url: `/user/fetch/one/${email}`,
        method: "get",
      });
      if (response.data && response.data.lockEditViewAutomatically) {
        const project = this.getCurrentproject();

        var installedApllications = [];
        for (var key in project.appSettings) {
          const data = project.appSettings[key];
          if (
            data.name &&
            project.appSettings.applications.indexOf(data.name) != -1
          ) {
            const appObj = {
              key: key,
              name: data.name,
            };
            installedApllications.push(appObj);
          }
        }
        const applicationSetting = response.data.lockEditViewAutomatically;
        for (key in applicationSetting) {
          const index = installedApllications.findIndex(
            (app) => app.key == key
          );
          if (index != -1) {
            const app = installedApllications[index];
            const appObj = {
              name: app.name,
              lockEditViewAutomatically: applicationSetting[key],
            };
            this.applications.push(appObj);
          }
        }
      }
    },
  },
};
</script>