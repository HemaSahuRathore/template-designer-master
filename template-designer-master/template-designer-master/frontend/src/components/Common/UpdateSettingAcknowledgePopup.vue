<template>
  <v-dialog v-model="dialog" persistent width="440">
    <v-card min-height="200px" class="text-center">
      <div class="fixed-toolbar title" height="20px">
        <v-icon
          class="float-right mr-5 mt-2"
          color="white"
          @click="closeDialog()"
          >mdi-close</v-icon
        >
        <v-card-title style="color: white; font-weight: normal">
          <v-breadcrumbs large class="pa-0 ml-0 mt-n3 mb-n1">
            <v-breadcrumbs-item> Settings > Update</v-breadcrumbs-item>
          </v-breadcrumbs>
        </v-card-title>

        <v-divider />
      </div>

      <div class="pa-4">
        <v-row justify="center">
          <v-icon size="64" class="text-center" color="green"
            >mdi-information-outline</v-icon
          >
        </v-row>
        <v-row dense justify="center" class="mt-5 pl-2 pr-2">
          <p style="color: #4a442a">
            This setting was updated for {{ appName }} application also.
          </p>
        </v-row>
        <v-row justify="center" align="center" class="mt-5 mb-0">
          <v-btn small class="button white--text" @click="closeDialog"
            >Ok</v-btn
          >
        </v-row>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      appName: ""
    };
  },
  methods: {
    closeDialog() {
      this.dialog = false;
    },
    openDialog(appName) {
      this.dialog = true;
      this.appName = appName;
    }
  }
};
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors.scss";
.title {
  background: $blue;
}
</style>
