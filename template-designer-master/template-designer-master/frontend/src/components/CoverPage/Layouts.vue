<template>
  <div class="ml-4 mr-2 pa-1 ma-1" width="100%">
    <v-row justify="center">
      <v-col class="pa-2 ma-2 mr-4" cols="12">
        <v-form
          v-model="valid"
          ref="form"
          lazy-validation
          v-if="
            isDocReadOnly == false &&
            selectedMode != 'View' &&
            selectedMode != ''
          "
          width="100%"
        >
          <v-row dense class="mt-2 mb-n4 ml-0">
            <v-col>
              <v-select
                :menu-props="{ bottom: true, offsetY: true }"
                v-model="selectedMode"
                :items="modeItems"
                label="Mode"
                @change="changeMode(selectedMode)"
                placeholder="Mode"
                outlined
                dense
              ></v-select>
            </v-col>
          </v-row>
          <v-row dense class="mt-1 ml-0">
            <v-col>
              <v-text-field
                v-if="selectedMode == 'New'"
                label="Coverpage Name"
                placeholder="Coverpage Name"
                outlined
                :rules="nameRules"
                dense
                v-model="properties.name"
              >
              </v-text-field>

              <v-text-field
                v-if="selectedMode == 'Edit'"
                label="Coverpage Name"
                placeholder="Coverpage Name"
                outlined
                :readonly="$route.params.docId == 'id'"
                :rules="nameRules"
                dense
                @change="checkcoverPageName(properties.name)"
                v-model="properties.name"
              >
              </v-text-field>
              <v-text-field
                v-else-if="selectedMode == 'Clone to Create'"
                label="Coverpage Name"
                placeholder="Coverpage Name"
                outlined
                :rules="nameRules"
                dense
                v-model="clonnedCoverpageName"
              >
              </v-text-field>
              <v-text-field
                v-else-if="selectedMode == 'View'"
                label="Coverpage Name"
                placeholder="Coverpage Name"
                outlined
                dense
                :readonly="
                  selectedMode == 'View' ||
                  isDocReadOnly == true ||
                  isDocReadOnly == 'true'
                "
                v-model="properties.name"
              >
              </v-text-field>
            </v-col>
          </v-row>

          <v-row dense class="mt-n3 ml-0 mr-n3">
            <v-col cols="8" class="pr-0">
              <v-select
                v-if="selectedMode == 'New'"
                :menu-props="{ bottom: true, offsetY: true }"
                v-model="properties.use"
                :items="docTypeItems"
                label="Use"
                :rules="useRules"
                placeholder="Use"
                outlined
                dense
              ></v-select>
              <v-select
                v-else-if="selectedMode == 'Edit'"
                :menu-props="{ bottom: true, offsetY: true }"
                v-model="properties.use"
                :items="docTypeItems"
                label="Use"
                :readonly="$route.params.docId == 'id'"
                @input="updateData()"
                :rules="useRules"
                placeholder="Use"
                outlined
                dense
              ></v-select>
              <v-select
                v-else
                :menu-props="{ bottom: true, offsetY: true }"
                v-model="properties.use"
                :items="docTypeItems"
                label="Use"
                :readonly="
                  selectedMode == 'View' ||
                  isDocReadOnly == true ||
                  isDocReadOnly == 'true'
                "
                :rules="useRules"
                placeholder="Use"
                outlined
                dense
              ></v-select>
            </v-col>
            <v-col
              cols="3"
              class="ml-2"
              v-if="selectedMode == 'New' || selectedMode == 'Clone to Create'"
            >
              <v-btn
                @click="createCoverpage()"
                v-if="selectedMode == 'New' && isDocReadOnly == false"
                class="button white--text"
                height="38px"
                width="85px"
              >
                Create
              </v-btn>

              <v-btn
                @click="createCoverpageFromExisting()"
                v-else-if="selectedMode == 'Clone to Create'"
                class="button white--text"
                height="38px"
                width="85px"
              >
                Create
              </v-btn>
            </v-col>
          </v-row>
          <v-row class="mr-0 ml-1 mt-0 mb-2">
            <v-expansion-panels
              v-if="selectedMode != 'New'"
              class="ml-0 mr-0"
              v-model="panel"
              dense
              multiple
            >
              <v-expansion-panel>
                <v-expansion-panel-header
                  >Cover Page Library</v-expansion-panel-header
                >

                <v-expansion-panel-content class="pa-0 mr-n8">
                  <v-row dense class="mt-n2 ml-n1 mb-5">
                    <v-col cols="10">
                      <v-select
                        :menu-props="{ bottom: true, offsetY: true }"
                        v-model="docTypeToFilter"
                        :items="docTypeItems"
                        label="Filter"
                        @change="filterExistingItem(docTypeToFilter)"
                        placeholder="Filter"
                        outlined
                        dense
                      ></v-select>
                    </v-col>
                  </v-row>

                  <v-card
                    flat
                    class="scroll pl-2 pt-0 mt-n6 ml-n3 mr-0 pr-0"
                    max-height="250px"
                    min-height="150"
                  >
                    <span
                      v-for="existingSelectedItem in getFilteredExistingItem"
                      :key="existingSelectedItem._key"
                    >
                      <v-radio-group
                        dense
                        v-if="getFilteredExistingItem.length != 0"
                        v-model="selectedExistingDocId"
                        class="mt-2"
                      >
                        <v-radio
                          v-if="existingSelectedItem.properties"
                          dense
                          class="mt-n1 mb-n3"
                          :label="`${existingSelectedItem.properties.name} `"
                          :value="existingSelectedItem.refId"
                          @click="getSelectedDocData(existingSelectedItem)"
                        ></v-radio
                      ></v-radio-group>
                    </span>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-row>
          <span v-if="isDocReadOnly == false && selectedMode != 'View'">
            <v-row
              dense
              class="mt-4 mb-0 ml-1 font-title-color"
              style="font-weight: bold"
              ><span>Orientation</span></v-row
            >

            <v-divider class="mb-2" />
            <v-row dense class="ml-3">
              <v-col cols="4">
                <v-row dense>
                  <v-col>
                    <v-btn icon small>
                      <v-img
                        src="../../assets/images/Coverpage/portrait.png"
                        @click="portraitMode"
                        :class="{
                          'active-icon':
                            getDesignOrientation.isPortrait == true &&
                            properties.selectedMode == 'portrait',
                        }"
                      />
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row dense
                  ><v-col
                    ><span style="font-size: 15px">Portrait</span></v-col
                  ></v-row
                >
              </v-col>
              <v-col cols="4">
                <v-row dense>
                  <v-col>
                    <v-btn icon small>
                      <v-img
                        src="../../assets/images/Coverpage/landscape.png"
                        @click="landScapeMode"
                        :class="{
                          'active-icon':
                            getDesignOrientation.isLandScape == true &&
                            properties.selectedMode == 'landScape',
                        }"
                      />
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row dense
                  ><v-col
                    ><span style="font-size: 15px">Landscape</span></v-col
                  ></v-row
                >
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <v-row dense class="ml-0"
              ><v-col
                ><span
                  style="font-size: 15px; font-weight: bold"
                  class="font-title-color mt-8"
                  >Paper and Margins</span
                ></v-col
              ></v-row
            >
            <v-divider class="mb-4" />
            <v-row class="ml-n2">
              <v-col cols="">
                <v-select
                  :menu-props="{ bottom: true, offsetY: true }"
                  label="Paper size"
                  placeholder="Paper Size"
                  outlined
                  @change="setPageSizeAndUnit()"
                  dense
                  v-model="selectedPageSize"
                  :items="paperSizeItems"
                >
                </v-select>
              </v-col>
              <v-col cols="">
                <v-select
                  :menu-props="{ bottom: true, offsetY: true }"
                  :items="units"
                  dense
                  v-model="unit"
                  @change="setPageSizeAndUnit()"
                  label="Units"
                  placeholder="select unit"
                  hide-details
                  outlined
                  class=""
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="mt-n10 ml-n2" style="font-size: 14px">
              <v-col cols=""> {{ pageSizeWithUnit }}</v-col>
            </v-row>
            <v-row class="mt-n4 ml-n2"
              ><v-col>
                <p style="font-size: 14px">
                  <span class="font-color"> Note : </span> {{ paperSizeNote }}
                </p>
              </v-col>
            </v-row>
            <v-row dense class="mt-2 ml-0">
              <v-col cols="10">
                <v-select
                  dense
                  :items="margins"
                  v-model="margin"
                  label="Margins"
                  auto-grow
                  placeholder="Select margin type"
                  outlined
                  @change="setMarginOrUnit()"
                ></v-select>
              </v-col>
            </v-row>

            <v-row dense class="ml-0 mt-n3" justify="start">
              <v-col cols="4">
                <v-text-field
                  label="Left"
                  v-model="leftMargin"
                  outlined
                  dense
                  min="0"
                  step="0.25"
                  hide-details
                  type="number"
                  @input="customMargin()"
                ></v-text-field>
              </v-col>
              <v-col cols="2"
                ><div class="mt-5">{{ unit }}</div></v-col
              >

              <v-col cols="4">
                <v-text-field
                  label="Right"
                  outlined
                  min="0"
                  dense
                  step="0.25"
                  v-model="rightMargin"
                  hide-details
                  type="number"
                  @input="customMargin()"
                ></v-text-field>
              </v-col>
              <div class="ml-1 mt-5">{{ unit }}</div>
            </v-row>
            <v-row dense class="ml-0 mt-1">
              <v-col cols="4">
                <v-text-field
                  label="Top"
                  v-model="topMargin"
                  outlined
                  min="0"
                  dense
                  step="0.25"
                  hide-details
                  auto-grow
                  type="number"
                  @input="customMargin()"
                ></v-text-field>
              </v-col>

              <v-col cols="2"
                ><div class="mt-5">{{ unit }}</div></v-col
              >

              <v-col cols="4">
                <v-text-field
                  label="Bottom"
                  v-model="bottomMargin"
                  outlined
                  dense
                  min="0"
                  step="0.25"
                  hide-details
                  auto-grow
                  type="number"
                  @input="customMargin()"
                ></v-text-field>
              </v-col>
              <v-col cols="2"
                ><div class="mt-5">{{ unit }}</div></v-col
              >
            </v-row>
            <v-row dense class="ml-0 mt-3">
              <p style="font-size: 15px" class="mt-5 mr-3 ml-1">View Margins</p>
              <v-checkbox
                v-model="viewMargins"
                @click="viewOrhideMargin()"
                color="#42A5F5"
              ></v-checkbox>
            </v-row>
          </span>
        </v-form>
        <v-row
          class="ml-n2"
          v-else-if="isDocReadOnly == true || selectedMode == 'View'"
        >
          <v-col>
            <v-row dense class="mt-2 mb-n4 ml-0 mr-1">
              <v-col>
                <v-select
                  :menu-props="{ bottom: true, offsetY: true }"
                  v-model="selectedMode"
                  :items="modeItems"
                  label="Mode"
                  @change="changeMode(selectedMode)"
                  placeholder="Mode"
                  outlined
                  dense
                  :readonly="
                    $route.query.searchResult == true ||
                    $route.query.searchResult == 'true'
                  "
                ></v-select>
              </v-col>
            </v-row>
            <v-row dense class="mt-0 ml-0">
              <v-col cols="8">
                <v-select
                  :menu-props="{ bottom: true, offsetY: true }"
                  v-model="docTypeToFilter"
                  :items="docTypeItems"
                  label="Use"
                  @change="filterExistingItem(docTypeToFilter)"
                  placeholder="Use"
                  outlined
                  dense
                ></v-select>
              </v-col>
            </v-row>
            <v-card
              flat
              class="scroll pl-2 pt-0 mt-n4 ml-n1 mr-n8 pt-2 pr-0"
              max-height="60vh"
              min-height="150"
              width="60vw"
            >
              <span
                v-for="existingSelectedItem in getFilteredExistingItem"
                :key="existingSelectedItem._key"
              >
                <v-radio-group
                  dense
                  v-if="getFilteredExistingItem.length != 0"
                  v-model="selectedExistingDocId"
                  class="mt-2"
                >
                  <v-radio
                    v-if="existingSelectedItem.properties"
                    dense
                    class="mt-n1 mb-n3"
                    :label="`${existingSelectedItem.properties.name} `"
                    :value="existingSelectedItem.refId"
                    @click="getSelectedDocData(existingSelectedItem)"
                  ></v-radio
                ></v-radio-group>
              </span>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import request from "../../utils/request";

