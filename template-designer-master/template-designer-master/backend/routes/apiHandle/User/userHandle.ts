import {
    userAuthController,
    userSigninController,
    userSignoutController,
    userFetchOneController, updateLockForUser, updateUserSetting
} from '../../../controllers/User/userController';
import { HttpMethod } from '../../../utils/enums/httpMethods';
import { ApiSign } from '../../../utils/interfaces/apiSign';
import { currentUser } from '../../../utils/middlewares/currentUser';
import { requireAuth } from '../../../utils/middlewares/requireAuth';


export const userHandle: Array<ApiSign> = [
    /**
     * @api {get} /user/test test
     * @apiName Test
     * @apiGroup Test
     *
     * @apiSuccess {Boolean} success test success.
     */
    {
        url: '/test',
        middlewares: [],
        controller: (req: any, res: any) => res.send(true),
        method: HttpMethod.Get,
    },
    {
        url: '/current',
        method: HttpMethod.Get,
        controller: userAuthController,
        middlewares: [currentUser],
    },
    {
        url: '/signin',
        method: HttpMethod.Post,
        controller: userSigninController,
        middlewares: [],
    },
    {
        url: '/signout',
        method: HttpMethod.Get,
        controller: userSignoutController,
        middlewares: [],
    },
    {
        url: '/fetch/one/:email',
        method: HttpMethod.Get,
        controller: userFetchOneController,
        middlewares: [currentUser],
    },
    {
        url: '/update/lock/:email',
        method: HttpMethod.Put,
        controller: updateLockForUser,
        middlewares: [],

    },
    {
        url: `/update-setting-user/:email`,
        method: HttpMethod.Put,
        controller: updateUserSetting,
        middlewares: [currentUser, requireAuth],
    },
];
