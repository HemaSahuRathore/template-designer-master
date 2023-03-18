import { Request, Response } from 'express';
import { DocumentModel } from '../../models/Document/documentModel';
import { DocJournalModel } from '../../models/Journal/docJournalModel';
import { db } from '../../utils/misc/db';
import { BadRequestError } from '../../utils/errors/badRequestError';
import { idGenerator } from '../../utils/misc/idGenerator';
import { getCollectionMetaForDoc, setTestTypeOfDoc } from '../../utils/misc/docUtils';
import license from "../../../config/licensee.json";
import { createErrorLog } from '../../utils/errors/errorLog'
let fileName: any = 'errors'
export const documentAddController = async (req: Request, res: Response) => {
    const { projectId, docType, testType, subDocType } = req.params;
    const { name, _key, email } = req.currentUser;

    fileName = docType.replace(/\s/g, "") + "Errors"
    const { docName } = req.body;
    await setTestTypeOfDoc(testType, subDocType)

    const {
        collectionName,
        docContainerCode,
        journalCode,
        projectCollection,
        journalCollection,
        docListSectionName,
    } = getCollectionMetaForDoc(docType);
    var projBindVars = {
        '@collection': projectCollection,
        projectId: projectId,
    };
    var query = `for value in @@collection FILTER value.refId == @projectId return value`;
    const projectObj = await db.query(query, projectCollection, projBindVars);
    if (projectObj && projectObj.length === 0) {
        let errorMsg = 'Invalid Project Request'
        await createErrorLog(fileName, `BE: ${errorMsg}`)
        throw new BadRequestError('Invalid Project Request');
    }
    const project: any = projectObj[0];
    var journalDoc = [];
    var journalDocBindVars = {
        '@collection': journalCollection,
        projectRef: project.refId,
        journalName: collectionName,
    };
    query = `for doc in @@collection FILTER doc.projectRef == @projectRef AND doc.journalName == @journalName return doc`;
    journalDoc = await db.query(query, journalCollection, journalDocBindVars);
    if (journalDoc && journalDoc.length === 0) {
        const { _key, refId } = idGenerator(journalCode);
        const newJounalDoc: DocJournalModel = {
            _key: _key,
            refId: refId,
            projectRef: projectId,
            journalName: collectionName,
            [docListSectionName]: [],
        };
        await db.insert(newJounalDoc, journalCollection);
        var journalDocBindVarss = {
            '@collection': journalCollection,
            docId: newJounalDoc.refId,
        };
        query = 'for doc in @@collection FILTER doc.refId == @docId return doc';
        journalDoc = await db.query(query, journalCollection, journalDocBindVarss);
        var journal = 'journal';
        project[journal][collectionName] = refId;
    } else if (journalDoc.length > 0) {
        if (!journalDoc[0][docListSectionName]) {
            journalDoc[0][docListSectionName] = [];
        }
        journalDoc[0][docListSectionName].forEach((element: any) => {
            if (element.docName === docName) {
                let errorMsg = 'This document name has already been taken'
                createErrorLog(fileName, `BE: ${errorMsg}`)
                throw new BadRequestError('This document name has already been taken');
            }
        });
    }
    const { _key: docId, refId } = idGenerator(docContainerCode);
    const newDocument: any = {
        dataFiles: [],
        _key: docId,
        id: docId,
        refId,
        projectRef: projectId,
        tree: '',
        properties: {
            name: docName,
            company: license.companyName,
            createdAt: new Date(),
            creator: name,
            description: '',
            editors: [_key],
            keywords: [],
            modifiedAt: new Date(),
            subject: '',
            tags: [],
            templateName: '',
            docType: docType,
            authorsList: [
                {
                    name: name,
                    _key: _key,
                    email: email
                }
            ],
        },
        use: '',
        version: 0,
        hasChanged: true,
        isVersioned: false,
    };
    const newSectionObject: any = {
        _key: newDocument._key,
        projectRef: project.refId,
        docName: docName,
        docType: docType,
        author: name,
        lastEdit: new Date(),
    };
    if (testType != "") {
        newSectionObject.testType = testType
    }
    journalDoc[0][docListSectionName].push(newSectionObject);
    await db.insert(newDocument, collectionName);
    await db.upsert(project._key, project, projectCollection);
    await db.upsert(journalDoc[0]._key, journalDoc[0], journalCollection);
    return res.send(newDocument.refId);
};

export const documentFetchAllController = async (req: Request, res: Response) => {
    const { projectId, docType } = req.params;
    fileName = docType.replace(/\s/g, "") + "Errors"
    const { collectionName, projectCollection, journalCollection, docListSectionName } = getCollectionMetaForDoc(
        docType
    );
    var projBindVars = {
        '@collection': projectCollection,
        projectId: projectId,
    };
    var query = `for value in @@collection FILTER value.refId == @projectId return value`;
    const projectObj = await db.query(query, projectCollection, projBindVars);
    if (projectObj && projectObj.length === 0) {
        let errorMsg = 'Invalid Project Request'
        createErrorLog(fileName, `BE: ${errorMsg}`)
        throw new BadRequestError('Invalid Project Request');
    }
    if (projectObj[0].journal[collectionName]) {
        var journalDocBindVars = {
            '@collection': journalCollection,
            docId: projectObj[0].journal[collectionName],
        };
        const journalDoc = await db.query(
            'for doc in @@collection FILTER doc.refId == @docId return doc',
            journalCollection,
            journalDocBindVars
        );
        if ((journalDoc && journalDoc.length === 0) || !journalDoc[0][docListSectionName]) {
            return res.send([]);
        }
        var docKeys: any[] = [];
        await journalDoc[0][docListSectionName].forEach((element: any) => {
            docKeys.push(element._key);
        });
        var docBindVars = {
            '@collection': collectionName,
            documents: docKeys,
        };
        const documents = await db.query(
            'for doc in @@collection FILTER doc._key in @documents return doc',
            collectionName,
            docBindVars
        );
        return res.send(documents);
    } else {
        return res.send([]);
    }
};

export const documentFetchController = async (req: Request, res: Response) => {
    const { docType, documentId, projectId } = req.params;
    const { collectionName, projectCollection } = await getCollectionMetaForDoc(docType);
    fileName = docType.replace(/\s/g, "") + "Errors"
    var projBindVars = {
        '@collection': projectCollection,
        projectId: projectId,
    };
    var query = `for value in @@collection FILTER value.refId == @projectId return value`;
    const projectObj = await db.query(query, projectCollection, projBindVars);
    if (projectObj && projectObj.length === 0) {
        let errorMsg = 'Invalid Project Request'
        createErrorLog(fileName, `BE: ${errorMsg}`)
        throw new BadRequestError('Invalid Project Request');
    }
    var docBindVars = {
        '@collection': collectionName,
        documentId: documentId,
    };
    const response: any = await db.query(
        'for value in @@collection FILTER value.refId == @documentId return value',
        collectionName,
        docBindVars
    );
    if (!response || response.length == 0) {

        let errorMsg = 'Invalid Document Request'
        createErrorLog(fileName, `BE: ${errorMsg}`)

        throw new BadRequestError('Invalid Document Request');
    }
    const document: DocumentModel = response[0];
    var dataFileBindVars = {
        '@collection': collectionName,
        document: document && document.dataFiles ? document.dataFiles : [],
    };
    const documentData = await db.query('RETURN DOCUMENT(@@collection, @document)', collectionName, dataFileBindVars);
    return res.send({ document: document, documentData: documentData[0] });
};

export const documentUpdateController = async (req: Request, res: Response) => {
  


        const {
            body: { document, documentData },
            params: { docType, documentId, projectId },
        } = req;
        fileName = docType.replace(/\s/g, "") + "Errors"
        const { collectionName, journalCollection, docListSectionName } = getCollectionMetaForDoc(docType);
        const { name, _key, email } = req.currentUser;
        var bindVars = {
            '@collection': collectionName,
            documentId: documentId,
        };
        const response: any = await db.query(
            'for document in @@collection FILTER document.refId == @documentId return document',
            collectionName,
            bindVars
        );

        if (!response) {
            let errorMsg = 'Invalid Document Request'
            createErrorLog(fileName, `BE: ${errorMsg}`)

            throw new BadRequestError('Invalid Document Request');
        }
        const doc: DocumentModel = response[0];
        var bindVars1 = {
            '@collection': collectionName,
            document: doc.dataFiles,
        };
        document.properties.modifiedAt = new Date();
        let isAuthorPresent = document.properties.authorsList.some(
            (vendor: any) => vendor["email"] === email
        );
        if (isAuthorPresent == false) {
            const data = {
                name: name,
                _key: _key,
                email: email
            };

            document.properties.authorsList.push(data);
        }
        document.properties.authorsList =
            [...document.properties.authorsList.reduce((map: any, obj: any) => map.set(obj.email, obj), new Map()).values()];
        const responseDocuments = await db.query('RETURN DOCUMENT(@@collection, @document)', collectionName, bindVars1);
        const documentInfo =
            responseDocuments[0]?.map((resDoc: any) => {
                delete resDoc._rev;
                resDoc.data = resDoc.data
                resDoc.meta = resDoc.meta
                resDoc.id = resDoc._key
                delete resDoc._key;
                resDoc._key = resDoc.id
                delete resDoc._id;

                return resDoc;
            }) || [];
        const docData = documentInfo
        const newNodes = Array.from(documentData).filter(
            (node: any) => docData.findIndex((n: any) => n.id === node.id) === -1
        );
        if (newNodes.length != 0)
            newNodes.forEach(function (node: any) {
                if (!node.data.authors) {
                    node.data.authors = [];
                }
                if (!node.data.authors.includes(email))
                    node.data.authors.push(email)
                node.data.modifiedAt = new Date()
            })
        const updatedNodes = Array.from(documentData)
            .map((node: any) => {
                if (!node.data.authors) {
                    node.data.authors = [];
                }
                if (!node.data.authors.includes(email))
                    node.data.authors.push(email)
                const nodeIndex = docData.findIndex((n: any) => n.id === node.id);
                if (nodeIndex === -1) {
                    return;
                }
                let oldNodeData = docData[nodeIndex];
                node.data.comments = oldNodeData.data.comments
                if (JSON.stringify(node) !== JSON.stringify(oldNodeData)) {
                    if (node.data.hasChanged === false) {
                        node.data.hasChanged = true;
                    }
                    return node;
                }
                return;
            })
            .filter((node) => node);

       
        const deletedNodes = Array.from(doc.dataFiles).filter(
            (nodeId: string) => Array.from(documentData).findIndex((n: any) => n.id === nodeId) === -1
        );
        const updatedDocument = { ...doc, ...document };
        await Promise.all([
            db.upsert(doc._key, updatedDocument, collectionName),

            Array.from(newNodes).map(async (data: any) => await db.insert(data, collectionName)),
            Array.from(updatedNodes).map(async (data: any) => {
                await db.update(data._key, data, collectionName);
            }),
            Array.from(deletedNodes).map(async (nodeId: any) => await db.delete(nodeId, collectionName)),
        ]);
        /** update doc name in journal */
        const journalDocBindVars = {
            '@collection': journalCollection,
            projectId: projectId,
            journalName: collectionName
        }
        const result = await db.query('for doc in @@collection FILTER doc.projectRef == @projectId &&' +
            'doc.journalName == @journalName return doc', journalCollection, journalDocBindVars)

        if (result && result[0]) {
            const docs = result[0][docListSectionName];
            for (var index in docs) {
                if (docs[index]._key == doc._key) {
                    docs[index].docName = document ? document.properties.name : '';
                }
            }
            result[0][docListSectionName] = docs;
            await db.update(result[0]._key, result[0], journalCollection)
        }
        return res.send(true);
   
};

