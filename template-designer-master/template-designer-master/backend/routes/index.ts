import { Router } from 'express';
import { HttpMethod } from '../utils/enums/httpMethods';
import { apiHandle } from './apiHandle';

const router = Router();

apiHandle.map(({ url, method = HttpMethod.Use, middlewares, controller }) => {
	return router[method](url, middlewares, controller);
});

export { router as apiRouter };
