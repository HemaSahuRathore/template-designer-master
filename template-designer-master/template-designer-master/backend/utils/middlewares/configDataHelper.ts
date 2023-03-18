
import dbCollectionsCodes from '../../config/dbCollectionsCodes.json';

export const getApplicationsDocTypes = async () => {

    let docTypes: any = [
        dbCollectionsCodes.Study.Conops.docType,
        dbCollectionsCodes.Study.UseCase.docType,
        dbCollectionsCodes.Template.CoverPage.docType,
        dbCollectionsCodes.Template.DocTemplate.docType,
        dbCollectionsCodes.Requirement.docType,
        dbCollectionsCodes.Test.Integration.codes.Test.docType,
        dbCollectionsCodes.Test.Validation.codes.Test.docType,
        dbCollectionsCodes.Test.Acceptance.codes.Test.docType,
        dbCollectionsCodes.Project.docType,
        dbCollectionsCodes.Checklist.docType,
        dbCollectionsCodes.Review.docType,
        dbCollectionsCodes.Document.Report.docType,
        dbCollectionsCodes.Document.Plan.docType,
        dbCollectionsCodes.Document.Process.docType,
        dbCollectionsCodes.Risk.docType,
        dbCollectionsCodes.Team.docType,
        dbCollectionsCodes.User.docType,
        dbCollectionsCodes.Workflow.docType,
        dbCollectionsCodes.Design.docType,
        dbCollectionsCodes.EFFBD.docType,
        dbCollectionsCodes.Discussion.docType,
        dbCollectionsCodes.History.docType,
        dbCollectionsCodes.UML.docType,
        dbCollectionsCodes.SysML.docType,
        dbCollectionsCodes.N2Chart.docType,
        dbCollectionsCodes.FTA.docType,
        dbCollectionsCodes.UI.docType,
        dbCollectionsCodes.JourneyMap.docType,
        dbCollectionsCodes.Manual.docType,
        dbCollectionsCodes.Comment.docType,
        dbCollectionsCodes.Document.General.docType,
        dbCollectionsCodes.Role.docType,
    ]
    let testArtifactsData = [
        "Integration Test",
        "Validation Test",
        "Acceptance Test",
        "Verification Test",
        "Integration Test Report",
        "Validation Test Report",
        "Acceptance Test Report",
        "Verification Test Report",
    ]

    docTypes = docTypes.filter(function (item: any) {
        return item !== "Test";
    });
    docTypes = [...docTypes.sort(), ...testArtifactsData]
    return docTypes
}