//Search methods
export const getSearchResultsFromWholeAppController = async (req: Request, res: Response) => {
    const { projectId, docType, numberOfItems, pageNumber, searchText, wordMatch } = req.params;
    var journalCollection = ''
    var docListSectionName = ''
    if (docType == "Test") {
        setTestTypeOfDoc("Integration", docType);
        var { collectionName, projectCollection, journalCollection, docListSectionName } = getCollectionMetaForDoc(
            docType
        );
    }
    else if (docType == "Status") {
        setTestTypeOfDoc("Integration", "Status");
        var { collectionName, projectCollection, journalCollection, docListSectionName } = getCollectionMetaForDoc(
            "Test"
        );
    }
    else if (docType != "Easy Kanban" && docType != "Task") {
        var { collectionName, projectCollection, journalCollection, docListSectionName } = getCollectionMetaForDoc(
            docType
        );
    }
    else {
        projectCollection = "Projects"
        collectionName = "Tasks"
    }
    var projBindVars = {
        '@collection': projectCollection,
        projectId: projectId,
    };
    var query = `for value in @@collection FILTER value.refId == @projectId return value`;
    const projectObj = await db.query(query, projectCollection, projBindVars,);
    if (projectObj && projectObj.length === 0) {
        throw new BadRequestError('Invalid Project Request');
    }
    if (projectObj[0].journal[collectionName] || docType == "Easy Kanban" || docType == "Task") {
        var docBindVars = {};
        var documents = [];
        if (docType == "Easy Kanban") {
            docBindVars = {
                '@collection': collectionName,
                projectId: projectId,
            };
            documents = await db.query(
                'for doc in @@collection FILTER doc.projectId == @projectId AND doc.productId return doc',
                collectionName,
                docBindVars,
            );
        }
        else if (docType == "Task") {
            docBindVars = {
                '@collection': collectionName,
                projectId: projectId,
            };
            documents = await db.query(
                'for doc in @@collection FILTER doc.projectId == @projectId AND !doc.productId return doc',
                collectionName,
                docBindVars,
            );
        }
        else {
            var journalDocBindVars = {
                '@collection': journalCollection,
                docId: projectObj[0].journal[collectionName],
            };
            const journalDoc = await db.query(
                'for doc in @@collection FILTER doc.refId == @docId return doc',
                journalCollection,
                journalDocBindVars,

            );

            if ((journalDoc && journalDoc.length === 0) || !journalDoc[0][docListSectionName]) {
                return res.send([]);
            }
            var docKeys: any[] = [];
            await journalDoc[0][docListSectionName].forEach((element: any) => {
                docKeys.push(element._key);
            });
            docBindVars = {
                '@collection': collectionName,
                documents: docKeys,
            };
            documents = await db.query(
                'for doc in @@collection FILTER doc._key in @documents return doc',
                collectionName,
                docBindVars,

            );
        }
        var responseData: any = [];
        for (const document of documents) {
            if (docType == "Workflow") {
                var workflowFileBindVars = {
                    '@view': collectionName + 'SearchView',
                    documentId: document.refId,
                    searchText: '%' + searchText + '%',
                };
                var workflowDocSearchResult = [];
                var workflowDocPhraseResult: any[] = [];
                if (wordMatch == 'like') {
                    workflowDocSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.workflowName LIKE @searchText, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        collectionName, workflowFileBindVars);
                    workflowDocPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.workflowName, @searchText, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        collectionName, workflowFileBindVars)
                }
                else if (wordMatch === 'fullMatch') {
                    workflowDocPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.workflowName, "text_en") ' +
                        ' FILTER doc.refId == @documentId return doc',
                        collectionName, workflowFileBindVars)
                }
                for (var index = 0; index < workflowDocPhraseResult.length; index++) {
                    const includesNode = workflowDocSearchResult.some(
                        (doc: any) => doc.refId === workflowDocPhraseResult[index].refId
                    );
                    if (!includesNode) {
                        workflowDocSearchResult.push(workflowDocPhraseResult[index]);
                    }
                }
                var searchResults: any = [];
                for (var i = 0; i < workflowDocSearchResult.length; i++) {
                    searchResults.push(workflowDocSearchResult[i]);
                }
                var data = {};
                if (searchResults.length > 0) {
                    data = {
                        refId: document.refId,
                        docType: document.docType,
                        workflowName: document.workflowName
                    };
                    responseData.push(data);
                }
            }
            else if (document.docType == 'Risk') {
                var riskFileBindVars = {
                    '@view': collectionName + 'SearchView',
                    documentId: document.refId,
                    searchText: '%' + searchText + '%',
                };
                var riskDocSearchResult = [];
                var riskDocPhraseResult: any[] = [];

                if (wordMatch == 'like') {
                    riskDocSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.affectedDisciplines LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.brief LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.text LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.detectionLifeCyclePhase LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.impact LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.impactDescription LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.mitigationPlan LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.owner LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.probability LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.rating LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.riskId LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.riskSources LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.sourcesOfUncertainty LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.actions.id LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.actions.assignee LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.actions.title LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.actions.state LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.actions.action LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.actions.trackingChoice LIKE @searchText, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        collectionName, riskFileBindVars);
                    riskDocPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.affectedDisciplines, @searchText, "text_en")' +
                        ' OR PHRASE(doc.brief, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.text, @searchText, "text_en")' +
                        ' OR PHRASE(doc.detectionLifeCyclePhase, @searchText, "text_en")' +
                        ' OR PHRASE(doc.impact, @searchText, "text_en")' +
                        ' OR PHRASE(doc.impactDescription, @searchText, "text_en")' +
                        ' OR PHRASE(doc.mitigationPlan, @searchText, "text_en")' +
                        ' OR PHRASE(doc.owner, @searchText, "text_en")' +
                        ' OR PHRASE(doc.probability, @searchText, "text_en")' +
                        ' OR PHRASE(doc.rating, @searchText, "text_en")' +
                        ' OR PHRASE(doc.riskId, @searchText, "text_en")' +
                        ' OR PHRASE(doc.riskSources, @searchText, "text_en")' +
                        ' OR PHRASE(doc.sourcesOfUncertainty, @searchText, "text_en")' +
                        ' OR PHRASE(doc.actions.id, @searchText, "text_en")' +
                        ' OR PHRASE(doc.actions.assignee, @searchText, "text_en")' +
                        ' OR PHRASE(doc.actions.title, @searchText, "text_en")' +
                        ' OR PHRASE(doc.actions.action, @searchText, "text_en")' +
                        ' OR PHRASE(doc.actions.state, @searchText, "text_en")' +
                        ' OR PHRASE(doc.actions.trackingChoice, @searchText, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        collectionName, riskFileBindVars)
                }
                else if (wordMatch === 'fullMatch') {
                    riskDocPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.affectedDisciplines, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.brief, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.text, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.detectionLifeCyclePhase, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.impact, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.impactDescription, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.mitigationPlan, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.owner, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.probability, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.rating, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.riskId, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.riskSources, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.sourcesOfUncertainty, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.state, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.id, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.assignee, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.title, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.action, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.trackingChoice, "text_en") ' +
                        ' FILTER doc.refId == @documentId return doc',
                        collectionName, riskFileBindVars)
                }

                for (var index = 0; index < riskDocPhraseResult.length; index++) {
                    const includesNode = riskDocSearchResult.some(
                        (doc: any) => doc.refId === riskDocPhraseResult[index].refId
                    );
                    if (!includesNode) {
                        riskDocSearchResult.push(riskDocPhraseResult[index]);
                    }
                }
                var searchResults: any = [];
                for (var i = 0; i < riskDocSearchResult.length; i++) {
                    searchResults.push(riskDocSearchResult[i]);
                }

                var data = {};
                if (searchResults.length > 0) {
                    data = {
                        riskId: document.riskId,
                        brief: document.brief,
                        refId: document.refId,
                        docType: document.docType,
                    };
                    responseData.push(data);
                }
            }
            else if (document.taskId && docType == "Easy Kanban") {
                var taskFileBindVars = {
                    '@view': collectionName + 'SearchView',
                    documentId: document.taskId,
                    searchText: '%' + searchText + '%',
                };
                var taskSearchResult = [];
                var taskPhraseResult: any[] = [];

                if (wordMatch == 'like') {
                    taskSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.taskState LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.taskType LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.taskId LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.priority LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.category LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.assignee.fullName LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.assignee.role LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.startDate LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.dueDate LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.estimation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.childOf LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.parentOf LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.linkedTo LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.description LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.attachments.file.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.attachments.file.description LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.authorName LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.comment LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.createdAt LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.commentsAttachments.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.commentsAttachments.description LIKE @searchText, "text_en")' +
                        ' FILTER doc.taskId == @documentId return doc',
                        collectionName, taskFileBindVars);
                    taskPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.taskState, @searchText, "text_en")' +
                        ' OR PHRASE(doc.taskId, @searchText, "text_en")' +
                        ' OR PHRASE(doc.taskType, @searchText, "text_en")' +
                        ' OR PHRASE(doc.priority, @searchText, "text_en")' +
                        ' OR PHRASE(doc.category, @searchText, "text_en")' +
                        ' OR PHRASE(doc.assignee.fullName, @searchText, "text_en")' +
                        ' OR PHRASE(doc.assignee.role, @searchText, "text_en")' +
                        ' OR PHRASE(doc.startDate, @searchText, "text_en")' +
                        ' OR PHRASE(doc.dueDate, @searchText, "text_en")' +
                        ' OR PHRASE(doc.childOf, @searchText, "text_en")' +
                        ' OR PHRASE(doc.parentOf, @searchText, "text_en")' +
                        ' OR PHRASE(doc.linkedTo, @searchText, "text_en")' +
                        ' OR PHRASE(doc.description, @searchText, "text_en")' +
                        ' OR PHRASE(doc.attachments.file.name, @searchText, "text_en")' +
                        ' OR PHRASE(doc.attachments.file.description, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.authorName, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.comment, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.createdAt, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.commentsAttachments.name, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.commentsAttachments.description, @searchText, "text_en")' +
                        ' FILTER doc.taskId == @documentId return doc',
                        collectionName, taskFileBindVars)
                }
                else if (wordMatch === 'fullMatch') {
                    taskPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskId, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskState, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskType, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.priority, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.category, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.assignee.fullName, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.assignee.role, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.startDate, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.dueDate, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.childOf, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.parentOf, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.linkedTo, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.description, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.attachments.file.name, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.attachments.file.description, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.authorName, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.comment, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.createdAt, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.commentsAttachments.name, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.commentsAttachments.description, "text_en") ' +
                        ' FILTER doc.taskId == @documentId return doc',
                        collectionName, taskFileBindVars)
                }
                for (var index = 0; index < taskPhraseResult.length; index++) {
                    const includesNode = taskSearchResult.some(
                        (doc: any) => doc.refId === taskPhraseResult[index].refId
                    );
                    if (!includesNode) {
                        taskSearchResult.push(taskPhraseResult[index]);
                    }
                }
                var searchResults: any = [];
                for (var i = 0; i < taskSearchResult.length; i++) {
                    searchResults.push(taskSearchResult[i]);
                }
                var data = {};
                if (searchResults.length > 0) {
                    data = {
                        refId: document.taskId,
                        docType: "Easy Kanban",
                        description: document.description
                    };
                    responseData.push(data);
                }
            }
            else if (docType == "Cover Page") {
                var coverPageFileBindVars = {
                    '@view': collectionName + 'SearchView',
                    documentId: document.refId,
                    searchText: '%' + searchText + '%',
                };
                var coverPageSearchResult = [];
                var coverPagePhraseResult: any[] = [];

                if (wordMatch == 'like') {
                    coverPageSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.properties.name LIKE @searchText, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        collectionName, coverPageFileBindVars);
                    coverPagePhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.properties.name, @searchText, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        collectionName, coverPageFileBindVars)
                }
                else if (wordMatch === 'fullMatch') {
                    coverPagePhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.properties.name, "text_en") ' +
                        ' FILTER doc.refId == @documentId return doc',
                        collectionName, coverPageFileBindVars)
                }

                for (var index = 0; index < coverPagePhraseResult.length; index++) {
                    const includesNode = coverPageSearchResult.some(
                        (doc: any) => doc.refId === coverPagePhraseResult[index].refId
                    );
                    if (!includesNode) {
                        coverPageSearchResult.push(coverPagePhraseResult[index]);
                    }
                }
                var searchResults: any = [];
                for (var i = 0; i < coverPageSearchResult.length; i++) {
                    searchResults.push(coverPageSearchResult[i]);
                }
                var data = {};
                if (searchResults.length > 0) {
                    data = {
                        refId: document.refId,
                        name: document.properties.name,
                        docType: document.properties.docType,
                        description: document.properties.description
                    };
                    responseData.push(data);
                }
            }
            else if (docType == "Task") {
                var taskFileBindVars = {
                    '@view': collectionName + 'SearchView',
                    documentId: document.taskId,
                    searchText: '%' + searchText + '%',
                };
                var taskSearchResult = [];
                var taskPhraseResult: any[] = [];

                if (wordMatch == 'like') {
                    taskSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.taskState LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.taskType LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.taskId LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.priority LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.category LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.discipline LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.author LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.assignee.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.assignee.role LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.dueDate LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.closureDate LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.childOf LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.parentOf LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.linkedTo LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.title LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.description LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.environment LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.tags LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.artifactType LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.projectRepositoryArtifacts.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.affectedItems.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.attachments.file.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.attachments.file.description LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.authorName LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.comment LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.createdAt LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.commentsAttachments.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.comments.commentsAttachments.description LIKE @searchText, "text_en")' +
                        ' FILTER doc.taskId == @documentId return doc',
                        collectionName, taskFileBindVars);
                    taskPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.taskState, @searchText, "text_en")' +
                        ' OR PHRASE(doc.taskId, @searchText, "text_en")' +
                        ' OR PHRASE(doc.taskType, @searchText, "text_en")' +
                        ' OR PHRASE(doc.priority, @searchText, "text_en")' +
                        ' OR PHRASE(doc.author, @searchText, "text_en")' +
                        ' OR PHRASE(doc.category, @searchText, "text_en")' +
                        ' OR PHRASE(doc.discipline, @searchText, "text_en")' +
                        ' OR PHRASE(doc.assignee.name, @searchText, "text_en")' +
                        ' OR PHRASE(doc.assignee.role, @searchText, "text_en")' +
                        ' OR PHRASE(doc.dueDate, @searchText, "text_en")' +
                        ' OR PHRASE(doc.closureDate, @searchText, "text_en")' +
                        ' OR PHRASE(doc.childOf, @searchText, "text_en")' +
                        ' OR PHRASE(doc.parentOf, @searchText, "text_en")' +
                        ' OR PHRASE(doc.linkedTo, @searchText, "text_en")' +
                        ' OR PHRASE(doc.title, @searchText, "text_en")' +
                        ' OR PHRASE(doc.description, @searchText, "text_en")' +
                        ' OR PHRASE(doc.environment, @searchText, "text_en")' +
                        ' OR PHRASE(doc.tags, @searchText, "text_en")' +
                        ' OR PHRASE(doc.artifactType, @searchText, "text_en")' +
                        ' OR PHRASE(doc.projectRepositoryArtifacts.name, @searchText, "text_en")' +
                        ' OR PHRASE(doc.affectedItems.name, @searchText, "text_en")' +
                        ' OR PHRASE(doc.attachments.file.name, @searchText, "text_en")' +
                        ' OR PHRASE(doc.attachments.file.description, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.authorName, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.comment, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.createdAt, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.commentsAttachments.name, @searchText, "text_en")' +
                        ' OR PHRASE(doc.comments.commentsAttachments.description, @searchText, "text_en")' +
                        ' FILTER doc.taskId == @documentId return doc',
                        collectionName, taskFileBindVars)
                }
                else if (wordMatch === 'fullMatch') {
                    taskPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskId, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskState, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskType, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.priority, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.author, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.category, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.discipline, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.assignee.name, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.assignee.role, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.dueDate, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.closureDate, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.childOf, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.parentOf, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.linkedTo, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.title, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.description, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.environment, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.tags, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.artifactType, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc. projectRepositoryArtifacts.name, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc. affectedItems.name, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.attachments.file.name, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.attachments.file.description, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.authorName, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.comment, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.createdAt, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.commentsAttachments.name, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.commentsAttachments.description, "text_en") ' +
                        ' FILTER doc.taskId == @documentId return doc',
                        collectionName, taskFileBindVars)
                }
                for (var index = 0; index < taskPhraseResult.length; index++) {
                    const includesNode = taskSearchResult.some(
                        (doc: any) => doc.refId === taskPhraseResult[index].refId
                    );
                    if (!includesNode) {
                        taskSearchResult.push(taskPhraseResult[index]);
                    }
                }
                var searchResults: any = [];
                for (var i = 0; i < taskSearchResult.length; i++) {
                    searchResults.push(taskSearchResult[i]);
                }
                var data = {};
                if (searchResults.length > 0) {
                    data = {
                        refId: document.taskId,
                        docType: "Taskman",
                        description: document.title
                    };
                    responseData.push(data);
                }
            }
            else {
                var dataFileBindVars = {
                    '@view': collectionName + 'SearchView',
                    documents: document.dataFiles,
                    searchText: '%' + searchText + '%',
                };
                var nodeResponse = [];
                var nodeNameSearchResult: any[] = [];
                var phraseSearchResult: any[] = [];
                var phraseSearchForNodeName: any[] = [];
                var leafNodeSearchResult: any[] = [];
                var leafNodePhraseSearchResult: any[] = [];
                var commentSearchResult: any[] = [];
                var commentPhraseSearchResult: any[] = [];
                if (wordMatch === 'like') {
                    nodeResponse = await db.query(
                        'for node in @@view SEARCH ANALYZER(node.data.text LIKE @searchText, "text_en") FILTER node._key in @documents  return node',
                        collectionName,
                        dataFileBindVars,

                    );
                    nodeNameSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(node.meta.name LIKE @searchText, "text_en") FILTER node._key in @documents  return node',
                        collectionName,
                        dataFileBindVars,

                    );
                    phraseSearchResult = await db.query(
                        'for node in @@view SEARCH PHRASE(node.data.text , @searchText,"text_en") FILTER node._key in @documents  return node',
                        collectionName,
                        dataFileBindVars,

                    );
                    phraseSearchForNodeName = await db.query(
                        'for node in @@view SEARCH PHRASE(node.meta.name , @searchText,"text_en") FILTER node._key in @documents  return node',
                        collectionName,
                        dataFileBindVars,

                    );
                    if (docType == "Use Case") {
                        leafNodeSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(node.data.text.Alternate_Flows LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Assumptions LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Author LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Context LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Exceptions LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Goal LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Main_Success_Scenario LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Post_Conditions LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Pre_Conditions LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Primary_Actor LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Secondary_Actor LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Title LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Trigger LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.UCId LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Superordinate_use_cases LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Main_Success_Scenario_Tmp2.userAction LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.Main_Success_Scenario_Tmp2.systemAction LIKE @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,
                        );
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH PHRASE(node.data.text.Alternate_Flows, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Assumptions, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Author, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Context, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Exceptions, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Goal, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Main_Success_Scenario, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Post_Conditions, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Pre_Conditions, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Primary_Actor, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Secondary_Actor, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Title, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Trigger, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.UCId, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Superordinate_use_cases, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Main_Success_Scenario_Tmp2.userAction, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.Main_Success_Scenario_Tmp2.systemAction, @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,
                        );
                    }
                    if (docType == "Requirement") {
                        leafNodeSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(node.data.requirementForm.acceptanceCriteria LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.requirementForm.testMethod LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.requirementForm.testGuidance LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.attributes[0] LIKE @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName, dataFileBindVars);
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH PHRASE(node.data.requirementForm.acceptanceCriteria, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.requirementForm.testMethod, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.requirementForm.testGuidance, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.attributes[0], @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName, dataFileBindVars);
                    }
                    if (docType == "Checklist") {
                        leafNodeSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(node.data.text.checkList.name LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.checkList.ref LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.checkList.category LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.checkList.defectClass LIKE @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,
                        );
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH PHRASE(node.data.text.checkList.name, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.checkList.ref, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.checkList.category, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.checkList.defectClass, @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,
                        );
                    }
                    if (docType == "Review") {
                        leafNodeSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(node.data.text.addedReviewerMemebers.name LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.addedReviewerMemebers.role LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.category LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.discipline LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.docType LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.reviewState LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.checklistName LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.artifactData.affectedItemsFromOtherSource.name LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.artifactData.artifactDocFromProjectRepo.name LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.supportingDocs.affectedItemsForSupportingDoc.name LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.supportingDocs.manuallyAddedSupportingDocArray.name LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.supportingDocs.supportingDocFromProjectRepo.name LIKE @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,
                        );

                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH PHRASE(node.data.text.addedReviewerMemebers.name, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.addedReviewerMemebers.role, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.category, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.discipline, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.docType, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.reviewState, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.checklistName, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.artifactData.affectedItemsFromOtherSource.name, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.artifactData.artifactDocFromProjectRepo.name, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.supportingDocs.affectedItemsForSupportingDoc.name, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.supportingDocs.manuallyAddedSupportingDocArray.name, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.supportingDocs.supportingDocFromProjectRepo.name, @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,
                        );

                        const commentNodeBindVars = {
                            '@collection': collectionName,
                            documents: document.dataFiles,
                            commentNodeName: "Comments"
                        }
                        const commentResponse = await db.query('for node in @@collection FILTER node.meta.name == @commentNodeName AND node._key in @documents return node', collectionName, commentNodeBindVars);
                        const commentId = commentResponse[0].data.comments[0];
                        if (commentId) {
                            const commentSearchViewBindVars = {
                                '@view': collectionName + "SearchView",
                                documentId: commentId,
                                searchText: '%' + searchText + '%',
                            }

                            commentSearchResult = await db.query(
                                'for doc in @@view SEARCH ANALYZER(doc.commentData.commentRef LIKE @searchText, "text_en")' +
                                ' OR ANALYZER(doc.commentData.panelComments.comment LIKE @searchText, "text_en")' +
                                ' OR ANALYZER(doc.commentData.panelComments.selectedReviewItem LIKE @searchText, "text_en")' +
                                ' OR ANALYZER(doc.commentData.panelComments.selectedCodeReviewItems.name LIKE @searchText, "text_en")' +
                                ' OR ANALYZER(doc.commentData.panelComments.checklist LIKE @searchText, "text_en")' +
                                ' OR ANALYZER(doc.commentData.panelComments.author.name LIKE @searchText, "text_en")' +
                                ' FILTER doc._key == @documentId  return doc',
                                collectionName,
                                commentSearchViewBindVars,
                            );

                            commentPhraseSearchResult = await db.query(
                                'for doc in @@view SEARCH PHRASE(doc.commentData.commentRef, @searchText, "text_en")' +
                                ' OR PHRASE(doc.commentData.panelComments.comment, @searchText, "text_en")' +
                                ' OR PHRASE(doc.commentData.panelComments.selectedReviewItem, @searchText, "text_en")' +
                                ' OR PHRASE(doc.commentData.panelComments.selectedCodeReviewItems.name, @searchText,"text_en")' +
                                ' OR PHRASE(doc.commentData.panelComments.checklist, @searchText, "text_en")' +
                                ' OR PHRASE(doc.commentData.panelComments.author.name, @searchText, "text_en")' +
                                ' FILTER doc._key == @documentId  return doc',
                                collectionName,
                                commentSearchViewBindVars,
                            );
                            if (commentSearchResult.length > 0) {
                                commentSearchResult = commentResponse;
                            }
                            if (commentPhraseSearchResult.length > 0) {
                                commentPhraseSearchResult = commentResponse;
                            }
                        }

                    }
                    if (docType == "Test") {
                        leafNodeSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(node.data.text.author LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.testType LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.testDescription LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.testSetup LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.preConditions LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.postConditions LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.editTest.action LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.editTest.expected LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.traceability.fromDocName LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.traceability.links.name LIKE @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,
                        );
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH PHRASE(node.data.text.author, @searchText, "text_en") ' +
                            ' OR PHRASE(node.data.text.testType, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.testDescription, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.testSetup, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.preConditions, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.postConditions, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.editTest.action, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.editTest.expected, @searchText,"text_en")' +
                            ' OR PHRASE(node.data.text.traceability.fromDocName, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.traceability.links.name, @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName, dataFileBindVars);
                    }
                    if (docType == "Status") {
                        leafNodeSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(node.data.text.author LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.testType LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.testDescription LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.testSetup LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.preConditions LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.postConditions LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.editTest.action LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.editTest.expected LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.traceability.fromDocName LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.traceability.links.name LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.tester.name LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.editTest.actual LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.editTest.testStatus LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(node.data.text.attachedMediaFromExecution.file.name LIKE @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,
                        );
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH PHRASE(node.data.text.author, @searchText, "text_en") ' +
                            ' OR PHRASE(node.data.text.testType, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.testDescription, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.testSetup, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.preConditions, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.postConditions, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.editTest.action, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.editTest.expected, @searchText,"text_en")' +
                            ' OR PHRASE(node.data.text.traceability.fromDocName, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.traceability.links.name, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.tester.name, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.editTest.actual, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.editTest.testStatus, @searchText, "text_en")' +
                            ' OR PHRASE(node.data.text.attachedMediaFromExecution.file.name, @searchText, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName, dataFileBindVars);
                    }
                } else if (wordMatch === 'fullMatch') {
                    dataFileBindVars = {
                        '@view': collectionName + 'SearchView',
                        documents: document.dataFiles,
                        searchText: searchText,
                    };
                    phraseSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text, "text_en") FILTER node._key in @documents  return node',
                        collectionName,
                        dataFileBindVars,

                    );
                    phraseSearchForNodeName = await db.query(
                        'for node in @@view SEARCH ANALYZER(node.meta.name == @searchText, "identity") FILTER node._key in @documents  return node',
                        collectionName,
                        dataFileBindVars,

                    );
                    if (docType == "Use Case") {
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Alternate_Flows, "text_en") ' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Assumptions, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Author, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Context, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Exceptions, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Goal, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Main_Success_Scenario, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Post_Conditions, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Pre_Conditions, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Secondary_Actor, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Title, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Trigger, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.UCId, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Superordinate_use_cases, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Main_Success_Scenario_Tmp2.systemAction, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Main_Success_Scenario_Tmp2.userAction, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,

                        );
                    }
                    if (docType == "Requirement") {
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.requirementForm.acceptanceCriteria, "text_en") ' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.requirementForm.testMethod, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.requirementForm.testGuidance, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.attributes[0], "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName, dataFileBindVars);
                    }
                    if (docType == "Checklist") {
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.name, "text_en") ' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.ref, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.category, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.defectClass, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,

                        );
                    }
                    if (docType == "Review") {
                        const commentNodeBindVars = {
                            '@collection': collectionName,
                            documents: document.dataFiles,
                            commentNodeName: "Comments"
                        }
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.addedReviewerMemebers.name, "text_en") ' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.addedReviewerMemebers.role, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.category, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.discipline, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.docType, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.reviewState, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checklistName, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.artifactData.affectedItemsFromOtherSource.name, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.artifactData.artifactDocFromProjectRepo.name, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.supportingDocs.affectedItemsForSupportingDoc.name, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.supportingDocs.manuallyAddedSupportingDocArray.name, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.supportingDocs.supportingDocFromProjectRepo.name, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName,
                            dataFileBindVars,

                        );
                        const commentResponse = await db.query('for node in @@collection FILTER node.meta.name == @commentNodeName AND node._key in @documents return node', collectionName, commentNodeBindVars);
                        const commentId = commentResponse[0].data.comments[0];
                        if (commentId) {
                            const commentSearchViewBindVars = {
                                '@view': collectionName + "SearchView",
                                documentId: commentId,
                                searchText: '%' + searchText + '%',
                            }
                            commentPhraseSearchResult = await db.query(
                                'for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.commentRef, "text_en") ' +
                                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.comment, "text_en")' +
                                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.selectedReviewItem, "text_en")' +
                                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.selectedCodeReviewItems.name, "text_en")' +
                                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.checklist, "text_en")' +
                                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.author.name, "text_en")' +
                                ' FILTER doc._key == @documentId  return doc',
                                collectionName,
                                commentSearchViewBindVars,
                            );

                            if (commentPhraseSearchResult.length > 0) {
                                commentPhraseSearchResult = commentResponse;
                            }
                        }


                    }

                    if (docType == "Test") {
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.author, "text_en") ' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testType, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testGuidance, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testDescription, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testSetup, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.preConditions, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.postConditions, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.action, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.expected, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.fromDocName, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.links.name, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName, dataFileBindVars);
                    }
                    if (docType == "Status") {
                        leafNodePhraseSearchResult = await db.query(
                            'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.author, "text_en") ' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testType, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testGuidance, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testDescription, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testSetup, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.preConditions, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.postConditions, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.action, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.expected, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.fromDocName, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.links.name, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.tester.name, "text_en") ' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.actual, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.testStatus, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.attachedMediaFromExecution.file.name, "text_en")' +
                            ' FILTER node._key in @documents  return node',
                            collectionName, dataFileBindVars);
                    }
                }
                for (var index = 0; index < phraseSearchResult.length; index++) {
                    const includesNode = nodeResponse.some(
                        (node: any) => node.meta.name === phraseSearchResult[index].meta.name
                    );
                    if (!includesNode) {
                        nodeResponse.push(phraseSearchResult[index]);
                    }
                }
                for (var index = 0; index < nodeNameSearchResult.length; index++) {
                    const includesNode = nodeResponse.some(
                        (node: any) => node.meta.name === nodeNameSearchResult[index].meta.name
                    );
                    if (!includesNode) {
                        nodeResponse.push(nodeNameSearchResult[index]);
                    }
                }
                for (var index = 0; index < phraseSearchForNodeName.length; index++) {
                    const includesNode = nodeResponse.some(
                        (node: any) => node.meta.name === phraseSearchForNodeName[index].meta.name
                    );
                    if (!includesNode) {
                        nodeResponse.push(phraseSearchForNodeName[index]);
                    }
                }
                //For usecase
                for (index = 0; index < leafNodeSearchResult.length; index++) {
                    const includesNode = nodeResponse.some(
                        (node: any) => node.meta.name === leafNodeSearchResult[index].meta.name
                    );
                    if (!includesNode) {
                        nodeResponse.push(leafNodeSearchResult[index]);
                    }
                }
                for (index = 0; index < leafNodePhraseSearchResult.length; index++) {
                    const includesNode = nodeResponse.some(
                        (node: any) => node.meta.name === leafNodePhraseSearchResult[index].meta.name
                    );
                    if (!includesNode) {
                        nodeResponse.push(leafNodePhraseSearchResult[index]);
                    }
                }

                //for review
                for (index = 0; index < commentSearchResult.length; index++) {
                    var includesNode = nodeResponse.some(
                        (node: any) => node.meta.name === commentSearchResult[index].meta.name
                    );
                    if (!includesNode) {
                        nodeResponse.push(commentSearchResult[0]);
                    }
                }
                for (index = 0; index < commentPhraseSearchResult.length; index++) {
                    var includesNode = nodeResponse.some(
                        (node: any) => node.meta.name === commentPhraseSearchResult[index].meta.name
                    );
                    if (!includesNode) {
                        nodeResponse.push(commentPhraseSearchResult[index]);
                    }
                }

                var searchResults: any = [];
                for (var i = 0; i < nodeResponse.length; i++) {
                    searchResults.push(nodeResponse[i]);
                }

                var data = {};
                if (searchResults.length > 0) {
                    data = {
                        searchResults: searchResults,
                        docName: document.properties.name,
                        docType: document.properties.docType,
                    };
                    if (document.properties.docType == "Test" && document.properties.subDocType) {
                        data = {
                            searchResults: searchResults,
                            docName: document.properties.name,
                            docType: document.properties.subDocType,
                        };
                    }
                    responseData.push(data);
                }
            }
        }
        var totalResults: number = responseData.length;
        var startIndex: number = Number(numberOfItems) * (Number(pageNumber) - 1);
        var stopIndex: number = Number(startIndex) + Number(numberOfItems);
        if (stopIndex > totalResults) {
            stopIndex = totalResults;
        }
        var searchData: any = [];
        for (var i = startIndex; i < stopIndex; i++) {
            searchData.push(responseData[i]);
        }
        res.send({ searchData, totalResults });
    } else {
        res.send([]);
    }
};
export const getSearchResultsFromProjectController = async (req: Request, res: Response) => {
    var { projectId, docType, numberOfItems, pageNumber, searchText, wordMatch, appNames } = req.params;
    const { email } = req.currentUser;

    if (docType == "Wiki")
        docType = "Learning"
    if (docType != "Easy Kanban" && docType != "Task") {
        var { projectCollection } = getCollectionMetaForDoc(
            docType
        );
    } else {
        projectCollection = "Projects"
    }
    var projBindVars = {
        '@collection': projectCollection,
        projectId: projectId,
    };
    var query = `for value in @@collection FILTER value.refId == @projectId return value`;
    const projectObj = await db.query(query, projectCollection, projBindVars);
    if (projectObj && projectObj.length === 0) {
        throw new BadRequestError('Invalid Project Request');
    }
    var documents: any = [];
    const appNamesList = appNames.split(",");
    for (var key in projectObj[0].journal) {
        var docBindVars = {};
        var collection = key;
        docBindVars = {
            '@collection': collection,
            projectRef: projectId,
            appNamesList: appNamesList
        };
        const response = await db.query(
            'for doc in @@collection FILTER doc.projectRef == @projectRef && (doc.properties.docType IN @appNamesList OR doc.docType IN @appNamesList OR doc.properties.subDocType IN @appNamesList) return doc',
            collection,
            docBindVars,
        );
        if (response.length > 0) {
            response.forEach((doc) => {
                doc.viewName = key + 'SearchView';
                doc.collectionName = key;
                if (key == "Announcements" || key == "Learnings")
                    doc.subDocType = key;
                documents.push(doc);
            });
        }
    }
    if (appNamesList.includes("Wiki")) {
        var collection = "Glossary";
        const glossaryDocBindvars = {
            '@collection': collection,
            projectRef: projectId
        }
        const response = await db.query(
            'for doc in @@collection FILTER doc.projectRef == @projectRef return doc',
            collection,
            glossaryDocBindvars,
        );
        if (response && response.length > 0) {
            response.forEach((doc) => {
                doc.viewName = collection + "SearchView";
                doc.collectionName = collection;
                doc.subDocType = collection;
                documents.push(doc);
            })
        }
    }
    if (appNamesList.includes("Easy Kanban")) {
        var collectionName = "Tasks";
        docBindVars = {
            '@collection': collectionName,
            projectId: projectId,
        };
        const response = await db.query(
            'for doc in @@collection FILTER doc.projectId == @projectId AND doc.productId return doc',
            collectionName,
            docBindVars,
        );
        if (response && response.length > 0) {
            response.forEach((doc) => {
                doc.viewName = collectionName + "SearchView";
                doc.collectionName = collectionName;
                documents.push(doc);
            })
        }
    }

    if (appNamesList.includes("Task")) {
        var collectionName = "Tasks";
        docBindVars = {
            '@collection': collectionName,
            projectId: projectId,
        };
        const response = await db.query(
            'for doc in @@collection FILTER doc.projectId == @projectId AND !doc.productId return doc',
            collectionName,
            docBindVars,
        );
        if (response && response.length > 0) {
            response.forEach((doc) => {
                doc.viewName = collectionName + "SearchView";
                doc.collectionName = collectionName;
                documents.push(doc);
            })
        }
    }

    var responseData: any[] = [];

    for (const document of documents) {
        if (document.docType == 'Workflow') {
            var workflowFileBindVars = {
                '@view': document.viewName,
                documentId: document.refId,
                searchText: '%' + searchText + '%',
            };
            var workflowDocSearchResult = [];
            var workflowDocPhraseResult: any[] = [];

            if (wordMatch == 'like') {
                workflowDocSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.workflowName LIKE @searchText, "text_en")' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, workflowFileBindVars);
                workflowDocPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.workflowName, @searchText, "text_en")' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, workflowFileBindVars)
            }
            else if (wordMatch === 'fullMatch') {
                workflowDocPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.workflowName, "text_en") ' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, workflowFileBindVars)
            }

            for (var index = 0; index < workflowDocPhraseResult.length; index++) {
                const includesNode = workflowDocSearchResult.some(
                    (doc: any) => doc.refId === workflowDocPhraseResult[index].refId
                );
                if (!includesNode) {
                    workflowDocSearchResult.push(workflowDocPhraseResult[index]);
                }
            }
            var searchResults: any = [];
            for (var i = 0; i < workflowDocSearchResult.length; i++) {
                searchResults.push(workflowDocSearchResult[i]);
            }

            var data = {};
            if (searchResults.length > 0) {
                data = {
                    refId: document.refId,
                    workflowName: document.workflowName,
                    docType: document.docType,
                };
                responseData.push(data);
            }
        }
        else if (document.docType == "Wiki") {
            var wikiFileBindVars = {
                '@view': document.viewName,
                documentId: document.refId,
                searchText: '%' + searchText + '%',

            };
            var wikiDocSearchResult = [];
            var wikiDocPhraseResult: any[] = [];
            if (wordMatch == 'like') {
                if (document.subDocType == "Announcements") {
                    wikiDocSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.announcement.title LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.announcement.announcement LIKE @searchText, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        document.collectionName, wikiFileBindVars);
                    wikiDocPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.announcement.title, @searchText, "text_en")' +
                        ' OR PHRASE(doc.announcement.announcement, @searchText, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        document.collectionName, wikiFileBindVars)
                }
                else if (document.subDocType == "Learnings") {
                    wikiDocSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.articleName LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.tags LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.content LIKE @searchText, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        document.collectionName, wikiFileBindVars);
                    wikiDocPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.articleName, @searchText, "text_en")' +
                        ' OR PHRASE(doc.tags, @searchText, "text_en")' +
                        ' OR PHRASE(doc.content, @searchText, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        document.collectionName, wikiFileBindVars)
                }
                else if (document.subDocType == "Glossary") {
                    wikiDocSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.Glossary.A.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.A.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.B.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.B.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.C.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.C.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.D.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.D.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.E.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.E.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.F.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.F.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.G.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.G.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.H.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.H.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.I.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.I.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.J.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.J.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.K.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.K.expansion LIKE @searchText, "text_en")' +


                        ' OR ANALYZER(doc.Glossary.L.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.L.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.M.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.M.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.N.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.N.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.O.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.O.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.P.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.P.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.Q.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.Q.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.R.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.R.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.S.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.S.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.T.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.T.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.U.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.U.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.V.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.V.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.W.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.W.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.X.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.X.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.Y.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.Y.expansion LIKE @searchText, "text_en")' +

                        ' OR ANALYZER(doc.Glossary.Z.abbreviation LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(doc.Glossary.Z.expansion LIKE @searchText, "text_en")' +

                        ' FILTER doc.refId == @documentId return doc',
                        document.collectionName, wikiFileBindVars);
                    wikiDocPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.Glossary.A.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.A.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.B.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.B.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.C.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.C.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.C.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.C.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.D.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.D.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.E.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.E.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.F.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.F.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.G.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.G.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.H.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.H.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.I.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.I.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.J.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.J.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.K.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.K.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.L.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.L.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.M.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.M.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.N.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.N.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.O.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.O.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.P.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.P.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.Q.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.Q.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.R.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.R.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.S.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.S.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.T.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.T.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.U.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.U.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.V.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.V.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.W.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.W.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.X.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.X.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.Y.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.Y.expansion, @searchText, "text_en")' +

                        ' OR PHRASE(doc.Glossary.Z.abbreviation, @searchText, "text_en")' +
                        ' OR PHRASE(doc.Glossary.Z.expansion, @searchText, "text_en")' +

                        ' FILTER doc.refId == @documentId return doc',
                        document.collectionName, wikiFileBindVars)
                }
            }
            else if (wordMatch === 'fullMatch') {
                if (document.subDocType == "Announcements") {
                    wikiDocPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.announcement.title, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.announcement.announcement, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        document.collectionName, wikiFileBindVars)
                }
                else if (document.subDocType == "Learnings") {
                    if (document.underEditBy && document.underEditBy.email == email) {
                        wikiDocPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.articleName, "text_en") ' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.tags, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.content, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.publishedContent, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.publishedMeta.articleName, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.publishedMeta.tags, "text_en")' +
                            ' FILTER doc.refId == @documentId return doc',
                            document.collectionName, wikiFileBindVars)
                    } else {
                        wikiDocPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.publishedContent, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.publishedMeta.articleName, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.publishedMeta.tags, "text_en")' +
                            ' FILTER doc.refId == @documentId return doc',
                            document.collectionName, wikiFileBindVars)
                    }
                }
                else if (document.subDocType == "Glossary") {
                    wikiDocPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.A.abbreviation, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.A.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.B.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.B.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.C.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.C.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.D.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.D.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.E.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.E.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.F.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.F.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.G.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.G.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.H.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.H.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.I.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.I.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.J.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.J.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.K.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.K.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.L.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.L.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.M.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.M.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.N.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.N.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.O.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.O.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.P.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.P.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.Q.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.Q.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.R.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.R.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.S.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.S.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.T.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.T.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.U.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.U.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.V.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.V.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.W.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.W.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.X.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.X.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.Y.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.Y.expansion, "text_en")' +

                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.Z.abbreviation, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.Glossary.Z.expansion, "text_en")' +
                        ' FILTER doc.refId == @documentId return doc',
                        document.collectionName, wikiFileBindVars)
                }
            }
            for (var index = 0; index < wikiDocPhraseResult.length; index++) {
                const includesNode = wikiDocSearchResult.some(
                    (doc: any) => doc.refId === wikiDocPhraseResult[index].refId
                );
                if (!includesNode) {
                    wikiDocSearchResult.push(wikiDocPhraseResult[index]);
                }
            }
            var searchResults: any = [];
            for (var i = 0; i < wikiDocSearchResult.length; i++) {
                searchResults.push(wikiDocSearchResult[i]);
            }

            var data = {};
            if (searchResults.length > 0) {
                if (document.subDocType == 'Announcements')
                    data = {
                        refId: document.refId,
                        subDocType: document.subDocType,
                        docType: document.docType,
                        title: document.announcement.title
                    }
                else if (document.subDocType == 'Learnings')
                    data = {
                        refId: document.refId,
                        subDocType: document.subDocType,
                        docType: document.docType,
                        title: document.articleName
                    }
                else data = {
                    refId: document.refId,
                    subDocType: document.subDocType,
                    docType: document.docType,
                }
                responseData.push(data);

            }
        }
        else if (document.docType == 'Risk') {
            var riskFileBindVars = {
                '@view': document.collectionName + 'SearchView',
                documentId: document.refId,
                searchText: '%' + searchText + '%',
            };
            var riskDocSearchResult = [];
            var riskDocPhraseResult: any[] = [];

            if (wordMatch == 'like') {
                riskDocSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.affectedDisciplines LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.brief LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.text LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.detectionLifeCyclePhase LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.impact LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.impactDescription LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.mitigationPlan LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.owner LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.probability LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.rating LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.riskId LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.riskSources LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.sourcesOfUncertainty LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.actions.id LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.actions.assignee LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.actions.title LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.actions.state LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.actions.action LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.actions.trackingChoice LIKE @searchText, "text_en")' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, riskFileBindVars);
                riskDocPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.affectedDisciplines, @searchText, "text_en")' +
                    ' OR PHRASE(doc.brief, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.text, @searchText, "text_en")' +
                    ' OR PHRASE(doc.detectionLifeCyclePhase, @searchText, "text_en")' +
                    ' OR PHRASE(doc.impact, @searchText, "text_en")' +
                    ' OR PHRASE(doc.impactDescription, @searchText, "text_en")' +
                    ' OR PHRASE(doc.mitigationPlan, @searchText, "text_en")' +
                    ' OR PHRASE(doc.owner, @searchText, "text_en")' +
                    ' OR PHRASE(doc.probability, @searchText, "text_en")' +
                    ' OR PHRASE(doc.rating, @searchText, "text_en")' +
                    ' OR PHRASE(doc.riskId, @searchText, "text_en")' +
                    ' OR PHRASE(doc.riskSources, @searchText, "text_en")' +
                    ' OR PHRASE(doc.sourcesOfUncertainty, @searchText, "text_en")' +
                    ' OR PHRASE(doc.actions.id, @searchText, "text_en")' +
                    ' OR PHRASE(doc.actions.assignee, @searchText, "text_en")' +
                    ' OR PHRASE(doc.actions.title, @searchText, "text_en")' +
                    ' OR PHRASE(doc.actions.state, @searchText, "text_en")' +
                    ' OR PHRASE(doc.actions.action, @searchText, "text_en")' +
                    ' OR PHRASE(doc.actions.trackingChoice, @searchText, "text_en")' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, riskFileBindVars)
            }
            else if (wordMatch === 'fullMatch') {
                riskDocPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.affectedDisciplines, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.brief, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.text, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.detectionLifeCyclePhase, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.impact, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.impactDescription, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.mitigationPlan, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.owner, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.probability, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.rating, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.riskId, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.riskSources, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.sourcesOfUncertainty, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.id, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.assignee, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.title, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.state, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.action, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.actions.trackingChoice, "text_en") ' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, riskFileBindVars)
            }

            for (var index = 0; index < riskDocPhraseResult.length; index++) {
                const includesNode = riskDocSearchResult.some(
                    (doc: any) => doc.refId === riskDocPhraseResult[index].refId
                );
                if (!includesNode) {
                    riskDocSearchResult.push(riskDocPhraseResult[index]);
                }
            }
            var searchResults: any = [];
            for (var i = 0; i < riskDocSearchResult.length; i++) {
                searchResults.push(riskDocSearchResult[i]);
            }

            var data = {};
            if (searchResults.length > 0) {
                data = {
                    riskId: document.riskId,
                    brief: document.brief,
                    refId: document.refId,
                    docType: document.docType,
                };
                responseData.push(data);
            }
        }
        else if (document.docType == "WBS") {
            var wbsFileBindVars = {
                '@view': document.collectionName + 'SearchView',
                documentId: document.refId,
                searchText: '%' + searchText + '%',
            };
            var wbsDocSearchResult = [];
            var wbsDocPhraseResult: any[] = [];

            if (wordMatch == 'like') {
                wbsDocSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.wbsName LIKE @searchText, "text_en")' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, wbsFileBindVars);
                wbsDocPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.wbsName, @searchText, "text_en")' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, wbsFileBindVars)
            }
            else if (wordMatch === 'fullMatch') {
                wbsDocPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.wbsName, "text_en") ' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, wbsFileBindVars)
            }

            for (var index = 0; index < wbsDocPhraseResult.length; index++) {
                const includesNode = wbsDocSearchResult.some(
                    (doc: any) => doc.refId === wbsDocPhraseResult[index].refId
                );
                if (!includesNode) {
                    wbsDocSearchResult.push(wbsDocPhraseResult[index]);
                }
            }
            var searchResults: any = [];
            for (var i = 0; i < wbsDocSearchResult.length; i++) {
                searchResults.push(wbsDocSearchResult[i]);
            }

            var data = {};
            if (searchResults.length > 0) {
                data = {
                    refId: document.refId,
                    wbsName: document.wbsName,
                    docType: document.docType,
                };
                responseData.push(data);
            }
        }
        else if (document.taskId && document.productId && appNamesList.indexOf("Easy Kanban") != -1) {
            var taskFileBindVars = {
                '@view': document.collectionName + 'SearchView',
                documentId: document.taskId,
                searchText: '%' + searchText + '%',
            };
            var taskSearchResult = [];
            var taskPhraseResult: any[] = [];

            if (wordMatch == 'like') {

                taskSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.taskState LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.taskType LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.taskId LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.priority LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.category LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.assignee.fullName LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.assignee.role LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.startDate LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.dueDate LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.estimation LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.childOf LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.parentOf LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.linkedTo LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.description LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.attachments.file.name LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.attachments.file.description LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.authorName LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.comment LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.createdAt LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.commentsAttachments.name LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.commentsAttachments.description LIKE @searchText, "text_en")' +
                    ' FILTER doc.taskId == @documentId return doc',
                    document.collectionName, taskFileBindVars);
                taskPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.taskState, @searchText, "text_en")' +
                    ' OR PHRASE(doc.taskId, @searchText, "text_en")' +
                    ' OR PHRASE(doc.taskType, @searchText, "text_en")' +
                    ' OR PHRASE(doc.priority, @searchText, "text_en")' +
                    ' OR PHRASE(doc.category, @searchText, "text_en")' +
                    ' OR PHRASE(doc.assignee.fullName, @searchText, "text_en")' +
                    ' OR PHRASE(doc.assignee.role, @searchText, "text_en")' +
                    ' OR PHRASE(doc.startDate, @searchText, "text_en")' +
                    ' OR PHRASE(doc.dueDate, @searchText, "text_en")' +
                    ' OR PHRASE(doc.childOf, @searchText, "text_en")' +
                    ' OR PHRASE(doc.parentOf, @searchText, "text_en")' +
                    ' OR PHRASE(doc.linkedTo, @searchText, "text_en")' +
                    ' OR PHRASE(doc.description, @searchText, "text_en")' +
                    ' OR PHRASE(doc.attachments.file.name, @searchText, "text_en")' +
                    ' OR PHRASE(doc.attachments.file.description, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.authorName, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.comment, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.createdAt, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.commentsAttachments.name, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.commentsAttachments.description, @searchText, "text_en")' +
                    ' FILTER doc.taskId == @documentId return doc',
                    document.collectionName, taskFileBindVars)
            }

            else if (wordMatch === 'fullMatch') {
                taskPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskId, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskState, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskType, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.priority, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.category, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.assignee.fullName, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.assignee.role, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.startDate, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.dueDate, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.childOf, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.parentOf, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.linkedTo, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.description, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.attachments.file.name, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.attachments.file.description, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.authorName, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.comment, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.createdAt, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.commentsAttachments.name, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.commentsAttachments.description, "text_en") ' +
                    ' FILTER doc.taskId == @documentId return doc',
                    document.collectionName, taskFileBindVars)
            }

            for (var index = 0; index < taskPhraseResult.length; index++) {
                const includesNode = taskSearchResult.some(
                    (doc: any) => doc.refId === taskPhraseResult[index].refId
                );
                if (!includesNode) {
                    taskSearchResult.push(taskPhraseResult[index]);
                }
            }
            var searchResults: any = [];
            for (var i = 0; i < taskSearchResult.length; i++) {
                searchResults.push(taskSearchResult[i]);
            }

            var data = {};
            if (searchResults.length > 0) {
                if (document.taskId && document.productId) {
                    data = {
                        refId: document.taskId,
                        description: document.description,
                        docType: "Easy Kanban",
                    };
                }
                else {
                    data = {
                        refId: document.refId,
                        wbsName: document.wbsName,
                        docType: document.docType,
                    };
                }
                responseData.push(data);
            }
        }
        else if (document.taskId && !document.productId && appNamesList.indexOf("Task") != -1) {
            var taskFileBindVars = {
                '@view': document.collectionName + 'SearchView',
                documentId: document.taskId,
                searchText: '%' + searchText + '%',
            };
            var taskSearchResult = [];
            var taskPhraseResult: any[] = [];

            if (wordMatch == 'like') {
                taskSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.taskState LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.taskType LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.taskId LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.priority LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.category LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.discipline LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.author LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.assignee.name LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.assignee.role LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.dueDate LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.closureDate LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.childOf LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.parentOf LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.linkedTo LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.title LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.description LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.environment LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.tags LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.artifactType LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.projectRepositoryArtifacts.name LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.affectedItems.name LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.attachments.file.name LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.attachments.file.description LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.authorName LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.comment LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.createdAt LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.commentsAttachments.name LIKE @searchText, "text_en")' +
                    ' OR ANALYZER(doc.comments.commentsAttachments.description LIKE @searchText, "text_en")' +
                    ' FILTER doc.taskId == @documentId return doc',
                    document.collectionName, taskFileBindVars);
                taskPhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.taskState, @searchText, "text_en")' +
                    ' OR PHRASE(doc.taskId, @searchText, "text_en")' +
                    ' OR PHRASE(doc.taskType, @searchText, "text_en")' +
                    ' OR PHRASE(doc.priority, @searchText, "text_en")' +
                    ' OR PHRASE(doc.author, @searchText, "text_en")' +
                    ' OR PHRASE(doc.category, @searchText, "text_en")' +
                    ' OR PHRASE(doc.discipline, @searchText, "text_en")' +
                    ' OR PHRASE(doc.assignee.name, @searchText, "text_en")' +
                    ' OR PHRASE(doc.assignee.role, @searchText, "text_en")' +
                    ' OR PHRASE(doc.dueDate, @searchText, "text_en")' +
                    ' OR PHRASE(doc.closureDate, @searchText, "text_en")' +
                    ' OR PHRASE(doc.childOf, @searchText, "text_en")' +
                    ' OR PHRASE(doc.parentOf, @searchText, "text_en")' +
                    ' OR PHRASE(doc.linkedTo, @searchText, "text_en")' +
                    ' OR PHRASE(doc.title, @searchText, "text_en")' +
                    ' OR PHRASE(doc.description, @searchText, "text_en")' +
                    ' OR PHRASE(doc.environment, @searchText, "text_en")' +
                    ' OR PHRASE(doc.tags, @searchText, "text_en")' +
                    ' OR PHRASE(doc.artifactType, @searchText, "text_en")' +
                    ' OR PHRASE(doc.projectRepositoryArtifacts.name, @searchText, "text_en")' +
                    ' OR PHRASE(doc.affectedItems.name, @searchText, "text_en")' +
                    ' OR PHRASE(doc.attachments.file.name, @searchText, "text_en")' +
                    ' OR PHRASE(doc.attachments.file.description, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.authorName, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.comment, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.createdAt, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.commentsAttachments.name, @searchText, "text_en")' +
                    ' OR PHRASE(doc.comments.commentsAttachments.description, @searchText, "text_en")' +
                    ' FILTER doc.taskId == @documentId return doc',
                    document.collectionName, taskFileBindVars)
            }
            else if (wordMatch === 'fullMatch') {
                taskPhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskId, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskState, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.taskType, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.priority, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.author, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.category, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.discipline, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.assignee.name, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.assignee.role, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.dueDate, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.closureDate, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.childOf, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.parentOf, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.linkedTo, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.title, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.description, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.environment, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.tags, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.artifactType, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc. projectRepositoryArtifacts.name, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc. affectedItems.name, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.attachments.file.name, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.attachments.file.description, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.authorName, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.comment, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.createdAt, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.commentsAttachments.name, "text_en") ' +
                    ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.comments.commentsAttachments.description, "text_en") ' +
                    ' FILTER doc.taskId == @documentId return doc',
                    document.collectionName, taskFileBindVars)
            }
            for (var index = 0; index < taskPhraseResult.length; index++) {
                const includesNode = taskSearchResult.some(
                    (doc: any) => doc.refId === taskPhraseResult[index].refId
                );
                if (!includesNode) {
                    taskSearchResult.push(taskPhraseResult[index]);
                }
            }
            var searchResults: any = [];
            for (var i = 0; i < taskSearchResult.length; i++) {
                searchResults.push(taskSearchResult[i]);
            }
            var data = {};
            if (searchResults.length > 0) {
                data = {
                    refId: document.taskId,
                    docType: "Taskman",
                    description: document.title
                };
                responseData.push(data);
            }
        }
        else if (appNamesList.indexOf("Cover Page") != -1 && document.properties && document.properties.docType == "Cover Page") {
            var coverPageFileBindVars = {
                '@view': document.collectionName + 'SearchView',
                documentId: document.refId,
                searchText: '%' + searchText + '%',
            };
            var coverPageSearchResult = [];
            var coverPagePhraseResult: any[] = [];

            if (wordMatch == 'like') {
                coverPageSearchResult = await db.query('for doc in @@view SEARCH ANALYZER(doc.properties.name LIKE @searchText, "text_en")' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, coverPageFileBindVars);
                coverPagePhraseResult = await db.query('for doc in @@view SEARCH PHRASE(doc.properties.name, @searchText, "text_en")' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, coverPageFileBindVars)
            }
            else if (wordMatch === 'fullMatch') {
                coverPagePhraseResult = await db.query('for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.properties.name, "text_en") ' +
                    ' FILTER doc.refId == @documentId return doc',
                    document.collectionName, coverPageFileBindVars)
            }

            for (var index = 0; index < coverPagePhraseResult.length; index++) {
                const includesNode = coverPageSearchResult.some(
                    (doc: any) => doc.refId === coverPagePhraseResult[index].refId
                );
                if (!includesNode) {
                    coverPageSearchResult.push(coverPagePhraseResult[index]);
                }
            }
            var searchResults: any = [];
            for (var i = 0; i < coverPageSearchResult.length; i++) {
                searchResults.push(coverPageSearchResult[i]);
            }
            var data = {};
            if (searchResults.length > 0) {
                data = {
                    refId: document.refId,
                    name: document.properties.name,
                    docType: document.properties.docType,
                    description: document.properties.description
                };
                responseData.push(data);
            }
        }
        else if (document.dataFiles) {
            var dataFileBindVars = {
                '@view': document.viewName,
                documents: document.dataFiles,
                searchText: '%' + searchText + '%',
            };
            var nodeResponse = [];
            var nodeNameSearchResult: any[] = [];
            var phraseSearchResult: any[] = [];
            var phraseSearchForNodeName: any[] = [];
            var leafNodeSearchResult: any[] = [];
            var leafNodePhraseSearchResult: any[] = [];
            var commentPhraseSearchResult: any[] = [];
            var commentSearchResult: any[] = [];

            if (wordMatch === 'like') {
                var nodeResponse = await db.query(
                    'for node in @@view SEARCH ANALYZER(node.data.text LIKE @searchText, "text_en") FILTER node._key in @documents  return node',
                    document.collectionName,
                    dataFileBindVars,

                );
                nodeNameSearchResult = await db.query(
                    'for node in @@view SEARCH ANALYZER(node.meta.name LIKE @searchText, "text_en") FILTER node._key in @documents  return node',
                    document.collectionName,
                    dataFileBindVars,

                );
                phraseSearchResult = await db.query(
                    'for node in @@view SEARCH PHRASE(node.data.text , @searchText,"text_en") FILTER node._key in @documents  return node',
                    document.collectionName,
                    dataFileBindVars,

                );
                phraseSearchForNodeName = await db.query(
                    'for node in @@view SEARCH PHRASE(node.meta.name , @searchText,"text_en") FILTER node._key in @documents  return node',
                    document.collectionName,
                    dataFileBindVars,

                );
                if (appNamesList.indexOf("Use Case") != -1 && document.collectionName == "Studies") {
                    leafNodeSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(node.data.text.Alternate_Flows LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Assumptions LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Author LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Context LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Exceptions LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Goal LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Main_Success_Scenario LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Post_Conditions LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Pre_Conditions LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Primary_Actor LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Secondary_Actor LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Title LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Trigger LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.UCId LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Superordinate_use_cases LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.Main_Success_Scenario_Tmp2 LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.ata.text.Main_Success_Scenario_Tmp2.userAction LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.ata.text.Main_Success_Scenario_Tmp2.systemAction LIKE @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,
                    );
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH PHRASE(node.data.text.Alternate_Flows, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Assumptions, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Author, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Context, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Exceptions, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Goal, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Main_Success_Scenario, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Post_Conditions, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Pre_Conditions, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Primary_Actor, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Secondary_Actor, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Title, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Trigger, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.UCId, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Superordinate_use_cases, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Main_Success_Scenario_Tmp2, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Main_Success_Scenario_Tmp2.userAction, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.Main_Success_Scenario_Tmp2.systemAction, @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,
                    );

                }
                if (appNamesList.indexOf("Requirement") != -1 && document.collectionName == "Requirements") {
                    leafNodeSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(node.data.requirementForm.acceptanceCriteria LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.requirementForm.testMethod LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.requirementForm.testGuidance LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.attributes[0] LIKE @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName, dataFileBindVars);
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH PHRASE(node.data.requirementForm.acceptanceCriteria, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.requirementForm.testMethod, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.requirementForm.testGuidance, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.attributes[0], @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName, dataFileBindVars);
                }
                if (appNamesList.indexOf("Checklist") != -1 && document.collectionName == "Checklists") {
                    leafNodeSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(node.data.text.checkList.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.checkList.ref LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.checkList.category LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.checkList.defectClass LIKE @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,
                    );
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH PHRASE(node.data.text.checkList.name, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.checkList.ref, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.checkList.category, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.checkList.defectClass, @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,
                    );

                }
                if (appNamesList.indexOf("Review") != -1 && document.collectionName == "Reviews") {

                    leafNodeSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(node.data.text.addedReviewerMemebers.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.addedReviewerMemebers.role LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.category LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.discipline LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.docType LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.reviewState LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.checklistName LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.artifactData.affectedItemsFromOtherSource.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.artifactData.artifactDocFromProjectRepo.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.supportingDocs.affectedItemsForSupportingDoc.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.supportingDocs.manuallyAddedSupportingDocArray.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.supportingDocs.supportingDocFromProjectRepo.name LIKE @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,
                    );

                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH PHRASE(node.data.text.addedReviewerMemebers.name, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.addedReviewerMemebers.role, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.category, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.discipline, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.docType, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.reviewState, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.checklistName, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.artifactData.affectedItemsFromOtherSource.name, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.artifactData.artifactDocFromProjectRepo.name, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.supportingDocs.affectedItemsForSupportingDoc.name, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.supportingDocs.manuallyAddedSupportingDocArray.name, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.supportingDocs.supportingDocFromProjectRepo.name, @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,
                    );

                    const commentNodeBindVars = {
                        '@collection': document.collectionName,
                        documents: document.dataFiles,
                        commentNodeName: "Comments"
                    }
                    const commentResponse = await db.query('for node in @@collection FILTER node.meta.name == @commentNodeName AND node._key in @documents return node', document.collectionName, commentNodeBindVars);
                    const commentId = commentResponse[0].data.comments[0];
                    if (commentId) {
                        const commentSearchViewBindVars = {
                            '@view': document.collectionName + "SearchView",
                            documentId: commentId,
                            searchText: '%' + searchText + '%',
                        }

                        commentSearchResult = await db.query(
                            'for doc in @@view SEARCH ANALYZER(doc.commentData.commentRef LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(doc.commentData.panelComments.comment LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(doc.commentData.panelComments.selectedReviewItem LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(doc.commentData.panelComments.selectedCodeReviewItems.name LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(doc.commentData.panelComments.checklist LIKE @searchText, "text_en")' +
                            ' OR ANALYZER(doc.commentData.panelComments.author.name  LIKE @searchText, "text_en")' +
                            ' FILTER doc._key == @documentId  return doc',
                            document.collectionName,
                            commentSearchViewBindVars,
                        );
                        commentPhraseSearchResult = await db.query(
                            'for doc in @@view SEARCH PHRASE(doc.commentData.commentRef, @searchText, "text_en")' +
                            ' OR PHRASE(doc.commentData.panelComments.comment, @searchText, "text_en")' +
                            ' OR PHRASE(doc.commentData.panelComments.selectedReviewItem, @searchText, "text_en")' +
                            ' OR PHRASE(doc.commentData.panelComments.selectedCodeReviewItems.name, @searchText, "text_en")' +
                            ' OR PHRASE(doc.commentData.panelComments.checklist, @searchText, "text_en")' +
                            ' OR PHRASE(doc.commentData.panelComments.author.name, @searchText,"text_en")' +
                            ' FILTER doc._key == @documentId  return doc',
                            document.collectionName,
                            commentSearchViewBindVars,
                        );
                        if (commentSearchResult.length > 0) {
                            commentSearchResult = commentResponse;
                        }
                        if (commentPhraseSearchResult.length > 0) {
                            commentPhraseSearchResult = commentResponse;
                        }
                    }
                }
                if (appNamesList.indexOf("Test") != -1 && document.collectionName == "Tests" && !document.properties.subDocType) {
                    leafNodeSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(node.data.text.author LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.testType LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.testDescription LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.testSetup LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.preConditions LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.postConditions LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.editTest.action LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.editTest.expected LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.traceability.fromDocName LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.traceability.links.name LIKE @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,
                    );
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.author, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testType, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testDescription, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testSetup, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.preConditions, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.postConditions, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.action, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.expected, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.fromDocName, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.links.name, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName, dataFileBindVars);
                }
                if (appNamesList.indexOf("Status") != -1 && document.collectionName == "Tests" && document.properties.subDocType == "Status") {
                    leafNodeSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(node.data.text.author LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.testType LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.testDescription LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.testSetup LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.preConditions LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.postConditions LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.editTest.action LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.editTest.expected LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.traceability.fromDocName LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.traceability.links.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.tester.name LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.editTest.actual LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.editTest.testStatus LIKE @searchText, "text_en")' +
                        ' OR ANALYZER(node.data.text.attachedMediaFromExecution.file.name LIKE @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,
                    );
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH PHRASE(node.data.text.author, @searchText, "text_en") ' +
                        ' OR PHRASE(node.data.text.testType, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.testDescription, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.testSetup, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.preConditions, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.postConditions, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.editTest.action, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.editTest.expected, @searchText,"text_en")' +
                        ' OR PHRASE(node.data.text.traceability.fromDocName, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.traceability.links.name, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.tester.name, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.editTest.actual, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.editTest.testStatus, @searchText, "text_en")' +
                        ' OR PHRASE(node.data.text.attachedMediaFromExecution.file.name, @searchText, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName, dataFileBindVars);
                }
            } else if (wordMatch === 'fullMatch') {
                dataFileBindVars = {
                    '@view': document.viewName,
                    documents: document.dataFiles,
                    searchText: searchText,
                };
                phraseSearchResult = await db.query(
                    'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text, "text_en") FILTER node._key in @documents  return node',
                    document.collectionName,
                    dataFileBindVars,

                );
                phraseSearchForNodeName = await db.query(
                    'for node in @@view SEARCH ANALYZER(node.meta.name == @searchText, "identity") FILTER node._key in @documents  return node',
                    document.collectionName,
                    dataFileBindVars,

                );
                if (appNamesList.indexOf("Use Case") != -1 && document.collectionName == "Studies") {
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Alternate_Flows, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Assumptions, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Author, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Context, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Exceptions, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Goal, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Main_Success_Scenario, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Post_Conditions, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Pre_Conditions, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Secondary_Actor, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Title, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Trigger, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.UCId, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Superordinate_use_cases, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Main_Success_Scenario_Tmp2.userAction, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Main_Success_Scenario_Tmp2.systemAction, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,

                    );
                }
                if (appNamesList.indexOf("Requirement") != -1 && document.collectionName == "Requirements") {
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.requirementForm.acceptanceCriteria, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.requirementForm.testMethod, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.requirementForm.testGuidance, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.attributes[0], "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName, dataFileBindVars);
                }
                if (appNamesList.indexOf("Checklist") != -1 && document.collectionName == "Checklists") {
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.name, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.ref, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.category, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.defectClass, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,

                    );
                }
                if (appNamesList.indexOf("Review") != -1 && document.collectionName == "Reviews") {
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.addedReviewerMemebers.name, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.addedReviewerMemebers.role, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.category, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.discipline, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.docType, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.reviewState, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checklistName, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.artifactData.affectedItemsFromOtherSource.name, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.artifactData.artifactDocFromProjectRepo.name, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.supportingDocs.affectedItemsForSupportingDoc.name, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.supportingDocs.manuallyAddedSupportingDocArray.name, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.supportingDocs.supportingDocFromProjectRepo.name, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName,
                        dataFileBindVars,
                    );
                    const commentNodeBindVars = {
                        '@collection': document.collectionName,
                        documents: document.dataFiles,
                        commentNodeName: "Comments"
                    }
                    const commentResponse = await db.query('for node in @@collection FILTER node.meta.name == @commentNodeName AND node._key in @documents return node', document.collectionName, commentNodeBindVars);
                    const commentId = commentResponse[0].data.comments[0];
                    if (commentId) {
                        const commentSearchViewBindVars = {
                            '@view': document.collectionName + "SearchView",
                            documentId: commentId,
                            searchText: '%' + searchText + '%',
                        }

                        commentPhraseSearchResult = await db.query(
                            'for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.commentRef, "text_en") ' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.comment, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.selectedReviewItem, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.selectedCodeReviewItems.name, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.checklist, "text_en")' +
                            ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.author.name, "text_en")' +
                            ' FILTER doc._key == @documentId  return doc',
                            document.collectionName,
                            commentSearchViewBindVars,

                        );
                        if (commentPhraseSearchResult.length > 0) {
                            commentPhraseSearchResult = commentResponse;
                        }
                    }

                }

                if (appNamesList.indexOf("Test") != -1 && document.collectionName == "Tests" &&
                    !document.properties.subDocType) {
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.author, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testType, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testGuidance, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testDescription, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testSetup, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.preConditions, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.postConditions, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.action, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.expected, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.fromDocName, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.links.name, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName, dataFileBindVars);
                }

                if (appNamesList.indexOf("Status") != -1 && document.collectionName == "Tests" && document.properties.subDocType == "Status") {
                    leafNodePhraseSearchResult = await db.query(
                        'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.author, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testType, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testGuidance, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testDescription, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testSetup, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.preConditions, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.postConditions, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.action, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.expected, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.fromDocName, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.links.name, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.tester.name, "text_en") ' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.actual, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.testStatus, "text_en")' +
                        ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.attachedMediaFromExecution.file.name, "text_en")' +
                        ' FILTER node._key in @documents  return node',
                        document.collectionName, dataFileBindVars);
                }
            }

            for (var index = 0; index < phraseSearchResult.length; index++) {
                const includesNode = nodeResponse.some(
                    (node: any) => node.meta.name === phraseSearchResult[index].meta.name
                );
                if (!includesNode) {
                    nodeResponse.push(phraseSearchResult[index]);
                }
            }
            for (var index = 0; index < nodeNameSearchResult.length; index++) {
                const includesNode = nodeResponse.some(
                    (node: any) => node.meta.name === nodeNameSearchResult[index].meta.name
                );
                if (!includesNode) {
                    nodeResponse.push(nodeNameSearchResult[index]);
                }
            }
            for (var index = 0; index < phraseSearchForNodeName.length; index++) {
                const includesNode = nodeResponse.some(
                    (node: any) => node.meta.name === phraseSearchForNodeName[index].meta.name
                );
                if (!includesNode) {
                    nodeResponse.push(phraseSearchForNodeName[index]);
                }
            }
            //For usecase and other applications which have leaf node.
            for (index = 0; index < leafNodeSearchResult.length; index++) {
                const includesNode = nodeResponse.some(
                    (node: any) => node.meta.name === leafNodeSearchResult[index].meta.name
                );
                if (!includesNode) {
                    nodeResponse.push(leafNodeSearchResult[index]);
                }
            }
            for (index = 0; index < leafNodePhraseSearchResult.length; index++) {
                const includesNode = nodeResponse.some(
                    (node: any) => node.meta.name === leafNodePhraseSearchResult[index].meta.name
                );
                if (!includesNode) {
                    nodeResponse.push(leafNodePhraseSearchResult[index]);
                }
            }
            //for review
            for (index = 0; index < commentSearchResult.length; index++) {
                var includesNode = nodeResponse.some(
                    (node: any) => node.meta.name === commentSearchResult[index].meta.name
                );
                if (!includesNode) {
                    nodeResponse.push(commentSearchResult[0]);
                }
            }
            for (index = 0; index < commentPhraseSearchResult.length; index++) {
                var includesNode = nodeResponse.some(
                    (node: any) => node.meta.name === commentPhraseSearchResult[index].meta.name
                );
                if (!includesNode) {
                    nodeResponse.push(commentPhraseSearchResult[index]);
                }
            }
            var searchResults: any = [];
            for (var i = 0; i < nodeResponse.length; i++) {
                searchResults.push(nodeResponse[i]);
            }
            var data = {};
            if (searchResults.length > 0) {
                data = {
                    searchResults: searchResults,
                    docName: document.properties.name,
                    docType: document.properties.docType,
                };
                if (document.properties.docType == "Test" && document.properties.subDocType) {
                    data = {
                        searchResults: searchResults,
                        docName: document.properties.name,
                        docType: document.properties.subDocType,
                    };
                }
                responseData.push(data)
            }
        }
    }
    var totalResults: number = responseData.length;
    var startIndex: number = Number(numberOfItems) * (Number(pageNumber) - 1);
    var stopIndex: number = Number(startIndex) + Number(numberOfItems);
    if (stopIndex > totalResults) {
        stopIndex = totalResults;
    }
    var searchData: any = [];
    for (var i = startIndex; i < stopIndex; i++) {
        searchData.push(responseData[i]);
    }
    res.send({ searchData, totalResults });
};
export const getSearchResultsController = async (req: Request, res: Response) => {
    const { projectId, documentId, numberOfItems, pageNumber, docType, searchText, wordMatch } = req.params;
    if (docType != 'Status')
        var { projectCollection, collectionName } = getCollectionMetaForDoc(docType);
    else var { projectCollection, collectionName } = getCollectionMetaForDoc("Test");

    var projBindVars = {
        '@collection': projectCollection,
        projectId: projectId,
    };

    var query = `for value in @@collection FILTER value.refId == @projectId return value`;
    const projectObj = await db.query(query, projectCollection, projBindVars);
    if (projectObj && projectObj.length === 0) {
        throw new BadRequestError('Invalid Project Request');
    }
    var docBindVars = {
        '@collection': collectionName,
        documentId: documentId,
    };
    const response: any = await db.query(
        'for value in @@collection FILTER value.refId == @documentId return value',
        collectionName,
        docBindVars,

    );
    if (!response || !response[0]) {
        throw new BadRequestError('Invalid Document Request');
    }
    const document: DocumentModel = response[0];
    var dataFileBindVars = {
        '@view': collectionName + 'SearchView',
        documents: document.dataFiles,
        searchText: '%' + searchText + '%',
    };

    var nodeResponse = [];
    var nodeNameSearchResult: any[] = [];
    var phraseSearchResult: any[] = [];
    var phraseSearchForNodeName: any[] = [];
    var leafNodeSearchResult: any[] = [];
    var leafNodePhraseSearchResult: any[] = [];
    var commentSearchResult: any[] = [];
    var commentPhraseSearchResult: any[] = [];


    if (wordMatch === 'like') {
        nodeResponse = await db.query(
            'for node in @@view SEARCH ANALYZER(node.data.text LIKE @searchText, "text_en") FILTER node._key in @documents  return node',
            collectionName,
            dataFileBindVars,
        );
        nodeNameSearchResult = await db.query(
            'for node in @@view SEARCH ANALYZER(node.meta.name LIKE @searchText, "text_en") FILTER node._key in @documents  return node',
            collectionName,
            dataFileBindVars,
        );
        phraseSearchResult = await db.query(
            'for node in @@view SEARCH PHRASE(node.data.text, @searchText, "text_en") FILTER node._key in @documents  return node',
            collectionName,
            dataFileBindVars,

        );
        phraseSearchForNodeName = await db.query(
            'for node in @@view SEARCH PHRASE(node.meta.name, @searchText, "text_en") FILTER node._key in @documents  return node',
            collectionName,
            dataFileBindVars,

        );
        if (docType == "Use Case") {
            leafNodeSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(node.data.text.Alternate_Flows LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Assumptions LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Author LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Context LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Exceptions LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Goal LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Main_Success_Scenario LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Post_Conditions LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Pre_Conditions LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Primary_Actor LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Secondary_Actor LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Title LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Trigger LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.UCId LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Superordinate_use_cases LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Main_Success_Scenario_Tmp2.userAction LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.Main_Success_Scenario_Tmp2.systemAction LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.traceability.fromDocName LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.traceability.links.name LIKE @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,
            );

            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH PHRASE(node.data.text.Alternate_Flows, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Assumptions, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Author, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Context, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Exceptions, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Goal, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Main_Success_Scenario, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Post_Conditions, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Pre_Conditions, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Primary_Actor, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Secondary_Actor, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Title, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Trigger, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.UCId, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Superordinate_use_cases, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Main_Success_Scenario_Tmp2.userAction, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.Main_Success_Scenario_Tmp2.systemAction, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.traceability.fromDocName, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.traceability.links.name, @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,
            );
        }
        if (docType == "Requirement") {
            leafNodeSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(node.data.requirementForm.acceptanceCriteria LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.requirementForm.testMethod LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.requirementForm.testGuidance LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.attributes[0] LIKE @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName, dataFileBindVars);
            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH PHRASE(node.data.requirementForm.acceptanceCriteria, @searchText, "text_en")' +
                ' OR PHRASE(node.data.requirementForm.testMethod, @searchText, "text_en")' +
                ' OR PHRASE(node.data.requirementForm.testGuidance, @searchText, "text_en")' +
                ' OR PHRASE(node.data.attributes[0], @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName, dataFileBindVars);
        }
        if (docType == "Checklist") {
            leafNodeSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(node.data.text.checkList.name LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.checkList.category LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.checkList.defectClass LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.checkList.ref LIKE @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,
            );

            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH PHRASE(node.data.text.checkList.name, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.checkList.category, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.checkList.defectClass, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.checkList.ref, @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,
            );
        }
        if (docType == "Review") {
            leafNodeSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(node.data.text.addedReviewerMemebers.name LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.addedReviewerMemebers.role LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.category LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.discipline LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.docType LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.reviewState LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.checklistName LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.artifactData.affectedItemsFromOtherSource.name LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.artifactData.artifactDocFromProjectRepo.name LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.supportingDocs.affectedItemsForSupportingDoc.name LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.supportingDocs.manuallyAddedSupportingDocArray.name LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.supportingDocs.supportingDocFromProjectRepo.name LIKE @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,
            );

            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH PHRASE(node.data.text.addedReviewerMemebers.name, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.addedReviewerMemebers.role, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.category, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.discipline, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.docType, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.reviewState, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.checklistName, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.artifactData.affectedItemsFromOtherSource.name, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.artifactData.artifactDocFromProjectRepo.name, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.supportingDocs.affectedItemsForSupportingDoc.name, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.supportingDocs.manuallyAddedSupportingDocArray.name, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.supportingDocs.supportingDocFromProjectRepo.name, @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,
            );

            const commentNodeBindVars = {
                '@collection': collectionName,
                documents: document.dataFiles,
                commentNodeName: "Comments"
            }
            const commentResponse = await db.query('for node in @@collection FILTER node.meta.name == @commentNodeName AND node._key in @documents return node', collectionName, commentNodeBindVars);
            const commentId = commentResponse[0].data.comments[0];
            const commentSearchViewBindVars = {
                '@view': collectionName + "SearchView",
                documentId: commentId,
                searchText: '%' + searchText + '%',
            }

            commentSearchResult = await db.query(
                'for doc in @@view SEARCH ANALYZER(doc.commentData.commentRef LIKE @searchText, "text_en")' +
                ' OR ANALYZER(doc.commentData.panelComments.comment LIKE @searchText, "text_en")' +
                ' OR ANALYZER(doc.commentData.panelComments.selectedReviewItem LIKE @searchText, "text_en")' +
                ' OR ANALYZER(doc.commentData.panelComments.selectedCodeReviewItems.name LIKE @searchText, "text_en")' +
                ' OR ANALYZER(doc.commentData.panelComments.checklist LIKE @searchText, "text_en")' +
                ' OR ANALYZER(doc.commentData.panelComments.author.name  LIKE @searchText, "text_en")' +
                ' FILTER doc._key == @documentId  return doc',
                collectionName,
                commentSearchViewBindVars,
            );

            commentPhraseSearchResult = await db.query(
                'for doc in @@view SEARCH PHRASE(doc.commentData.commentRef, @searchText, "text_en")' +
                ' OR PHRASE(doc.commentData.panelComments.comment, @searchText, "text_en")' +
                ' OR PHRASE(doc.commentData.panelComments.selectedReviewItem, @searchText, "text_en")' +
                ' OR PHRASE(doc.commentData.panelComments.selectedCodeReviewItems.name, @searchText, "text_en")' +
                ' OR PHRASE(doc.commentData.panelComments.checklist, @searchText, "text_en")' +
                ' OR PHRASE(doc.commentData.panelComments.author.name,  @searchText,"text_en")' +
                ' FILTER doc._key == @documentId  return doc',
                collectionName,
                commentSearchViewBindVars,
            );

            if (commentSearchResult.length > 0) {
                commentSearchResult = commentResponse;
            }
            if (commentPhraseSearchResult.length > 0) {
                commentPhraseSearchResult = commentResponse;
            }
        }

        if (docType == "Test") {
            leafNodeSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(node.data.text.author LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.testType LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.testDescription LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.testSetup LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.preConditions LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.postConditions LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.editTest.action LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.editTest.expected LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.traceability.fromDocName LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.traceability.links.name LIKE @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,
            );
            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH PHRASE(node.data.text.author, @searchText, "text_en") ' +
                ' OR PHRASE(node.data.text.testType, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.testDescription, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.testSetup, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.preConditions, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.postConditions, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.editTest.action, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.editTest.expected, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.traceability.fromDocName, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.traceability.links.name, @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName, dataFileBindVars);
        }
        if (docType == "Status") {
            leafNodeSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(node.data.text.author LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.testType LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.testDescription LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.testSetup LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.preConditions LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.postConditions LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.editTest.action LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.editTest.expected LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.traceability.fromDocName LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.traceability.links.name LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.tester.name LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.editTest.actual LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.editTest.testStatus LIKE @searchText, "text_en")' +
                ' OR ANALYZER(node.data.text.attachedMediaFromExecution.file.name LIKE @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,
            );
            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH PHRASE(node.data.text.author, @searchText, "text_en") ' +
                ' OR PHRASE(node.data.text.testType, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.testDescription, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.testSetup, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.preConditions, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.postConditions, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.editTest.action, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.editTest.expected, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.traceability.fromDocName, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.traceability.links.name, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.tester.name, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.editTest.actual, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.editTest.testStatus, @searchText, "text_en")' +
                ' OR PHRASE(node.data.text.attachedMediaFromExecution.file.name, @searchText, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName, dataFileBindVars);
        }

    } else if (wordMatch === 'fullMatch') {
        dataFileBindVars = {
            '@view': collectionName + 'SearchView',
            documents: document.dataFiles,
            searchText: searchText,
        };
        phraseSearchResult = await db.query(
            'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text, "text_en") FILTER node._key in @documents  return node',
            collectionName,
            dataFileBindVars,
        );
        phraseSearchForNodeName = await db.query(
            'for node in @@view SEARCH ANALYZER(node.meta.name == @searchText , "identity") FILTER node._key in @documents  return node',
            collectionName,
            dataFileBindVars,
        );

        if (docType == "Use Case") {
            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Alternate_Flows, "text_en") ' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Assumptions, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Author, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Context, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Exceptions, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Goal, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Main_Success_Scenario, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Post_Conditions, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Pre_Conditions, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Secondary_Actor, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Title, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Trigger, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.UCId, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Superordinate_use_cases, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Main_Success_Scenario_Tmp2.userAction, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.Main_Success_Scenario_Tmp2.systemAction, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.fromDocName, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.links.name, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,

            );
        }
        if (docType == "Requirement") {
            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.requirementForm.acceptanceCriteria, "text_en") ' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.requirementForm.testMethod, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.requirementForm.testGuidance, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.attributes[0], "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName, dataFileBindVars);
        }
        if (docType == "Checklist") {
            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.name, "text_en") ' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.category, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.defectClass, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checkList.ref, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,
            );
        }

        if (docType == "Review") {
            const commentNodeBindVars = {
                '@collection': collectionName,
                documents: document.dataFiles,
                commentNodeName: "Comments"
            }
            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.addedReviewerMemebers.name, "text_en") ' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.addedReviewerMemebers.role, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.category, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.discipline, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.docType, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.reviewState, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.checklistName, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.artifactData.affectedItemsFromOtherSource.name, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.artifactData.artifactDocFromProjectRepo.name, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.supportingDocs.affectedItemsForSupportingDoc.name, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.supportingDocs.manuallyAddedSupportingDocArray.name, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.supportingDocs.supportingDocFromProjectRepo.name, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName,
                dataFileBindVars,

            );
            const commentResponse = await db.query('for node in @@collection FILTER node.meta.name == @commentNodeName AND node._key in @documents return node', collectionName, commentNodeBindVars);
            const commentId = commentResponse[0].data.comments[0];
            const commentSearchViewBindVars = {
                '@view': collectionName + "SearchView",
                documentId: commentId,
                searchText: '%' + searchText + '%',
            }

            commentPhraseSearchResult = await db.query(
                'for doc in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.commentRef, "text_en") ' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.comment, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.selectedReviewItem, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.selectedCodeReviewItems.name, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.checklist, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == doc.commentData.panelComments.author.name, "text_en")' +
                ' FILTER doc._key == @documentId  return doc',
                collectionName,
                commentSearchViewBindVars,

            );
            if (commentPhraseSearchResult.length > 0) {
                commentPhraseSearchResult = commentResponse;
            }
        }

        if (docType == "Test") {
            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.author, "text_en") ' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testType, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testGuidance, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testDescription, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testSetup, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.preConditions, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.postConditions, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.action, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.expected, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.fromDocName, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.links.name, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName, dataFileBindVars);
        }

        if (docType == "Status") {
            leafNodePhraseSearchResult = await db.query(
                'for node in @@view SEARCH ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.author, "text_en") ' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testType, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testGuidance, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testDescription, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.testSetup, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.preConditions, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.postConditions, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.action, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.expected, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.fromDocName, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.traceability.links.name, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.tester.name, "text_en") ' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.actual, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.editTest.testStatus, "text_en")' +
                ' OR ANALYZER(TOKENS(@searchText, "text_en") ALL == node.data.text.attachedMediaFromExecution.file.name, "text_en")' +
                ' FILTER node._key in @documents  return node',
                collectionName, dataFileBindVars);
        }
    }
    for (var index = 0; index < phraseSearchResult.length; index++) {
        const includesNode = nodeResponse.some((node: any) => node.meta.name === phraseSearchResult[index].meta.name);
        if (!includesNode) {
            nodeResponse.push(phraseSearchResult[index]);
        }
    }
    for (index = 0; index < nodeNameSearchResult.length; index++) {
        const includesNode = nodeResponse.some((node: any) => node.meta.name === nodeNameSearchResult[index].meta.name);
        if (!includesNode) {
            nodeResponse.push(nodeNameSearchResult[index]);
        }
    }
    for (index = 0; index < phraseSearchForNodeName.length; index++) {
        const includesNode = nodeResponse.some(
            (node: any) => node.meta.name === phraseSearchForNodeName[index].meta.name
        );
        if (!includesNode) {
            nodeResponse.push(phraseSearchForNodeName[index]);
        }
    }

    //For usecase
    for (index = 0; index < leafNodeSearchResult.length; index++) {
        const includesNode = nodeResponse.some(
            (node: any) => node.meta.name === leafNodeSearchResult[index].meta.name
        );
        if (!includesNode) {
            nodeResponse.push(leafNodeSearchResult[index]);
        }
    }
    for (index = 0; index < leafNodePhraseSearchResult.length; index++) {
        const includesNode = nodeResponse.some(
            (node: any) => node.meta.name === leafNodePhraseSearchResult[index].meta.name
        );
        if (!includesNode) {
            nodeResponse.push(leafNodePhraseSearchResult[index]);
        }
    }

    //for review
    for (index = 0; index < commentSearchResult.length; index++) {
        var includesNode = nodeResponse.some(
            (node: any) => node.meta.name === commentSearchResult[index].meta.name
        );
        if (!includesNode) {
            nodeResponse.push(commentSearchResult[0]);
        }
    }
    for (index = 0; index < commentPhraseSearchResult.length; index++) {
        var includesNode = nodeResponse.some(
            (node: any) => node.meta.name === commentPhraseSearchResult[index].meta.name
        );
        if (!includesNode) {
            nodeResponse.push(commentPhraseSearchResult[index]);
        }
    }

    res.send({ searchResults: nodeResponse });
};
//Ends here