export default {
  data() {
    return {
      marginVisibility: "show",
      margins: ["Normal", "Narrow", "Moderate", "Wide", "Custom"],
      margin: "Narrow",
      leftMargin: 12.7,
      rightMargin: 12.7,
      topMargin: 12.7,
      bottomMargin: 12.7,
      selectedCoverPage: null,
      getDesignOrientation: {
        isPortrait: false,
        isLandScape: false,
      },

      //added variables
      radioRefId: "",

      valid: false,
      modeItems: ["New", "Clone to Create", "Edit", "View"],
      selectedMode: "",

      existingSelectedItem: {
        refId: "",
        key: "",
      },

      existingItem: {},
      existingItems: [],
      filteredExistingItem: [],
      docTypeToFilter: "",
      radioGroup: "",
      properties: {},
      coverPage: {},
      panel: [0],
      viewMargins: true,
      selectedPageSize: "A4",
      paperSizeItems: ["A4", "A5"],
      pageSizeWithUnit: "A4 Standard (210mm x 297mm)",
      units: ["mm", "in", "cm"],
      unit: "mm",
      paperSizeNote:
        "Your content must remain inside the defined dimensions to be exportable to word or pdf document.",

      docTypeItems: [],

      useRules: [
        (v) => {
          if (!v) {
            if (
              this.selectedMode == "Edit" &&
              (this.selectedExistingDocId == "" ||
                this.selectedExistingDocId == "id")
            ) {
              return true;
            } else return "Required";
          } else return true;
        },
      ],
      pageDimensionData: {
        height: "297mm",
        width: "210mm",
      },
      isNamePresent: 0,
      selectedExistingDocId: "",
      clonnedCoverpageName: "",
      nameRules: [
        (v) => {
          if (!v) {
            if (
              this.selectedMode == "Edit" &&
              (this.selectedExistingDocId == "" ||
                this.selectedExistingDocId == "id")
            ) {
              return true;
            } else return "Required";
          }

          if (/[!@#$%^&*()+=[\]{};':"\\|,.<>/?]+/.test(v))
            return "Document Name should not contain special Characters";

          let nameIndex = 0;
          this.isNamePresent = 0;
          if (this.getExistingItemInarray)
            this.getExistingItemInarray.forEach((a) => {
              if (
                (a.properties &&
                  a.properties.name &&
                  this.$route.params.docId != a.refId) ||
                this.selectedMode == "Clone to Create"
              )
                if (
                  a.properties.name.toLocaleLowerCase() ===
                  v.toLocaleLowerCase()
                ) {
                  nameIndex = 1;
                  this.isNamePresent = 1;
                }
            });

          if (nameIndex > 0) {
            return "Coverpage Name is already present";
          } else {
            return true;
          }
        },
      ],

      maxBottomMargin: 0,
      maxTopMargin: 0,
      maxRightMargin: 0,
      maxLeftMargin: 0,
      oldDocId: "",
      newDocId: "",
      unitChangeCount: 0,
      tempCoverPageName: "",
    };
  },

  mounted() {
    localStorage.setItem("templateType", "Cover Page");
    this.selectedMode = localStorage.getItem("selectedCoverPageMode");

    this.radioGroup = localStorage.getItem("selectedCoverPageId");
    if (this.existingItem) this.existingItem.refId = this.radioGroup;
    this.radioRefId = this.radioGroup;

    this.existingSelectedItem.refId = this.$route.params.docId;
    this.selectedExistingDocId = this.$route.params.docId;
    this.existingSelectedItem.key = localStorage.getItem("getSelectedDocKey");

    if (this.isDocReadOnly == true) {
      this.modeItems = ["View"];
      setTimeout(() => {
        this.selectedMode = "View";
        this.changeMode(this.selectedMode);
      }, 1000);
    } else this.modeItems = ["New", "Clone to Create", "Edit", "View"];
    const marginData = JSON.parse(localStorage.getItem("viewCoverpageMargins"));
    if (marginData != null && marginData) {
      this.viewMargins = marginData.viewMargin;
    }
    localStorage.setItem("isCoverPageNamePresent", "notPresent");
    this.initData();
    setTimeout(() => {
      if (this.$route.query.searchResult) {
        this.selectedMode = "View";
        this.changeMode(this.selectedMode);
      }
    }, 1000);
  },

  computed: {
    ...mapGetters({
      documentProperties: "tree/getDocumentProperties",
      getDocumentData: "tree/getDocumentData",
      isDocReadOnly: "tree/isDocReadOnly",
    }),

    getFilteredExistingItem() {
      return this.filteredExistingItem;
    },
    getExistingItemInarray() {
      return this.existingItems;
    },
  },
  watch: {
    isDocReadOnly() {
      if (this.isDocReadOnly == true) {
        this.modeItems = ["View"];
      } else this.modeItems = ["New", "Clone to Create", "Edit", "View"];
    },

    documentProperties() {
      this.selectedMode = localStorage.getItem("selectedCoverPageMode");
      if (this.$refs.form) this.$refs.form.resetValidation();
    },

    unit(val, old) {
      if (this.margin == "Custom") {
        this.getCustomMarginCalculation(val, old);
        this.oldDocId = this.$route.params.docId;
        if (val == old) {
          this.unitChangeCount = 1;
        }
      }
    },

    "$route.name"() {
      if (this.$route.params.docId != "id") {
        this.unitChangeCount = 1;
      }
    },
    "$route.params.projectId"() {
      this.initData();
    },

    $route(val, old) {
      this.oldDocId = old.params.docId;
      this.newDocId = val.params.docId;
      if (this.oldDocId != this.newDocId) this.unitChangeCount = 0;
      if (this.oldDocId == "id" && this.oldDocId != "id") {
        this.properties.name = "";
        this.properties.use = "";
      }
      if (this.$route.params.docId == "id") {
        this.properties.name = "";
        this.properties.use = "";

        this.existingSelectedItem.refId = "";
        this.selectedExistingDocId = "";
        if (this.$refs.form) this.$refs.form.resetValidation();
        this.getDefaultPageData();
      }
      if (this.$refs.form) this.$refs.form.resetValidation();
      setTimeout(() => {
        let mode = this.$route.query.tab;

        if (mode && mode != "" && mode != null) {
          this.selectedMode = mode;
          this.changeMode(this.selectedMode);
        }
      }, 500);
    },

    selectedMode(newVal, oldVal) {
      if (newVal == "Clone to Create") {
        if (oldVal == "View" || oldVal == "Edit") {
          this.properties.name = "";
          this.clonnedCoverpageName = "";
        }
      }
      this.onChangeSelectedMode(newVal);
    },
  },
  methods: {
    ...mapActions({
      setSnackbar: "snackbar/setSnackbar",
      onInputFieldUpdate: "tree/onInputFieldUpdate",
      fetchDocument: "tree/fetchDocument",
    }),

    async initData() {
      await this.fetchDocuments();

      await this.fetchDocument();
      await this.getEditorData();
      this.getDocTypes();
    },
    async getDocTypes() {
      this.docTypeItems = await this.getApplicationDocTypes();
    },
    async getApplicationDocTypes() {
      let docTypes = [];
      const response = await request({
        url: `/config-data/get-docTypes/Cover Page`,
        method: "get",
      });

      if (response && response.data && response.errors.length == 0) {
        docTypes = await response.data;

        return docTypes;
      }
    },
    //eslint-disable-next-line no-unused-vars
    async getCustomMarginCalculation(val, old) {
      if (this.unitChangeCount > 0) {
        let conversionCase = "";
        let calcCase = {
          mmToCm: "mmToCm",
          mmToIn: "mmToIn",
          cmToMm: "cmToMm",
          cmToIn: "cmToIn",
          inToCm: "inToCm",
          inToMm: "inToMm",
        };

        if (val == "cm" && old == "mm") {
          conversionCase = calcCase.mmToCm;
        } else if (val == "in" && old == "mm") {
          conversionCase = calcCase.mmToIn;
        } else if (val == "cm" && old == "in") {
          conversionCase = calcCase.inToCm;
        } else if (val == "mm" && old == "in") {
          conversionCase = calcCase.inToMm;
        } else if (val == "mm" && old == "cm") {
          conversionCase = calcCase.cmToMm;
        } else if (val == "in" && old == "cm") {
          conversionCase = calcCase.cmToIn;
        }
        switch (conversionCase) {
          case calcCase.mmToCm:
            this.leftMargin = 0.1 * this.leftMargin;
            this.rightMargin = 0.1 * this.rightMargin;
            this.topMargin = 0.1 * this.topMargin;
            this.bottomMargin = 0.1 * this.bottomMargin;
            break;
          case calcCase.mmToIn:
            this.leftMargin = this.leftMargin / 25.4;
            this.rightMargin = this.rightMargin / 25.4;
            this.topMargin = this.topMargin / 25.4;
            this.bottomMargin = this.bottomMargin / 25.4;
            break;
          case calcCase.cmToIn:
            this.leftMargin = this.leftMargin / 2.54;
            this.rightMargin = this.rightMargin / 2.54;
            this.topMargin = this.topMargin / 2.54;
            this.bottomMargin = this.bottomMargin / 2.54;
            break;
          case calcCase.cmToMm:
            this.leftMargin = 10 * this.leftMargin;
            this.rightMargin = 10 * this.rightMargin;
            this.topMargin = 10 * this.topMargin;
            this.bottomMargin = 10 * this.bottomMargin;
            break;
          case calcCase.inToCm:
            this.leftMargin = this.leftMargin * 2.54;
            this.rightMargin = this.rightMargin * 2.54;
            this.topMargin = this.topMargin * 2.54;
            this.bottomMargin = this.bottomMargin * 2.54;
            break;
          case calcCase.inToMm:
            this.leftMargin = this.leftMargin * 25.4;
            this.rightMargin = this.rightMargin * 25.4;
            this.topMargin = this.topMargin * 25.4;
            this.bottomMargin = this.bottomMargin * 25.4;
            break;
        }
        await this.applyMargin();
        await this.saveData();
      }
      this.unitChangeCount++;
    },

    async viewOrhideMargin() {
      const margin = {
        viewMargin: this.viewMargins,
      };
      await localStorage.setItem(
        "viewCoverpageMargins",
        JSON.stringify(margin)
      );

      const marginData = JSON.parse(
        localStorage.getItem("viewCoverpageMargins")
      );
      if (marginData != null && marginData && marginData.viewMargin)
        this.viewMargins = marginData.viewMargin;
      this.$emit("showOrhideMargin", marginData);
    },

    async saveData() {
      if (localStorage.getItem("selectedCoverPageMode") == "Edit") {
        if (
          this.selectedExistingDocId == this.$route.params.docId &&
          this.$route.params.docId == this.existingSelectedItem.refId
        ) {
          const res = this.$refs.form.validate();
          const key = localStorage.getItem("getSelectedDocKey");
          const currentDocKey = this.getDocumentData.document._key;
          if (
            this.$route.params.docId == this.getDocumentData.document.refId &&
            res == true &&
            this.isDocReadOnly == false &&
            key == currentDocKey
          ) {
            await this.onInputFieldUpdate({
              name: "documentProperties",
              value: this.properties,
            });
          }
        }
      }
    },
    async checkcoverPageName(name) {
      const isCoverpageNamePresent = await this.isDocumentNameMatchesToExisting(
        name
      );
      if (isCoverpageNamePresent) {
        this.properties.name = this.tempCoverPageName;
      } else if (isCoverpageNamePresent == false) {
        this.tempCoverPageName = this.properties.name;
        this.updateData();
      }
    },
    async updateData() {
      await this.saveData();
      setTimeout(() => {
        this.fetchDocuments();
      }, 4000);
    },

    async getSelectedDocData(template) {
      const { projectId } = this.$route.params;
      await localStorage.setItem("getSelectedDocData", template.refId);
      await localStorage.setItem("getSelectedDocKey", template._key);
      await localStorage.setItem("dataFromCkeditor", template.properties.text);
      let path = `/project/cover-page/${projectId}/${template.refId}/design`;
      if (this.$route.query.searchResult)
        path = `/project/cover-page/${projectId}/${template.refId}/design?searchResult=${this.$route.query.searchResult}`;
      if (
        this.$route.path !== path &&
        this.$route.params.docId != template.refId
      )
        await this.$router.push(path).catch(() => {});

      this.selectedExistingDocId = template.refId;
      this.existingSelectedItem.refId = template.refId;
      this.existingSelectedItem.key = template._key;

      this.radioRefId = template.refId;
      if (this.selectedMode != "Clone to Create") {
        this.properties.name = template.properties.name;
      } else if (this.selectedMode == "Clone to Create") {
        let nameIndex = 0;
        if (this.getExistingItemInarray)
          this.getExistingItemInarray.map((a) => {
            if (
              (a.properties &&
                a.properties.name &&
                this.properties.name &&
                this.$route.params.docId != a.refId) ||
              this.selectedMode == "Clone to Create"
            )
              if (a.properties.name && this.properties.name)
                if (
                  a.properties.name.toLocaleLowerCase() ===
                  this.properties.name.toLocaleLowerCase()
                )
                  nameIndex = 1;
          });
        if (nameIndex > 0) {
          this.properties.name = "";
        }
      }
      await this.getEditorData();
    },

    async createCoverpageFromExisting() {
      const res = this.$refs.form.validate();
      if (this.selectedExistingDocId == "")
        this.setSnackbar({
          message: `Please select coverpage from below coverpage library to clone from existing.`,
          color: "error",
        });
      if (this.clonnedCoverpageName != "" && this.properties.use != "") {
        const docName = this.clonnedCoverpageName;
        const pageMarginData = {
          leftMargin: `${this.leftMargin}`,
          rightMargin: `${this.rightMargin}`,
          topMargin: `${this.topMargin}`,
          bottomMargin: `${this.bottomMargin}`,
        };
        let dataFromEditor = localStorage.getItem("dataFromCkeditor");
        if (!dataFromEditor || dataFromEditor == null) dataFromEditor = "";

        const otherFormData = {
          pageSize: this.properties.pageSize,
          selectedMode: this.properties.selectedMode,
          margin: this.properties.margin,
          margins: pageMarginData,
          height: this.properties.height ? this.properties.height : "297mm",
          width: this.properties.width ? this.properties.width : "210mm",
          unit: this.properties.unit ? this.properties.unit : this.unit,

          text: dataFromEditor,
        };

        if (res && this.selectedExistingDocId != "") {
          const body = {
            docName,
            selectedForDocType: this.properties.use,

            existingDocId: this.selectedExistingDocId,
            otherFormData: otherFormData,
          };
          const { projectId } = this.$route.params;
          const response = await request({
            url: `/document/add/clone-coverpage/coverpage/${projectId}/Cover Page`,
            body,
            method: "post",
          });
          if (response.errors.length != 0) {
            this.setSnackbar({
              message: `error while creating coverpage, ${response.errors[0].message}`,
              color: "error",
            });
          } else if (!response || response.data == undefined) {
            this.setSnackbar({
              message: `error while creating coverpage`,
              color: "error",
            });
          }

          if (response && response.data) {
            localStorage.setItem("templateType", "Cover Page");

            localStorage.setItem("selectedCoverPageMode", this.modeItems[2]);
            this.selectedMode = this.modeItems[2];

            this.setSnackbar({
              message: `CoverPage is created by name ${docName}`,
              color: "success",
            });
            this.fetchDocuments();
            await this.$router.push(
              `/project/cover-page/${projectId}/${response.data}/design`
            ).catch(() => {});
            this.radioGroup = response.data;
            this.selectedExistingDocId = response.data;
            this.existingSelectedItem.refId = response.data;
            localStorage.setItem("selectedCoverPageId", response.data);
            localStorage.setItem("existingTab", false);
            this.clonnedCoverpageName = "";
            await this.getEditorData();
            localStorage.setItem(
              "getSelectedDocKey",
              this.getDocumentData.document._key
            );

            this.existingSelectedItem.key = this.getDocumentData.document._key;
          }
        }
      }
    },

    async createCoverpage() {
      const res = this.$refs.form.validate();
      if (this.properties.name != "" && this.properties.use != "") {
        const docName = this.properties.name;

        const pageMarginData = {
          leftMargin: `${this.leftMargin}`,
          rightMargin: `${this.rightMargin}`,
          topMargin: `${this.topMargin}`,
          bottomMargin: `${this.bottomMargin}`,
        };
        let dataFromEditor = await localStorage.getItem("dataFromCkeditor");
        if (!dataFromEditor || dataFromEditor == null) dataFromEditor = "";
        const otherFormData = {
          pageSize: this.properties.pageSize,
          selectedMode: this.properties.selectedMode,
          margin: this.properties.margin ? this.properties.margin : this.margin,
          margins: pageMarginData,
          height: this.properties.height ? this.properties.height : "297mm",
          width: this.properties.width ? this.properties.width : "210mm",
          unit: this.properties.unit ? this.properties.unit : this.unit,
          text: dataFromEditor,
        };

        if (res) {
          const body = {
            docName,
            selectedForDocType: this.properties.use,

            otherFormData: otherFormData,
          };

          const { projectId } = this.$route.params;
          const response = await request({
            url: `/document/add/coverpage/${projectId}/Cover Page`,
            body,
            method: "post",
          });
          if (response.errors.length != 0) {
            this.setSnackbar({
              message: `error while creating coverpage ${response.errors[0].message}`,
              color: "error",
            });
          } else if (!response || response.data == undefined) {
            this.setSnackbar({
              message: `error while creating coverpage`,
              color: "error",
            });
          }
          if (response && response.data) {
            localStorage.setItem("templateType", "Cover Page");
            localStorage.setItem("selectedCoverPageMode", this.modeItems[2]);
            this.selectedMode = this.modeItems[2];

            this.setSnackbar({
              message: `CoverPage is created by name ${docName}`,
              color: "success",
            });
            this.fetchDocuments();
            await this.$router.push(
              `/project/cover-page/${projectId}/${response.data}/design`
            ).catch(() => {});
            this.radioGroup = response.data;

            localStorage.setItem("selectedCoverPageId", response.data);
            await this.getEditorData();
            this.selectedExistingDocId = response.data;
            this.existingSelectedItem.refId = response.data;

            localStorage.setItem("existingTab", false);
            localStorage.setItem(
              "getSelectedDocKey",
              this.getDocumentData.document._key
            );

            this.existingSelectedItem.key = this.getDocumentData.document._key;
          }
        }
      }
    },

    resetData() {
      localStorage.setItem("selectedCoverPageId", "");
    },

    async changeMode(selectedMode) {
      this.panel = [0];

      localStorage.setItem("selectedCoverPageMode", selectedMode);
      if (this.$refs.form) this.$refs.form.resetValidation();
      this.$emit("selectedCoverPageMode");
      this.filteredExistingItem = this.existingItems;
      this.selectedMode = selectedMode;

      this.onChangeSelectedMode(selectedMode);

      this.getEditorData();
    },
    async onChangeSelectedMode(selectedMode) {
      if (selectedMode == "New") {
        await this.resetData();
        await localStorage.setItem("dataFromCkeditor", "");

        const { projectId, docId } = this.$route.params;
        const path = `/project/cover-page/${projectId}/id/design`;
        if (this.$route.name != "Design" || docId != "id")
          if (this.$route.path !== path) {
            await this.$router.push(path).catch(() => {});
          }
        this.properties.name = "";
        this.properties.use = "";
        this.selectedExistingDocId = "";
        this.docTypeToFilter = "";
        if (this.$refs.form) this.$refs.form.resetValidation();

        this.getDefaultPageData();
      }

      if (selectedMode == "Edit") {
        await this.fetchDocument();
        if (this.$route.params.docId != "id")
          this.properties = this.documentProperties;
        else {
          this.properties.name = "";
          this.properties.use = "";
        }
      }
    },
    async getDefaultPageData() {
      this.pageDimensionData = {
        width: "210mm",
        height: "297mm",
      };
      this.unit = "mm";
      this.properties.unit = "mm";

      this.leftMargin = 12.7;
      this.rightMargin = 12.7;
      this.topMargin = 12.7;
      this.bottomMargin = 12.7;
      this.properties.margin = "Narrow";
      this.margin = "Narrow";
      this.properties.pageSize = "A4";
      this.properties.selectedMode = "portrait";
      this.properties.text = "";
      this.selectedPageSize = "A4";
      this.getDesignOrientation = {
        isPortrait: true,
        isLandScape: false,
      };
      this.emitSetPageMarginEvent();
      this.emitSetPageDimensionEvent(this.pageDimensionData);
      this.getPageSizeWithUnits();
    },

    containsObject(id, list) {
      var i;
      for (i = 0; i < list.length; i++) {
        if (list[i].refId === id) {
          return true;
        }
      }
      return false;
    },

    async filterExistingItem(use) {
      this.filteredExistingItem = [];
      this.existingItems.map((item) => {
        if (item.properties.use == use) {
          this.filteredExistingItem.push(item);
        }
      });

      const isSelectedDocPresent = await this.containsObject(
        this.selectedExistingDocId,
        this.filteredExistingItem
      );
      if (!isSelectedDocPresent) {
        const { projectId } = this.$route.params;
        let path = `/project/cover-page/${projectId}/id/design`;
        if (this.$route.query.searchResult)
          path = `${path}?searchResult=${this.$route.query.searchResult}`;

        if (this.$route.path !== path) {
          this.existingSelectedItem.refId = "";
          this.selectedExistingDocId = "";

          this.$router.push(path).catch(() => {});
          this.getEditorData();
        }
      }
    },
    SortArray(x, y) {
      if (x.properties && y.properties)
        if (x.properties.name && y.properties.name)
          return x.properties.name.localeCompare(y.properties.name, "fr", {
            ignorePunctuation: true,
          });
    },

    sortFunction(a, b) {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    },

    changeDocTypeUse(use) {
      this.properties.use = use;
      this.saveData();
    },

    async getEditorData() {
      const { docId } = this.$route.params;
      if (docId == "id") {
        this.getDefaultPageData();
      } else {
        if (docId != "id") await this.fetchDocument();
        this.margin = this.documentProperties.margin;
        if (this.selectedMode == "Edit") {
          this.properties = this.documentProperties;
          this.tempCoverPageName = this.documentProperties.name;
        } else if (
          this.selectedMode &&
          this.selectedMode == "Clone to Create" &&
          this.$route.params.docId != "id"
        ) {
          this.properties.name = "";
          let currentDocName = "";
          let currentDocType = "";
          if (this.clonnedCoverpageName && this.clonnedCoverpageName != "")
            currentDocName = this.clonnedCoverpageName;
          if (this.properties.use != "" && this.properties.use)
            currentDocType = this.properties.use;
          else if (this.documentProperties && this.documentProperties.use)
            currentDocType = this.documentProperties.use;
          this.properties = this.documentProperties;

          this.clonnedCoverpageName = currentDocName;
          this.properties.use = currentDocType;
        }
        if (this.documentProperties) {
          if (this.documentProperties.selectedMode == "portrait")
            this.getDesignOrientation = {
              isPortrait: true,
              isLandScape: false,
            };
          else if (this.documentProperties.selectedMode == "landScape")
            this.getDesignOrientation = {
              isPortrait: false,
              isLandScape: true,
            };
        }
        this.getPageDimension();
        this.selectedPageSize = this.documentProperties.pageSize;
        this.margin = this.properties.margin;

        const pageDimension = {
          height: this.properties.height,
          width: this.properties.width,
        };
        const margin = {
          viewMargin: this.viewMargins,
        };
        const marginData = JSON.parse(
          localStorage.getItem("viewCoverpageMargins")
        );
        if (marginData != null && marginData && marginData.viewMargin)
          this.viewMargins = marginData.viewMargin;

        if (this.properties.margin == "Custom") {
          this.leftMargin = this.properties.margins.leftMargin;
          this.rightMargin = this.properties.margins.rightMargin;
          this.topMargin = this.properties.margins.topMargin;
          this.bottomMargin = this.properties.margins.bottomMargin;
        }
        if (this.selectedMode == "New") this.getDefaultPageData();
        this.unit = this.properties.unit;
        this.getPageSizeWithUnits();
        this.calculateUnitBasedMargin();
        this.applyMargin();
        this.$emit("showOrhideMargin", margin);
        this.emitSetPageMarginEvent();
        this.emitSetPageDimensionEvent(pageDimension);
      }

      const getMargin = await JSON.parse(
        localStorage.getItem("viewCoverpageMargins")
      );
      this.$emit("showOrhideMargin", getMargin);
    },

    isDocumentNameMatchesToExisting(name) {
      let nameIndex = 0;
      if (this.existingItems) {
        this.existingItems.forEach((a) => {
          if (
            a.properties &&
            a.properties.name &&
            name &&
            this.$route.params.docId != a.refId
          )
            if (
              a.properties.name.toLocaleLowerCase() === name.toLocaleLowerCase()
            )
              nameIndex = 1;
        });
        if (nameIndex > 0) {
          return true;
        } else {
          return false;
        }
      }
    },
    setMarginMaxData() {
      this.maxBottomMargin = this.properties.height;
      this.maxTopMargin = this.properties.height;
      this.maxRightMargin = this.properties.width;
      this.maxLeftMargin = this.properties.width;
    },
    async setPageSizeAndUnit() {
      if (this.$route.params.docId == "id") this.unitChangeCount = 1;
      this.properties.pageSize = this.selectedPageSize;
      this.getPageSizeWithUnits();
      this.getPageDimension();
      this.setMarginOrUnit();
    },

    getPageSizeWithUnits() {
      if (this.selectedPageSize == "A4") {
        if (this.unit == "mm")
          this.pageSizeWithUnit = "A4 Standard 210mm x 297mm";
        else if (this.unit == "in")
          this.pageSizeWithUnit = "A4 Standard 8.27in x 11.69in";
        else if (this.unit == "cm")
          this.pageSizeWithUnit = "A4 Standard 21cm x 29.7cm";
      } else if (this.selectedPageSize == "A5") {
        if (this.unit == "mm") this.pageSizeWithUnit = "A5 148mm x 210mm";
        else if (this.unit == "in") this.pageSizeWithUnit = "A5 5.8in x 8.3in";
        else if (this.unit == "cm") this.pageSizeWithUnit = "A5 14.8cm x 21cm";
      }
    },

    getLocale() {},
    calculateUnitBasedMargin() {
      if (this.margin == "Narrow") {
        if (this.unit == "in") {
          this.leftMargin = 0.5;
          this.rightMargin = 0.5;
          this.topMargin = 0.5;
          this.bottomMargin = 0.5;
        } else if (this.unit == "cm") {
          this.leftMargin = 0.5 * 2.54;
          this.rightMargin = 0.5 * 2.54;
          this.topMargin = 0.5 * 2.54;
          this.bottomMargin = 0.5 * 2.54;
        } else if (this.unit == "mm") {
          this.leftMargin = 0.5 * 25.4;
          this.rightMargin = 0.5 * 25.4;
          this.topMargin = 0.5 * 25.4;
          this.bottomMargin = 0.5 * 25.4;
        }
      } else if (this.margin == "Normal") {
        if (this.unit == "in") {
          this.leftMargin = 1;
          this.rightMargin = 1;
          this.topMargin = 1;
          this.bottomMargin = 1;
        } else if (this.unit == "cm") {
          this.leftMargin = 1 * 2.54;
          this.rightMargin = 1 * 2.54;
          this.topMargin = 1 * 2.54;
          this.bottomMargin = 1 * 2.54;
        } else if (this.unit == "mm") {
          this.leftMargin = 1 * 25.4;
          this.rightMargin = 1 * 25.4;
          this.topMargin = 1 * 25.4;
          this.bottomMargin = 1 * 25.4;
        }
      } else if (this.margin == "Moderate") {
        if (this.unit == "in") {
          this.leftMargin = 0.75;
          this.rightMargin = 0.75;
          this.topMargin = 1;
          this.bottomMargin = 1;
        } else if (this.unit == "cm") {
          this.leftMargin = 0.75 * 2.54;
          this.rightMargin = 0.75 * 2.54;
          this.topMargin = 1 * 2.54;
          this.bottomMargin = 1 * 2.54;
        } else if (this.unit == "mm") {
          this.leftMargin = 0.75 * 25.4;
          this.rightMargin = 0.75 * 25.4;
          this.topMargin = 1 * 25.4;
          this.bottomMargin = 1 * 25.4;
        }
      } else if (this.margin == "Wide") {
        if (this.unit == "in") {
          this.leftMargin = 2;
          this.rightMargin = 2;
          this.topMargin = 1;
          this.bottomMargin = 1;
        } else if (this.unit == "cm") {
          this.leftMargin = 2 * 2.54;
          this.rightMargin = 2 * 2.54;
          this.topMargin = 1 * 2.54;
          this.bottomMargin = 1 * 2.54;
        } else if (this.unit == "mm") {
          this.leftMargin = 2 * 25.4;
          this.rightMargin = 2 * 25.4;
          this.topMargin = 1 * 25.4;
          this.bottomMargin = 1 * 25.4;
        }
      }
    },
    async setMarginOrUnit() {
      this.unitChangeCount = 1;
      await this.calculateUnitBasedMargin();

      await this.applyMargin();
      await this.saveData();
    },

    async customMargin() {
      this.margin = "Custom";
      await this.applyMargin();
      this.saveData();
    },

    async applyMargin() {
      this.properties.unit = this.unit;
      this.properties.margin = this.margin;

      this.emitSetPageMarginEvent();
    },

    async emitSetPageMarginEvent() {
      const pageMarginData = {
        leftMargin: `${this.leftMargin}`,
        rightMargin: `${this.rightMargin}`,
        topMargin: `${this.topMargin}`,
        bottomMargin: `${this.bottomMargin}`,
        unit: this.unit,
      };
      this.properties.margins = pageMarginData;
      await this.$emit("setPageMargin", pageMarginData);
    },
    async getPageDimension() {
      if (
        this.properties.selectedMode == "landScape" &&
        this.properties.pageSize == "A4"
      )
        this.pageDimensionData = {
          width: "297mm",
          height: "210mm",
        };
      else if (
        this.properties.selectedMode == "portrait" &&
        this.properties.pageSize == "A4"
      )
        this.pageDimensionData = {
          width: "210mm",
          height: "297mm",
        };
      else if (
        this.properties.selectedMode == "portrait" &&
        this.properties.pageSize == "A5"
      )
        this.pageDimensionData = {
          width: "148mm",
          height: "210mm",
        };
      else if (
        this.properties.selectedMode == "landScape" &&
        this.properties.pageSize == "A5"
      )
        this.pageDimensionData = {
          width: "210mm",
          height: "148mm",
        };
      this.emitSetPageDimensionEvent(this.pageDimensionData);
    },

    async emitSetPageDimensionEvent(data) {
      this.properties.height = data.height;
      this.properties.width = data.width;
      await this.$emit("setPageDiamension", this.pageDimensionData);
    },

    async landScapeMode() {
      this.getDesignOrientation.isLandScape = true;
      this.getDesignOrientation.isPortrait = false;
      this.properties.selectedMode = "landScape";
      await this.getPageDimension();
      this.saveData();
    },
    async portraitMode() {
      this.properties.selectedMode = "portrait";
      this.getDesignOrientation.isLandScape = false;
      this.getDesignOrientation.isPortrait = true;

      await this.getPageDimension();
      this.saveData();
    },

    async fetchDocuments() {
      const selectedProjectId = this.$route.params.projectId;
      if (selectedProjectId) {
        const response = await request({
          url: `/document/fetch/all/${selectedProjectId}/Cover Page`,
          method: "get",
        });
        if (response && response.data) {
          this.existingItems = response.data;
          this.filteredExistingItem = response.data;

          if (
            this.filteredExistingItem &&
            this.filteredExistingItem.length != 0
          )
            this.filteredExistingItem = await this.filteredExistingItem.sort(
              this.SortArray
            );
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors.scss";
.button {
  background-color: $blue !important;
}

@import "../../assets/scss/colors.scss";
.font-title-color {
  color: grey;
}
.scroll {
  overflow-y: auto;
}
.active-icon {
  border: 2px solid #00bcd4;
  border-style: groove;
}
</style>
