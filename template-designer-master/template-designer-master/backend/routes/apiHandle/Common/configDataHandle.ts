import {
    getDocTypesController
} from '../../../controllers/Common/configDataController';
import { HttpMethod } from '../../../utils/enums/httpMethods';
import { ApiSign } from '../../../utils/interfaces/apiSign';
import { currentUser } from '../../../utils/middlewares/currentUser';
import { requireAuth } from '../../../utils/middlewares/requireAuth';
export const configDataHandle: Array<ApiSign> = [
    {
        url: `/get-docTypes/:docType?`,
        method: HttpMethod.Get,
        controller: getDocTypesController,
        middlewares: [currentUser, requireAuth],
    },
];
