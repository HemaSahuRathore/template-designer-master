import { projectFetchAllController,projectFetchOneController, updateProjectAppSettingsController } from '../../../controllers/Project/projectController';
import { HttpMethod } from '../../../utils/enums/httpMethods';
import { ApiSign } from '../../../utils/interfaces/apiSign';
import { currentUser } from '../../../utils/middlewares/currentUser';
import { requireAuth } from '../../../utils/middlewares/requireAuth';

export const projectHandle: Array<ApiSign> = [
	{
		url: '/fetch/all',
		middlewares: [currentUser, requireAuth],
		controller: projectFetchAllController,
		method: HttpMethod.Get,
	},
	{
		url: `/fetch/one/:id`,
		middlewares: [currentUser, requireAuth],
		controller: projectFetchOneController,
		method: HttpMethod.Get,
	},
	{
		url: '/update/:projectId/:type?',
		middlewares: [currentUser, requireAuth],
		controller: updateProjectAppSettingsController,
		method: HttpMethod.Put,
	},
	
];
