import { BadRequestError } from '../errors/badRequestError';
import dbCollectionsCodes from '../../config/dbCollectionsCodes.json';
let testType: any = ""
let subDocType: any = ""
export const setTestTypeOfDoc = (type: any, subDocumentType: any) => {
    testType = ""
    subDocType = ""
    testType = type
    subDocType = subDocumentType
}
export const getCollectionMetaForDoc = (docType: any) => {
    var collectionName;
    var projectCollection = dbCollectionsCodes.Project.collectionName;
    var journalCollection = dbCollectionsCodes.DocJournal.collectionName;
    var docListSectionName = '';
    let docCode: any = '';
    let docContainerCode: any = ''
    let journalCode: any = ''
    switch (docType) {

        case dbCollectionsCodes.Project.docType:
            collectionName = dbCollectionsCodes.Project.collectionName;
            docListSectionName = dbCollectionsCodes.Project.docType + 's';
            docContainerCode = dbCollectionsCodes.Project.docContainerCode;
            docCode = dbCollectionsCodes.Project.docCode;
            journalCode = dbCollectionsCodes.Project.journalCode;
            break;
        case dbCollectionsCodes.Template.DocTemplate.docType:
            collectionName = dbCollectionsCodes.Template.collectionName;
            docListSectionName = 'DocTemplates';
            docContainerCode = dbCollectionsCodes.Template.DocTemplate.docContainerCode;
            docCode = dbCollectionsCodes.Template.DocTemplate.docCode;
            journalCode = dbCollectionsCodes.Template.journalCode;
            break;

        case dbCollectionsCodes.Team.docType:
            collectionName = dbCollectionsCodes.Team.collectionName;
            docListSectionName = dbCollectionsCodes.Team.docType + 's';
            docContainerCode = dbCollectionsCodes.Team.docContainerCode;
            docCode = dbCollectionsCodes.Team.docCode;
            break;

        case dbCollectionsCodes.User.docType:
            collectionName = dbCollectionsCodes.User.collectionName;
            docListSectionName = dbCollectionsCodes.User.docType + 's';
            docContainerCode = dbCollectionsCodes.User.docContainerCode;
            docCode = dbCollectionsCodes.User.docCode;

            break;

        case dbCollectionsCodes.Template.CoverPage.docType:
            collectionName = dbCollectionsCodes.Template.collectionName;
            docListSectionName = 'CoverPages';
            docContainerCode = dbCollectionsCodes.Template.CoverPage.docContainerCode;
            docCode = dbCollectionsCodes.Template.CoverPage.docCode;
            journalCode = dbCollectionsCodes.Template.journalCode;
            break;

        case dbCollectionsCodes.Document.Report.docType:
            collectionName = dbCollectionsCodes.Document.collectionName;
            docListSectionName = 'Reports';
            docContainerCode = dbCollectionsCodes.Document.Report.docContainerCode;
            docCode = dbCollectionsCodes.Document.Report.docCode;
            journalCode = dbCollectionsCodes.Document.journalCode;
            break;

        case dbCollectionsCodes.Document.Plan.docType:
            collectionName = dbCollectionsCodes.Document.collectionName;
            docListSectionName = 'Plans';
            docContainerCode = dbCollectionsCodes.Document.Plan.docContainerCode;
            docCode = dbCollectionsCodes.Document.Plan.docCode;
            journalCode = dbCollectionsCodes.Document.journalCode;
            break;

        case dbCollectionsCodes.Document.Process.docType:
            collectionName = dbCollectionsCodes.Document.collectionName;
            docListSectionName = 'Processes';
            docContainerCode = dbCollectionsCodes.Document.Process.docContainerCode;
            docCode = dbCollectionsCodes.Document.Process.docCode;
            journalCode = dbCollectionsCodes.Document.journalCode;
            break;

        case dbCollectionsCodes.Document.General.docType:
            collectionName = dbCollectionsCodes.Document.collectionName;
            docListSectionName = 'General';
            docContainerCode = dbCollectionsCodes.Document.General.docContainerCode;
            docCode = dbCollectionsCodes.Document.General.docCode;
            journalCode = dbCollectionsCodes.Document.journalCode;
            break;

        case dbCollectionsCodes.Workflow.docType:
            docListSectionName = collectionName = dbCollectionsCodes.Workflow.collectionName;
            docContainerCode = dbCollectionsCodes.Workflow.docContainerCode;
            docCode = dbCollectionsCodes.Workflow.docCode;
            journalCode = dbCollectionsCodes.Workflow.journalCode;
            break;

        case dbCollectionsCodes.Risk.docType:
            docListSectionName = collectionName = dbCollectionsCodes.Risk.collectionName;
            docContainerCode = dbCollectionsCodes.Risk.docContainerCode;
            docCode = dbCollectionsCodes.Risk.docCode;
            journalCode = dbCollectionsCodes.Risk.journalCode;
            break;

        case dbCollectionsCodes.Wiki.Learnings.docType:
            collectionName = dbCollectionsCodes.Wiki.Learnings.collectionName;
            docListSectionName = "Articles";
            docContainerCode = dbCollectionsCodes.Wiki.Learnings.docContainerCode;
            docCode = dbCollectionsCodes.Wiki.Learnings.docCode;
            journalCode = dbCollectionsCodes.Wiki.Learnings.journalCode;
            break;

        case dbCollectionsCodes.Glossary.docType:
            collectionName = dbCollectionsCodes.Glossary.collectionName;
            docContainerCode = dbCollectionsCodes.Glossary.docContainerCode;
            docCode = dbCollectionsCodes.Glossary.docCode;
            journalCode = dbCollectionsCodes.Glossary.journalCode;
            break;

        case dbCollectionsCodes.Announcements.docType:
            docListSectionName = collectionName = dbCollectionsCodes.Announcements.collectionName;
            docContainerCode = dbCollectionsCodes.Announcements.docContainerCode;
            docCode = dbCollectionsCodes.Announcements.docCode;
            journalCode = dbCollectionsCodes.Announcements.journalCode;
            break;

        case dbCollectionsCodes.Study.Conops.docType:
            collectionName = dbCollectionsCodes.Study.collectionName;
            docListSectionName = dbCollectionsCodes.Study.Conops.docType;
            docContainerCode = dbCollectionsCodes.Study.Conops.docContainerCode;
            docCode = dbCollectionsCodes.Study.Conops.docCode;
            journalCode = dbCollectionsCodes.Study.journalCode;
            break;

        case dbCollectionsCodes.Comment.docType:
            collectionName = dbCollectionsCodes.Comment.collectionName;
            docListSectionName = dbCollectionsCodes.Comment.docType + 's';
            docContainerCode = dbCollectionsCodes.Comment.docContainerCode;
            docCode = dbCollectionsCodes.Comment.docCode;
            journalCode = dbCollectionsCodes.Comment.journalCode;
            break;
        case dbCollectionsCodes.Study.UseCase.docType:
            collectionName = dbCollectionsCodes.Study.collectionName;
            docListSectionName = dbCollectionsCodes.Study.UseCase.docType;
            docContainerCode = dbCollectionsCodes.Study.UseCase.docContainerCode;
            docCode = dbCollectionsCodes.Study.UseCase.docCode;
            journalCode = dbCollectionsCodes.Study.journalCode;
            break;

        case dbCollectionsCodes.Risk.docType:
            docListSectionName = collectionName = dbCollectionsCodes.Risk.collectionName;
            docContainerCode = dbCollectionsCodes.Risk.docContainerCode;
            docCode = dbCollectionsCodes.Risk.docCode;
            journalCode = dbCollectionsCodes.Risk.journalCode;
            break;

        case dbCollectionsCodes.Review.docType:
            collectionName = dbCollectionsCodes.Review.collectionName;
            docListSectionName = dbCollectionsCodes.Review.docType + 's';
            docContainerCode = dbCollectionsCodes.Review.docContainerCode;
            docCode = dbCollectionsCodes.Review.docCode;
            journalCode = dbCollectionsCodes.Review.journalCode;
            break;

        case dbCollectionsCodes.Checklist.docType:
            collectionName = dbCollectionsCodes.Checklist.collectionName;
            docListSectionName = dbCollectionsCodes.Checklist.docType + 's';
            docContainerCode = dbCollectionsCodes.Checklist.docContainerCode;
            docCode = dbCollectionsCodes.Checklist.docCode;
            journalCode = dbCollectionsCodes.Checklist.journalCode;
            break;

        case dbCollectionsCodes.Requirement.docType:
            collectionName = dbCollectionsCodes.Requirement.collectionName;
            docListSectionName = dbCollectionsCodes.Requirement.docType + 's';
            docContainerCode = dbCollectionsCodes.Requirement.docContainerCode;
            docCode = dbCollectionsCodes.Requirement.docCode;
            journalCode = dbCollectionsCodes.Requirement.journalCode;
            break;

        case dbCollectionsCodes.Workflow.docType:
            docListSectionName = collectionName = dbCollectionsCodes.Workflow.collectionName;
            docContainerCode = dbCollectionsCodes.Workflow.docContainerCode;
            docCode = dbCollectionsCodes.Workflow.docCode;
            journalCode = dbCollectionsCodes.Workflow.journalCode;
            break;

        case dbCollectionsCodes.Wiki.Learnings.docType:
            collectionName = dbCollectionsCodes.Wiki.Learnings.collectionName;
            docListSectionName = "Articles";
            docContainerCode = dbCollectionsCodes.Wiki.Learnings.docContainerCode;
            docCode = dbCollectionsCodes.Wiki.Learnings.docCode;
            journalCode = dbCollectionsCodes.Wiki.Learnings.journalCode;
            break;

        case dbCollectionsCodes.Glossary.docType:
            collectionName = dbCollectionsCodes.Glossary.collectionName;
            docContainerCode = dbCollectionsCodes.Glossary.docContainerCode;
            docCode = dbCollectionsCodes.Glossary.docCode;
            journalCode = dbCollectionsCodes.Glossary.journalCode;
            break;

        case dbCollectionsCodes.Announcements.docType:
            docListSectionName = collectionName = dbCollectionsCodes.Announcements.collectionName;
            docContainerCode = dbCollectionsCodes.Announcements.docContainerCode;
            docCode = dbCollectionsCodes.Announcements.docCode;
            journalCode = dbCollectionsCodes.Announcements.journalCode;
            break
        case dbCollectionsCodes.Discussion.docType:
            docListSectionName = collectionName = dbCollectionsCodes.Discussion.collectionName;
            docContainerCode = dbCollectionsCodes.Discussion.docContainerCode;
            docCode = dbCollectionsCodes.Discussion.docCode;
            journalCode = dbCollectionsCodes.Discussion.journalCode;
            break;
        case dbCollectionsCodes.Plan.WBS.docType:
            collectionName = dbCollectionsCodes.Plan.collectionName;
            docListSectionName = dbCollectionsCodes.Plan.WBS.docType;
            docContainerCode = dbCollectionsCodes.Plan.WBS.docContainerCode;
            docCode = dbCollectionsCodes.Plan.WBS.docCode;
            journalCode = dbCollectionsCodes.Plan.journalCode;
            break;
        case dbCollectionsCodes.Product.docType:
            collectionName = dbCollectionsCodes.Product.collectionName;
            docContainerCode = dbCollectionsCodes.Product.docContainerCode;
            docCode = dbCollectionsCodes.Product.docCode;
            break;
        case dbCollectionsCodes.Test.collectionName.substring(0, dbCollectionsCodes.Test.collectionName.length - 1):
            collectionName = dbCollectionsCodes.Test.collectionName;
            journalCode = dbCollectionsCodes.Test.journalCode;

            switch (testType) {
                case dbCollectionsCodes.Test.Integration.testType:
                    switch (subDocType) {

                        case dbCollectionsCodes.Test.Integration.codes.Test.docType:
                            docContainerCode = dbCollectionsCodes.Test.Integration.codes.Test.docContainerCode;
                            docCode = dbCollectionsCodes.Test.Integration.codes.Test.docCode;
                            docListSectionName = dbCollectionsCodes.Test.Integration.codes.Test.docType + 's';
                            break;
                        case dbCollectionsCodes.Test.Integration.codes.Status.docType:
                            docContainerCode = dbCollectionsCodes.Test.Integration.codes.Status.docContainerCode;
                            docCode = dbCollectionsCodes.Test.Integration.codes.Status.docCode;
                            docListSectionName = dbCollectionsCodes.Test.Integration.codes.Status.docType + 'es';

                            break;
                        case dbCollectionsCodes.Test.Integration.codes.Report.docType:
                            docContainerCode = dbCollectionsCodes.Test.Integration.codes.Report.docContainerCode;
                            docCode = dbCollectionsCodes.Test.Integration.codes.Report.docCode;
                            docListSectionName = dbCollectionsCodes.Test.Integration.codes.Report.docType + 's';

                            break;
                    }
                    break;
                case dbCollectionsCodes.Test.Validation.testType:
                    switch (subDocType) {
                        case dbCollectionsCodes.Test.Validation.codes.Test.docType:
                            docContainerCode = dbCollectionsCodes.Test.Validation.codes.Test.docContainerCode;
                            docCode = dbCollectionsCodes.Test.Validation.codes.Test.docCode;
                            docListSectionName = dbCollectionsCodes.Test.Validation.codes.Test.docType + 's';
                            break;
                        case dbCollectionsCodes.Test.Validation.codes.Status.docType:
                            docContainerCode = dbCollectionsCodes.Test.Validation.codes.Status.docContainerCode;
                            docCode = dbCollectionsCodes.Test.Validation.codes.Status.docCode;
                            docListSectionName = dbCollectionsCodes.Test.Validation.codes.Status.docType + 'es';

                            break;
                        case dbCollectionsCodes.Test.Validation.codes.Report.docType:
                            docContainerCode = dbCollectionsCodes.Test.Validation.codes.Report.docContainerCode;
                            docCode = dbCollectionsCodes.Test.Validation.codes.Report.docCode;
                            docListSectionName = dbCollectionsCodes.Test.Validation.codes.Report.docType + 's';
                            break;
                    }
                    break;
                case dbCollectionsCodes.Test.Acceptance.testType:
                    switch (subDocType) {
                        case dbCollectionsCodes.Test.Acceptance.codes.Test.docType:
                            docContainerCode = dbCollectionsCodes.Test.Acceptance.codes.Test.docContainerCode;
                            docCode = dbCollectionsCodes.Test.Acceptance.codes.Test.docCode;
                            docListSectionName = dbCollectionsCodes.Test.Acceptance.codes.Test.docType + 's';
                            break;
                        case dbCollectionsCodes.Test.Acceptance.codes.Status.docType:
                            docContainerCode = dbCollectionsCodes.Test.Acceptance.codes.Status.docContainerCode;
                            docCode = dbCollectionsCodes.Test.Acceptance.codes.Status.docCode;
                            docListSectionName = dbCollectionsCodes.Test.Acceptance.codes.Status.docType + 'es';

                            break;
                        case dbCollectionsCodes.Test.Acceptance.codes.Report.docType:
                            docContainerCode = dbCollectionsCodes.Test.Acceptance.codes.Report.docContainerCode;
                            docCode = dbCollectionsCodes.Test.Acceptance.codes.Report.docCode;
                            docListSectionName = dbCollectionsCodes.Test.Acceptance.codes.Report.docType + 's';
                            break;
                    }
                    break;
            }
            break;

        case dbCollectionsCodes.Design.docType:
            collectionName = dbCollectionsCodes.Design.collectionName;
            docListSectionName = dbCollectionsCodes.Design.docType + 's';
            docContainerCode = dbCollectionsCodes.Design.docContainerCode;
            docCode = dbCollectionsCodes.Design.docCode;
            journalCode = dbCollectionsCodes.Design.journalCode;
            break;
        case dbCollectionsCodes.EFFBD.docType:
            collectionName = dbCollectionsCodes.EFFBD.collectionName;
            docListSectionName = dbCollectionsCodes.EFFBD.docType + 's';
            docContainerCode = dbCollectionsCodes.EFFBD.docContainerCode;
            docCode = dbCollectionsCodes.EFFBD.docCode;
            journalCode = dbCollectionsCodes.EFFBD.journalCode;
            break;
        case dbCollectionsCodes.History.docType:
            collectionName = dbCollectionsCodes.History.collectionName;
            docListSectionName = dbCollectionsCodes.History.docType + 'ies';
            docContainerCode = dbCollectionsCodes.History.docContainerCode;
            docCode = dbCollectionsCodes.History.docCode;
            journalCode = dbCollectionsCodes.History.journalCode;
            break;
        case dbCollectionsCodes.UML.docType:
            collectionName = dbCollectionsCodes.UML.collectionName;
            docListSectionName = dbCollectionsCodes.UML.docType + 's';
            docContainerCode = dbCollectionsCodes.UML.docContainerCode;
            docCode = dbCollectionsCodes.UML.docCode;
            journalCode = dbCollectionsCodes.UML.journalCode;
            break;
        case dbCollectionsCodes.SysML.docType:
            collectionName = dbCollectionsCodes.SysML.collectionName;
            docListSectionName = dbCollectionsCodes.SysML.docType + 's';
            docContainerCode = dbCollectionsCodes.SysML.docContainerCode;
            docCode = dbCollectionsCodes.SysML.docCode;
            journalCode = dbCollectionsCodes.SysML.journalCode;
            break;
        case dbCollectionsCodes.N2Chart.docType:
            collectionName = dbCollectionsCodes.N2Chart.collectionName;
            docListSectionName = dbCollectionsCodes.N2Chart.docType + 's';
            docContainerCode = dbCollectionsCodes.N2Chart.docContainerCode;
            docCode = dbCollectionsCodes.N2Chart.docCode;
            journalCode = dbCollectionsCodes.N2Chart.journalCode;
            break;
        case dbCollectionsCodes.FTA.docType:
            collectionName = dbCollectionsCodes.FTA.collectionName;
            docListSectionName = dbCollectionsCodes.FTA.docType + 's';
            docContainerCode = dbCollectionsCodes.FTA.docContainerCode;
            docCode = dbCollectionsCodes.FTA.docCode;
            journalCode = dbCollectionsCodes.FTA.journalCode;
            break;

        case dbCollectionsCodes.UI.docType:
            collectionName = dbCollectionsCodes.UI.collectionName;
            docListSectionName = dbCollectionsCodes.UI.docType + 's';
            docContainerCode = dbCollectionsCodes.UI.docContainerCode;
            docCode = dbCollectionsCodes.UI.docCode;
            journalCode = dbCollectionsCodes.UI.journalCode;
            break;
        case dbCollectionsCodes.JourneyMap.docType:
            collectionName = dbCollectionsCodes.JourneyMap.collectionName;
            docListSectionName = dbCollectionsCodes.JourneyMap.docType + 's';
            docContainerCode = dbCollectionsCodes.JourneyMap.docContainerCode;
            docCode = dbCollectionsCodes.JourneyMap.docCode;
            journalCode = dbCollectionsCodes.JourneyMap.journalCode;
            break;
        case dbCollectionsCodes.Manual.docType:
            collectionName = dbCollectionsCodes.Manual.collectionName;
            docListSectionName = dbCollectionsCodes.Manual.docType + 's';
            docContainerCode = dbCollectionsCodes.Manual.docContainerCode;
            docCode = dbCollectionsCodes.Manual.docCode;
            journalCode = dbCollectionsCodes.Manual.journalCode;
            break;
        case dbCollectionsCodes.Role.docType:
            collectionName = dbCollectionsCodes.Role.collectionName;
            docListSectionName = dbCollectionsCodes.Role.docType + 'es';
            docContainerCode = dbCollectionsCodes.Role.docContainerCode;
            docCode = dbCollectionsCodes.Role.docCode;
            break;
        default:
            throw new BadRequestError('Invalid Document Type');
    }

    return {
        collectionName,
        docContainerCode,
        docCode,
        docListSectionName,
        projectCollection,
        journalCode,
        journalCollection,
    };
};
