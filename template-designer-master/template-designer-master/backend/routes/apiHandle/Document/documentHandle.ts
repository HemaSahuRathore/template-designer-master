/* eslint-disable prettier/prettier */
import {

	documentFetchAllController,
	documentFetchController,
	documentUpdateController,
	getSearchResultsFromWholeAppController,
	getSearchResultsFromProjectController,getSearchResultsController
} from '../../../controllers/Document/documentController';


import {
	addCoverpageController, addCoverpageFromExistingController
} from '../../../controllers/Coverpage/coverpageController';
import { HttpMethod } from '../../../utils/enums/httpMethods';
import { ApiSign } from '../../../utils/interfaces/apiSign';
import { currentUser } from '../../../utils/middlewares/currentUser';
import { requireAuth } from '../../../utils/middlewares/requireAuth';

export const documentHandle: Array<ApiSign> = [

	{
		url: '/fetch/all/:projectId/:docType/:testType?/:subDocType?',
		method: HttpMethod.Get,
		controller: documentFetchAllController,
		middlewares: [currentUser, requireAuth],
	},
	// coverpage route starts
	{
		url: '/add/coverpage/:projectId/:docType',
		method: HttpMethod.Post,
		controller: addCoverpageController,
		middlewares: [currentUser, requireAuth],
	},
	{
		url: '/add/clone-coverpage/coverpage/:projectId/:docType',
		method: HttpMethod.Post,
		controller: addCoverpageFromExistingController,
		middlewares: [currentUser, requireAuth],
	},

	//coverpage route ends
	{
		url: '/fetch/:projectId/:documentId/:docType/:testType?/:subDocType?',
		method: HttpMethod.Get,
		controller: documentFetchController,
		middlewares: [currentUser, requireAuth],
	},

	{
		url: '/update/:projectId/:documentId/:docType/:testType?/:subDocType?',
		method: HttpMethod.Put,
		controller: documentUpdateController,
		middlewares: [currentUser, requireAuth],
	},

	// Search routes
	{
		url:
			'/get-search-results/:projectId/:documentId/:numberOfItems?/:pageNumber?/:searchText?/:wordMatch?/:docType',
		method: HttpMethod.Get,
		controller: getSearchResultsController,
		middlewares: [currentUser, requireAuth],
	},
	{
		url: '/get-search-results-from-app/:projectId/:numberOfItems?/:pageNumber?/:searchText?/:wordMatch?/:docType',
		method: HttpMethod.Get,
		controller: getSearchResultsFromWholeAppController,
		middlewares: [currentUser, requireAuth],
	},
	{
		url:
			'/get-search-results-from-project/:projectId/:numberOfItems?/:pageNumber?/:searchText?/:wordMatch?/:docType/:appNames',
		method: HttpMethod.Get,
		controller: getSearchResultsFromProjectController,
		middlewares: [currentUser, requireAuth],
	},
	//Ends here
];
