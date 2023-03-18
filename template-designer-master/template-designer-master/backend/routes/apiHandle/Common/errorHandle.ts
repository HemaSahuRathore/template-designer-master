import {
    errorLogController
} from '../../../controllers/Common/errorLogControler';
import { HttpMethod } from '../../../utils/enums/httpMethods';
import { ApiSign } from '../../../utils/interfaces/apiSign';
import { currentUser } from '../../../utils/middlewares/currentUser';
import { requireAuth } from '../../../utils/middlewares/requireAuth';

export const errorHandle: Array<ApiSign> = [
    {
        url: `/log-error/:docType`,
        method: HttpMethod.Put,
        controller: errorLogController,
        middlewares: [currentUser, requireAuth],
    },
];
