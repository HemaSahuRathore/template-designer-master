export const newRequirementData = creatorName => ({
  tag: "",
  text: "",
  requirementForm: {
    testMethod: [],
    testGuidance: "",
    acceptanceCriteria: '',
    mathEquation: '',
    attributes: [
      {
        "Author": creatorName,
        "Date": new Date().toISOString().slice(0, 10).split('-').reverse().join('/'),
        "Tag": "",
        "Priority": "",
        "Stability": "",
        "Version": "",
        "Stakeholders": "",
        "Program": "",
        "Additional Info": "",
        "Applicability": ""
      }
    ],
   
    parentTraceability: [
     
    ],
    testTraceability: [
      { origin: "earth", tag: "lov", description: "from earth" },
      { origin: "leap", tag: "aeronatics", description: "Binu kumar" },
      { origin: "don't know", tag: "NA", description: "i don't know this" },
      { origin: "lorem", tag: "ipsume", description: "ok rnandom text" }
    ],

  },
  discussions: [
    { discussion: "tabulator-tablees" },
    { discussion: "use JEXcel" },
    { discussion: "vuetify-table" },
    { discussion: "no tables" }
  ]
});
