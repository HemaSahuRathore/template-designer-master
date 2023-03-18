<template>
  <div>
    <v-snackbar
      v-for="(snackbar, i) in snackbars"
      :key="snackbar.id"
      :style="{ 'margin-bottom': calcMargin(i) }"
      v-model="snackbar.id"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
    >
      {{ snackbar.message }}
      <v-icon
        class="float-right"
        color="dark"
        style="cursor: pointer"
        @click.native="removeSnackbar(snackbar.id)"
        >mdi-close-circle</v-icon
      >
    </v-snackbar>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters({ snackbars: "snackbar/getSnackbar" })
  },
  methods: {
    ...mapActions({ removeSnackbar: "snackbar/removeSnackbar" }),
    calcMargin(i) {
      return i * 65 + "px";
    }
  }
};
</script>
