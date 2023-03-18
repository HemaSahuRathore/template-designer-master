<template>
  <div class="pt-0 mb-4 mt-n2">
    <div class="document-editor ma-0 pa-0">
      <div
        class="ck-content"
        id="document-editor__editable-container-restricted"
      >
        <ckeditor
          :editor="editor2"
          :value="text"
          @input="inputChange()"
          id="editorRestrictedMode"
          @ready="onReady($event)"
        ></ckeditor>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import CKEDITOR from "@ckeditor5-classic/build/ckeditor.js";
export default {
  data() {
    return {
      editor2: CKEDITOR.InlineEditor,
      text: "",
      getSelectedMode: "",
      rightPadding: 12.7,
      bottomPadding: 12.7,
      leftPadding: 12.7,
      topPadding: 12.7,
      height: "297mm",
      width: "210mm",
      unit: "mm",
      properties: {},
    };
  },
  methods: {
    applyPageDimensionToCkeditor() {
      var r = document.querySelector(":root");
      r.style.setProperty(`--h`, this.height);
      r.style.setProperty(`--w`, this.width);
    },
    appyMarginToCkeditor() {
      var r = document.querySelector(":root");
      r.style.setProperty(`--pl`, this.leftPadding + this.unit);
      r.style.setProperty(`--pr`, this.rightPadding + this.unit);
      r.style.setProperty(`--pt`, this.topPadding + this.unit);
      r.style.setProperty(`--pb`, this.bottomPadding + this.unit);
    },
    async getEditorSize() {
      this.applyPageDimensionToCkeditor();
      this.appyMarginToCkeditor();
    },
    inputChange() {},
    async onReady(editor) {
      editor.ui.view.panel.element.setAttribute("style", "display:none");
      this.setEditorData();
    },
    async setEditorData() {
      await this.fetchDocument();
      setTimeout(async () => {
        if (this.documentProperties) {
          this.properties = this.documentProperties;

          this.text = this.documentProperties.text;
          this.selectedPageSize = this.documentProperties.pageSize;
          this.leftPadding = this.properties.margins.leftMargin;
          this.rightPadding = this.properties.margins.rightMargin;
          this.topPadding = this.properties.margins.topMargin;
          this.bottomPadding = this.properties.margins.bottomMargin;
          this.height = this.properties.height;
          this.width = this.properties.width;
          this.unit = this.properties.unit;
          this.getEditorSize();
        } else this.text = "";
        if (this.$route.params.docId == "id") {
          this.leftPadding = this.properties.margins.leftMargin;
          this.rightPadding = this.properties.margins.rightMargin;
          this.topPadding = this.properties.margins.topMargin;
          this.bottomPadding = this.properties.margins.bottomMargin;
          this.height = "297mm";
          this.width = "210mm";
          this.getEditorSize();
          this.text = "";
        }
      }, 100);
    },
    ...mapActions({
      onInputFieldUpdate: "tree/onInputFieldUpdate",
      removeHighlight: "tree/removeHighlight",
      documentTreeData: "tree/getDocumentTreeData",
      fetchDocument: "tree/fetchDocument",
    }),

    highlightText(value) {
      this.text = value;
    },
    clearHighlights() {},
  },
  computed: {
    ...mapGetters({
      documentProperties: "tree/getDocumentProperties",
      nodeState: "tree/getNodeData",
      nodeMeta: "tree/getNodeMeta",
      
    }),
  },
  mounted() {
    this.setEditorData();
    this.properties = this.documentProperties;
    if (this.$route.params.docId == "id") {
      this.height = "297mm";
      this.width = "210mm";

      this.getEditorSize();
      this.text = "";
    }
  },
  watch: {
    "documentProperties.text"() {
      if (this.documentProperties.text)
        if (this.$route.params.docId != "id")
          this.text = this.documentProperties.text;
        else this.text = "";
    },
    $route() {
      if (this.$route.params.docId == "id") {
        this.height = "297mm";
        this.width = "210mm";
        this.text = "";
        this.getEditorSize();
      } else if (this.$route.params.docId != "id") {
        this.setEditorData();
      }
    },
  },
};
</script>

<style scoped lang="scss">

</style>


