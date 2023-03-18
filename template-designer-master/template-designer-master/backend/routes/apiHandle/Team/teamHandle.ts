import {
	projectGetMyRoleController,
	 getUserRoleAccessController,
} from '../../../controllers/Team/teamController';

import { HttpMethod } from '../../../utils/enums/httpMethods';
import { ApiSign } from '../../../utils/interfaces/apiSign';
import { currentUser } from '../../../utils/middlewares/currentUser';
import { requireAuth } from '../../../utils/middlewares/requireAuth';

export const teamHandle: Array<ApiSign> = [
	{
		url: `/get-my-role/:id`,
		middlewares: [currentUser, requireAuth],
		controller: projectGetMyRoleController,
		method: HttpMethod.Get,
	},
	{
		url: `/get-user-access/:userRole/:applicationName/:projectId`,
		middlewares: [currentUser, requireAuth],
		controller: getUserRoleAccessController,
		method: HttpMethod.Get,
	},
	
];




