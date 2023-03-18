import { Request, Response } from 'express';
import { DocumentModel } from '../../models/Document/documentModel';
import { DocJournalModel } from '../../models/Journal/docJournalModel';
import { db } from '../../utils/misc/db';
import { BadRequestError } from '../../utils/errors/badRequestError';
import { idGenerator } from '../../utils/misc/idGenerator';
import { getCollectionMetaForDoc } from '../../utils/misc/docUtils';
import license from "../../../config/licensee.json"

export const addCoverpageController = async (req: Request, res: Response) => {
    const { projectId, docType } = req.params;
    const { name, _key: userId, email } = req.currentUser;
    const { docName, selectedForDocType, otherFormData } = req.body;
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
        const { _key, refId } = await idGenerator(journalCode);

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
        tree: '',
        projectRef: projectId,
        properties: {
            text: otherFormData.text,
            name: docName,
            company: license.companyName,
            createdAt: new Date(),
            creator: name,
            description: 'Cover Page',
            editors: [userId],
            keywords: [],
            modifiedAt: new Date(),
            subject: 'Cover Page',
            tags: [],
            authorsList: [{
                name: name,
                _key: userId,
                email: email
            }],
            docType: docType,
            use: selectedForDocType,
            category: '',
            pageSize: otherFormData.pageSize,
            selectedMode: otherFormData.selectedMode,
            margin: otherFormData.margin,
            margins: otherFormData.margins,
            height: otherFormData.height,
            width: otherFormData.width,
            unit: otherFormData.unit,
        },
        use: '',
        version: 0,
        isVersioned: false,
        hasChanged: true
    };
    const newSectionObject: any = {
        _key: newDocument._key,
        projectRef: project.refId,
        docName: docName,
        docType: docType,
        author: name,
        lastEdit: new Date(),
    };
    journalDoc[0][docListSectionName].push(newSectionObject);
    await db.insert(newDocument, collectionName);
    await db.upsert(project._key, project, projectCollection);
    await db.upsert(journalDoc[0]._key, journalDoc[0], journalCollection);
    return res.send(newDocument.refId);
};

export const addCoverpageFromExistingController = async (req: Request, res: Response) => {
    const { projectId, docType, testType } = req.params;
    const { name, _key: userId, email: email } = req.currentUser;
    const { docName, selectedForDocType, existingDocId, otherFormData } = req.body;

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
                throw new BadRequestError('This document name has already been taken');

            }
        });
    }
    var docBindVars = {
        '@collection': collectionName,
        documentId: existingDocId,
    };
    const response: any = await db.query(
        'for value in @@collection FILTER value.refId == @documentId return value',
        collectionName,
        docBindVars
    );
    if (!response) {
        throw new BadRequestError('Invalid Document Request');
    }
    const document: DocumentModel = response[0];
    const { _key: docId, refId } = idGenerator(docContainerCode);

    const newDocument: any = document
    newDocument._key = docId
    newDocument.id = docId
    newDocument.refId = refId
    newDocument.tree = document.tree
    newDocument.dataFiles = []
    newDocument.properties.name = docName
    newDocument.properties.createdAt = new Date()
    newDocument.properties.creator = name
    newDocument.properties.editors = [userId]
    newDocument.properties.docType = docType
    newDocument.properties.use = selectedForDocType
    newDocument.properties.modifiedAt = new Date()
    newDocument.properties.pageSize = otherFormData.pageSize
    newDocument.properties.selectedMode = otherFormData.selectedMode
    newDocument.properties.margin = otherFormData.margin
    newDocument.properties.margins = otherFormData.margins
    newDocument.properties.height = otherFormData.height
    newDocument.properties.width = otherFormData.width
    newDocument.properties.unit = otherFormData.unit
    newDocument.properties.text = otherFormData.text
    newDocument.properties.authorsList = [{
        name: name,
        _key: userId,
        email: email
    }],
        newDocument.isVersioned = false
    newDocument.hasChanged = true
    newDocument.version = 0
    newDocument.projectId = projectId
    delete newDocument._id;
    delete newDocument._rev;
    const newSectionObject: any = {
        _key: newDocument._key,
        projectRef: project.refId,
        docName: docName,
        docType: docType,
        author: name,
        lastEdit: new Date(),
    };
    journalDoc[0][docListSectionName].push(newSectionObject);
    await db.insert(newDocument, collectionName);
    await db.upsert(project._key, project, projectCollection);
    await db.upsert(journalDoc[0]._key, journalDoc[0], journalCollection);
    return res.send(newDocument.refId);
}