import {
    getDoumentCode, getHtml5StopWords
} from '../../../controllers/Common/configController';
import { HttpMethod } from '../../../utils/enums/httpMethods';
import { ApiSign } from '../../../utils/interfaces/apiSign';
import { currentUser } from '../../../utils/middlewares/currentUser';
import { requireAuth } from '../../../utils/middlewares/requireAuth';

export const configHandle: Array<ApiSign> = [
    {
        url: `/get/html5StopWords`,
        method: HttpMethod.Get,
        controller: getHtml5StopWords,
        middlewares: [currentUser, requireAuth]
    },
    {
        url: '/get/docCode/:docType/:testType?/:subDocType?',
        method: HttpMethod.Get,
        controller: getDoumentCode,
        middlewares: [currentUser, requireAuth]
    },

];
