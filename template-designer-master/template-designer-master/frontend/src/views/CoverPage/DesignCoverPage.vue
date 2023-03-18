<template>
  <v-row justify="center">
    <v-col class="">
      <CoverPageEditor class="mt-0" ref="ckeditor" />
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import CoverPageEditor from "../../components/CoverPage/Ckeditor.vue";
export default {
  components: {
    CoverPageEditor,
  },
  name: "DesignCoverPage",

  data: () => ({
    properties: {},
    coverPage: {},
    rightPadding: "",
    bottomPadding: "",
    leftPadding: "",
    topPadding: "",
  }),

  watch: {},

  computed: {
    ...mapGetters({
      documentProperties: "tree/getDocumentProperties",
      documentDataCount: "tree/getDocumentDataCount",
      documentTreeData: "tree/getDocumentTreeData",
    }),
  },
  methods: {
    ...mapActions({
      setSnackbar: "snackbar/setSnackbar",
      fetchDocument: "tree/fetchDocument",
    }),

    async setPageMargins(marginData) {
      if (this.$refs.ckeditor)
        await this.$refs.ckeditor.setPageMargins(marginData);
    },

    async showOrhideMargin(data) {
      if (this.$refs.ckeditor) this.$refs.ckeditor.viewOrHideMargin(data);
    },
    async setPageDiamension(data) {
      if (this.$refs.ckeditor) await this.$refs.ckeditor.setPageDimension(data);
    },
  },
  mounted() {
    this.properties = this.documentProperties;
  },
};
</script>
<style scoped>

</style>
