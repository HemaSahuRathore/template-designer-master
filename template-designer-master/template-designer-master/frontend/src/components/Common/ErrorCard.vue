<template>
  <div class="content">
    <v-card class="pb-2" elevation="0" outlined>
      <div style="display: flex; align-items: center; height: 50px">
        <v-row dense class="justify-center mr-0 ml-1">
          <v-card-title
            style="font-weight: bold"
            :style="{ color: errorData.color }"
          >
            <v-breadcrumbs class="px-0 py-0" large>
              <v-breadcrumbs-item
                >{{ errorData.breadCrumb }}
              </v-breadcrumbs-item>
            </v-breadcrumbs>
          </v-card-title>
        </v-row>
      </div>
      <v-divider />

      <div class="pa-4">
        <div
          style="display: flex; justify-content: center; align-content: center"
        >
          <v-icon :color="errorData.color" size="64" class="mt-2 mb-3">{{
            errorData.icon
          }}</v-icon>
        </div>
        <v-row dense justify="center">
          <p style="color: red">
            {{ errorData.errorMessage }}
          </p></v-row
        >
        <v-row dense style="text-align: center" class="mt-n3"
          ><p>{{ errorData.infoMessage }}</p>
        </v-row>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  props: ["errorData"],

  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>

<style scoped>
.content {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  width: 500px;
}
</style>
