<template>
  <div class="ma-0 mt-n6">
    <v-row justify="center" class="ma-2">
      <v-col class="mx-auto">
        <div
          outlined
          v-bind:style="{
            height: height,
            width: width,
            border: '1px solid lightgrey',
            borderRadius: '4px',
          }"
          class="ck-content mx-auto"
        >
          <v-card
            class="scroll"
            id="inner-style"
            v-html="text"
            flat
            v-bind:style="{
              marginRight: `${rightPadding}${unit}`,
              marginLeft: `${leftPadding}${unit}`,
              marginBottom: `${bottomPadding}${unit}`,
              marginTop: `${topPadding}${unit}`,
              height: `${innerCardHeight}${unitForHeight}`,
            }"
          >
          </v-card>
        </div>
      </v-col>
    </v-row>
  </div>
</template>  
<script>
import { mapActions, mapGetters } from "vuex";
export default {
  data() {
    return {
      text: "",
      width: "148mm",
      height: "210mm",
      unitForHeight: "mm",
      unit: "mm",
      rightPadding: 12.7,
      bottomPadding: 12.7,
      leftPadding: 12.7,
      topPadding: 12.7,
      innerCardHeight: 210,
      properties: {},
    };
  },
  methods: {
    async setEditorData() {
      await this.fetchDocument();
      if (this.documentProperties) {
        this.properties = this.documentProperties;
        this.height = this.properties.height;
        this.width = this.properties.width;
        this.text = this.documentProperties.text;
        this.unit = this.documentProperties.unit;
        if (this.properties.margins) {
          this.leftPadding = this.properties.margins.leftMargin;
          this.rightPadding = this.properties.margins.rightMargin;
          this.topPadding = this.properties.margins.topMargin;
          this.bottomPadding = this.properties.margins.bottomMargin;
        }
        let innerTopPadding = "";
        let innerBottomPadding = "";
        if (this.topPadding && this.bottomPadding) {
          if (this.properties.unit == "in") {
            innerTopPadding = this.topPadding * 25.4;
            innerBottomPadding = this.bottomPadding * 25.4;
          } else if (this.properties.unit == "cm") {
            innerTopPadding = this.topPadding * 10;
            innerBottomPadding = this.bottomPadding * 10;
          } else if (this.properties.unit == "mm") {
            innerTopPadding = this.topPadding;
            innerBottomPadding = this.bottomPadding;
          }
        }

        let outerCardHeight = 0;
        if (this.height) {
          outerCardHeight = this.height.slice(0, this.height.length - 2);
          this.innerCardHeight =
            parseInt(outerCardHeight) -
            (parseInt(innerTopPadding) + parseInt(innerBottomPadding));
        }
      } else this.text = "";
      if (this.$route.params.docId == "id") {
        this.height = "297mm";
        this.width = "210mm";
        this.text = "";
      }
      if (
        !this.innerCardHeight ||
        this.innerCardHeight == undefined ||
        typeof this.innerCardHeight !== "number"
      )
        this.innerCardHeight = 140;
      this.innerCardHeight = this.innerCardHeight - 2;
    },

    ...mapActions({
      onInputFieldUpdate: "tree/onInputFieldUpdate",
      removeHighlight: "tree/removeHighlight",
      documentTreeData: "tree/getDocumentTreeData",
      fetchDocument: "tree/fetchDocument",
    }),
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
      } else if (this.$route.params.docId != "id") {
        this.setEditorData();
      }
    },
  },
};
</script>

<style scoped>
.scroll {
  overflow: hidden;
}
.ck-content #inner-style .restricted-editing-exception {
  background-color: green !important;
  border: 1px black !important;
  font-size: 150px;
}
</style>
