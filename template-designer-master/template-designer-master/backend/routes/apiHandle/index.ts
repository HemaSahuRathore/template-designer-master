import { HttpMethod } from '../../utils/enums/httpMethods';
import { ApiSign } from '../../utils/interfaces/apiSign';
import { documentHandle } from './Document/documentHandle';
import { projectHandle } from './Project/projectHandle';
import { userHandle } from './User/userHandle';
import { teamHandle } from './Team/teamHandle'
import { configHandle } from './Common/configHandle';
import { errorHandle } from './Common/errorHandle'
import { configDataHandle } from '../apiHandle/Common/configDataHandle';
import { db } from '../../utils/misc/db'
export const apiHandle: Array<ApiSign> = [

	/**
	 * @api {get} /test test
	 * @apiName Test
	 * @apiGroup Test
	 * @apiSuccess {Boolean} success test success.
	 */
	{
		url: '/test',
		middlewares: [],
		controller: async (req: any, res: any) => {
			let projectCollection = 'Projects'
			var projectBindVars = {
				"@collection": projectCollection,
			}
			const projects: Array<any> = await db.query(
				'FOR eachProject IN @@collection RETURN eachProject',
				projectCollection, projectBindVars);
			let project = projects && projects[0] ? projects[0] : []
			return res.send(project);
		},
		method: HttpMethod.Get,
	},


	...userHandle.map(
		({ url, controller, middlewares, method }): ApiSign => ({
			url: `/user${url}`,
			controller,
			middlewares,
			method,
		})
	),
	...projectHandle.map(
		({ url, controller, middlewares, method }): ApiSign => ({
			url: `/project${url}`,
			controller,
			middlewares,
			method,
		})
	),
	...documentHandle.map(
		({ url, controller, middlewares, method }): ApiSign => ({
			url: `/document${url}`,
			controller,
			middlewares,
			method,
		})
	),

	...errorHandle.map(
		({ url, controller, middlewares, method }): ApiSign => ({
			url: `/error-handle${url}`,
			controller,
			middlewares,
			method,
		})
	),
	...configDataHandle.map(
		({ url, controller, middlewares, method }): ApiSign => ({
			url: `/config-data${url}`,
			controller,
			middlewares,
			method,
		})
	),
	...teamHandle.map(
		({ url, controller, middlewares, method }): ApiSign => ({
			url: `/team${url}`,
			controller,
			middlewares,
			method,
		})
	),
	...configHandle.map(
		({ url, controller, middlewares, method }): ApiSign => ({
			url: `/config${url}`,
			controller,
			middlewares,
			method,
		})
	),
];

