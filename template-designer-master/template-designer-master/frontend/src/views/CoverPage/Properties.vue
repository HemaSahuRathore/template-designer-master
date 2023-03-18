<template>
  <div class="ma-4">
    <v-row justify="center">
      <v-col cols="7">
        <div class="mt-3 ma-0 pa-0">
          <v-row>
            <v-col cols="">
              <v-text-field
                label="Document Name"
                outlined
                dense
                :rules="nameRules"
                :readonly="
                  isDocReadOnly == true ||
                  $route.query.searchResult == 'true' ||
                  $route.query.searchResult == true
                "
                v-model="properties.name"
                placeholder="Enter Document Name"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                label="Topic of the document"
                outlined
                dense
                :readonly="isDocReadOnly == true"
                v-model="properties.subject"
                @blur="onInputBlurHandle"
                placeholder="Enter Subject of the docs"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                label="creator name"
                dense
                outlined
                readonly
                v-model="properties.creator"
                placeholder="creator"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                label="Company"
                dense
                outlined
                readonly
                v-model="properties.company"
                placeholder="company"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-combobox
                :items="properties.keywords"
                v-model="properties.keywords"
                label="Keywords"
                multiple
                dense
                chips
                :readonly="
                  isDocOpenedInReadOnly == true || isDocReadOnly == true
                "
                outlined
                placeholder="Enter Keywords"
                hide-details="auto"
                @blur="onInputBlurHandle('keywords')"
              >
                <template v-slot:selection="{ attrs, item, select, selected }">
                  <v-chip
                    v-bind="attrs"
                    :input-value="selected"
                    close
                    small
                    :readonly="
                      isDocOpenedInReadOnly == true || isDocReadOnly == true
                    "
                    @click="select"
                    @click:close="remove(item)"
                  >
                    {{ item }}
                  </v-chip>
                </template>
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>
                        Press <kbd>enter</kbd> to create a new one
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-combobox>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                label="Description of the document in brief."
                outlined
                dense
                :readonly="
                  isDocOpenedInReadOnly == true || isDocReadOnly == true
                "
                @blur="onInputBlurHandle"
                v-model="properties.description"
                placeholder="Enter Description of the docs"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col cols="6">
              <v-text-field
                label="Creation Date"
                dense
                readonly
                outlined
                :value="properties.createdAt | formatDate"
                placeholder="docs Creation date"
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Modification Date"
                dense
                outlined
                readonly
                :value="properties.modifiedAt | formatDate"
                placeholder="docs Modification date"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                label="Project Name"
                readonly
                dense
                v-model="selectedProjectName"
                outlined
                placeholder="Project Name"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                label="Category value"
                outlined
                dense
                @blur="onInputBlurHandle"
                :readonly="isDocReadOnly == true"
                v-model="properties.category"
                placeholder="Category value"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                v-model="properties.authorsList"
                :items="properties.authorsList"
                attach
                label="Authors List"
                multiple
                outlined
                dense
                readonly
                :item-text="'name'"
                :item-value="'_key'"
                placeholder="Authors List"
                hide-details="auto"
              ></v-select>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import request from "../../utils/request";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Properties",
  data() {
    return {
      properties: {
        name: "",
        subject: "",
        creator: "",
        company: "Collaboration Systems",
        createdAt: new Date(),
        modifiedAt: new Date(),
        keywords: [],
        description: "Cover Page",

        authorsList: [],
        use: "",
        category: "",
        pageSize: "A4",
        selectedMode: "portrait",
        margin: "Narrow",
        margins: {
          leftMargin: "12.7mm",
          rightMargin: "12.7mm",
          bottomMargin: "12.7mm",
          topMargin: "12.7mm",
        },
        height: "297mm",
        width: "210mm",
        unit: "mm",
      },
      existingItems: [],
      nameRules: [
        (v) => {
          if (!v) return "Required";

          if (/[!@#$%^&*()+=[\]{};':"\\|,.<>/?]+/.test(v))
            return "Document Name should not contain special Characters";

          let nameIndex = 0;

          if (this.existingItems)
            this.existingItems.forEach((a) => {
              if (this.$route.params.docId != a.refId)
                if (
                  a.properties.name.toLocaleLowerCase() ===
                  v.toLocaleLowerCase()
                )
                  nameIndex = 1;
            });

          if (nameIndex > 0) {
            return "Coverpage Name is already present";
          } else {
            this.saveData();

            return true;
          }
        },
      ],

      isDocOpenedInReadOnly: false,
      currentUser: "",
      selectedProjectName: "",
    };
  },
  watch: {
    documentProperties() {
      if (this.documentProperties)
        this.properties = JSON.parse(JSON.stringify(this.documentProperties));
    },
    docName() {
      if (this.documentProperties)
        this.properties = JSON.parse(JSON.stringify(this.documentProperties));
    },
  },

  mounted() {
    let routeString = "Quality > Cover Page ";
    this.setNavPath(routeString);
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (
      this.documentProperties &&
      this.documentProperties.name &&
      this.$route.params.docId != "id"
    )
      this.properties = this.documentProperties;
    this.isDocOpenedInReadOnly = localStorage.getItem("isReadonly");
    const projects = JSON.parse(localStorage.getItem("projects"));

    projects.find((project) => {
      if (project.id === this.$route.params.projectId) {
        this.selectedProjectName = project.name;
      }
    });
    let docType = localStorage.getItem("templateType");
    if (docType == "Cover Page") this.fetchDocuments();
  },

  computed: {
    ...mapGetters({
      documentProperties: "tree/getDocumentProperties",
      isDocReadOnly: "tree/isDocReadOnly",
      docName: "tree/getDocumentName",
    }),
  },

  methods: {
    ...mapActions({
      onInputFieldUpdate: "tree/onInputFieldUpdate",
      setNavPath: "modal/setNavPath",
    }),
    onInputBlurHandle(e) {
      if (e === "keywords" || e.target.value.trim() !== "") {
        if (this.isDocReadOnly == false) {
          this.saveData();
        }
      }
    },
    async saveData() {
      if (this.isDocReadOnly == false) {
        if (this.properties.name != "" && this.$route.params.docId != "id")
          await this.onInputFieldUpdate({
            name: "documentProperties",
            value: this.properties,
          });
      }

      this.fetchDocuments();
    },
    async fetchDocuments() {
      const selectedProjectId = this.$route.params.projectId;
      const response = await request({
        url: `/document/fetch/all/${selectedProjectId}/Cover Page`,
        method: "get",
      });
      if (response && response.data) {
        this.existingItems = response.data;
      }
    },

    remove(item) {
      this.properties.keywords.splice(
        this.properties.keywords.indexOf(item),
        1
      );
      this.properties.keywords = [...this.properties.keywords];
    },
  },

  filters: {
    formatDate(value) {
      return new Date(value).toLocaleString("en-GB").split(",")[0];
    },
  },
};
</script>
