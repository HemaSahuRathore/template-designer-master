<template>
  <div class="mt-2 ma-2">
    <span>
      <div class="document-editor ma-0 pa-0">
        <div class="ck-content ma-1" id="document-editor__editable-container">
          <ckeditor
            :editor="editor1"
            id="ckeditorId"
            class=""
            :value="text"
            @input="inputChange"
            :disabled="isDocReadOnly == true"
            @ready="onReady($event)"
          ></ckeditor>
        </div>
      </div>
    </span>

    <v-snackbar v-model="snackbar" :timeout="2000" color="orange">
      {{ snackbarMsgText }}
    </v-snackbar>
  </div>
</template>


<script>
import { mapGetters, mapActions } from "vuex";
import CKEDITOR from "@ckeditor5-classic/build/ckeditor.js";

export default {
  data() {
    return {
      editor1: CKEDITOR.Editor,
      text: "",
      imageUrl: "",
      properties: {},
      snackbar: false,
      snackbarMsgText: "",
      styleObject: {},
      selectedPageSize: "",
      getSelectedMode: "",
      rightPadding: 12.7,
      bottomPadding: 12.7,
      leftPadding: 12.7,
      topPadding: 12.7,
      height: "297mm",
      width: "210mm",
      unit: "mm",
      whiteColor: "white",
      gradient: `linear-gradient(to bottom, white, white 100%),
      linear-gradient(to bottom, rgb(231, 233, 233) 0%, 
      rgb(222, 225, 226) 100%)`,
      currentUser: "",
      inputChangeCount: 0,
    };
  },
  methods: {
    applyPageDimensionToCkeditor() {
      var r = document.querySelector(":root");
      r.style.setProperty(`--h`, this.height);
      r.style.setProperty(`--w`, this.width);
      this.getHeight();
    },

    appyMarginToCkeditor() {
      var r = document.querySelector(":root");
      r.style.setProperty(`--pl`, this.leftPadding + this.unit);
      r.style.setProperty(`--pr`, this.rightPadding + this.unit);
      r.style.setProperty(`--pt`, this.topPadding + this.unit);
      r.style.setProperty(`--pb`, this.bottomPadding + this.unit);
      this.getHeight();
    },

    applyMarginColorToEditor(data) {
      var r = document.querySelector(":root");
      r.style.setProperty(`--paddingColor`, data.gradient);
      r.style.setProperty(`--background-clip`, data.backgroundClip);
    },

    async getEditorSize() {
      this.applyPageDimensionToCkeditor();
      this.appyMarginToCkeditor();
    },

    viewOrHideMargin(data) {
      const backgroundClip = "content-box, padding-box";

      if (data || data != null) {
        if (this.$route.params.id == "id" || data.viewMargin) {
          if (data.viewMargin) {
            const marginStyle = {
              gradient: this.gradient,
              backgroundClip: backgroundClip,
            };
            this.applyMarginColorToEditor(marginStyle);
          }
        } else if (data && data != null && data.viewMargin == false) {
          const marginStyle = {
            gradient: this.whiteColor,
            backgroundClip: "none",
          };
          this.applyMarginColorToEditor(marginStyle);
        }
      } else {
        const marginStyle = {
          gradient: this.gradient,
          backgroundClip: backgroundClip,
        };
        this.applyMarginColorToEditor(marginStyle);
      }
    },
    async setEditorData() {
      const { docId } = this.$route.params;
      if (docId != "id") await this.fetchDocument();

      setTimeout(() => {
        this.fetchDocument();
        if (this.documentProperties && this.$route.params.docId != "id") {
          this.properties = this.documentProperties;
          this.text = this.documentProperties.text;
          this.selectedPageSize = this.documentProperties.pageSize;
          if (this.properties.margins) {
            this.leftPadding = this.properties.margins.leftMargin;
            this.rightPadding = this.properties.margins.rightMargin;
            this.topPadding = this.properties.margins.topMargin;
            this.bottomPadding = this.properties.margins.bottomMargin;
          }
          this.height = this.properties.height;
          this.width = this.properties.width;
          this.unit = this.properties.unit;
        } else this.text = "";
        if (this.$route.params.docId == "id") {
          this.height = "297mm";
          this.width = "210mm";

          this.text = "";
        }
        this.getEditorSize();
      }, 100);
    },
    ...mapActions({
      onInputFieldUpdate: "tree/onInputFieldUpdate",
      removeHighlight: "tree/removeHighlight",
      documentTreeData: "tree/getDocumentTreeData",
      fetchDocument: "tree/fetchDocument",
    }),
    onReady(editor) {
      editor.ui
        .getEditableElement()
        .parentElement.insertBefore(
          editor.ui.view.toolbar.element,
          editor.ui.getEditableElement()
        );
      this.setEditorData();
    },

    async inputChange(value) {
      localStorage.setItem("dataFromCkeditor", value);

      this.properties = this.documentProperties;
      this.properties.text = "";
      this.properties.text = value;
      this.getHeight();
      if (this.$route.params.docId != "id")
        if (this.isDocReadOnly == false) {
          if (this.inputChangeCount > 0) this.saveData();
        }
      this.inputChangeCount++;
    },

    saveData() {
      if (localStorage.getItem("selectedCoverPageMode") == "Edit") {
        if (this.properties) {
          const key = localStorage.getItem("getSelectedDocKey");

          if (
            this.$route.params.docId == this.getDocumentData.document.refId &&
            key == this.getDocumentData.document._key
          ) {
            this.onInputFieldUpdate({
              name: "documentProperties",
              value: this.properties,
            });
          }
        }
      }
    },
    async setPageMargins(marginData) {
      this.rightPadding = marginData.rightMargin;
      this.bottomPadding = marginData.bottomMargin;
      this.leftPadding = marginData.leftMargin;
      this.topPadding = marginData.topMargin;
      this.unit = marginData.unit;
      this.appyMarginToCkeditor();
    },

    async setPageDimension(data) {
      this.height = data.height;
      this.width = data.width;
      this.applyPageDimensionToCkeditor();
    },

    async getHeight() {
      if (this.inputChangeCount > 0) {
        const selectedUserMode = localStorage.getItem("selectedCoverPageMode");
        if (this.text && this.text != "" && selectedUserMode != "View") {
          let id = "";
          id = "ckeditorId";
          let pageSize = "";
          let selectedMode = "";
          let unit = "";
          if (selectedUserMode == "Edit") {
            pageSize = this.documentProperties.pageSize;
            selectedMode = this.documentProperties.selectedMode;
            unit = this.properties.unit;
          } else if (
            selectedUserMode == "New" ||
            selectedUserMode == "Clone to Create"
          ) {
            if (this.height == "297mm" && this.width == "210mm") {
              pageSize = "A4";
              selectedMode = "portrait";
            } else if (this.height == "210mm" && this.width == "297mm") {
              pageSize = "A4";
              selectedMode = "landScape";
            } else if (this.height == "210mm" && this.width == "148mm") {
              pageSize = "A5";
              selectedMode = "portrait";
            } else if (this.height == "148mm" && this.width == "210mm") {
              pageSize = "A5";
              selectedMode = "landScape";
            }
            unit = this.unit;
          }

          if (document.getElementById(id)) {
            let heightInPixel = 0;
            let widthInPixel = 0;
            heightInPixel = await document.getElementById(id).scrollHeight;
            widthInPixel = await document.getElementById(id).scrollWidth;
            let heightInmm = ((await heightInPixel) * 25.4) / 96;
            let widthInmm = (await (widthInPixel * 25.4)) / 96;
            widthInmm = widthInmm - 10;
            let height = 297;
            let width = 210;
            if (
              pageSize &&
              pageSize != "" &&
              selectedMode &&
              selectedMode != ""
            ) {
              if (pageSize == "A4" && selectedMode == "portrait") {
                height = 297;
                width = 210;
              }
              if (pageSize == "A4" && selectedMode == "landScape") {
                height = 210;
                width = 297;
              } else if (pageSize == "A5" && selectedMode == "portrait") {
                height = 210;
                width = 148;
              } else if (pageSize == "A5" && selectedMode == "landScape") {
                width = 210;
                height = 148;
              }

              let innerTopPadding = "";
              let innerBottomPadding = "";

              if (this.topPadding) {
                if (unit == "in") {
                  innerTopPadding = this.topPadding * 25.4;
                  innerBottomPadding = this.bottomPadding * 25.4;
                } else if (unit == "cm") {
                  innerTopPadding = this.topPadding * 10;
                  innerBottomPadding = this.bottomPadding * 10;
                }
              }

              let marginHeight = 0;
              if (innerTopPadding && innerBottomPadding)
                marginHeight =
                  parseInt(innerTopPadding) + parseInt(innerBottomPadding);

              if (marginHeight) {
                height = height - marginHeight;

                heightInmm = heightInmm - marginHeight - 10;
              }
              if (this.text != "") {
                if (heightInmm > height && widthInmm > width) {
                  this.snackbar = true;
                  this.snackbarMsgText = `Height and width of content is exceeding the ${pageSize} ${selectedMode} size.`;
                } else {
                  if (heightInmm > height) {
                    this.snackbar = true;
                    this.snackbarMsgText = `Height of content is exceeding the ${pageSize} ${selectedMode} size.`;
                  }
                  if (widthInmm > width) {
                    this.snackbar = true;
                    this.snackbarMsgText = `width of content is exceeding the ${pageSize} ${selectedMode} size.`;
                  }
                }
              }
            }
          }
        }
      }
    },
    // eslint-disable-next-line no-unused-vars
    clearHighlights() {},
  },
  computed: {
    ...mapGetters({
      documentProperties: "tree/getDocumentProperties",
      nodeState: "tree/getNodeData",
      nodeMeta: "tree/getNodeMeta",
      getDocumentData: "tree/getDocumentData",
      isDocReadOnly: "tree/isDocReadOnly",
    }),
  },

  mounted() {
    localStorage.setItem("templateType", "Cover Page");
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));

    this.viewOrHideMargin(localStorage.getItem("viewCoverpageMargins"));
    this.setEditorData();
  },
  created() {},
  watch: {
    //eslint-disable-next-line no-unused-vars
    $route() {
      localStorage.setItem("templateType", "Cover Page");
      this.fetchDocument();
      this.inputChangeCount = 0;
      if (this.$route.params.docId == "id") {
        this.height = "297mm";
        this.width = "210mm";
        this.getEditorSize();
        this.text = "";
      } else if (this.$route.params.docId != "id") {
        this.text = this.documentProperties.text;
      }
    },
    "documentProperties.text"() {
      if (this.documentProperties.text)
        this.text = this.documentProperties.text;
      else this.text = "";
    },

    "documentProperties.selectedMode"() {
      this.getSelectedMode = this.properties.selectedMode;
      this.getHeight();
    },
  },
};
</script>

<style scoped lang="scss">
@import url("../../assets/scss/ckeditor.css");
.scroll {
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>
