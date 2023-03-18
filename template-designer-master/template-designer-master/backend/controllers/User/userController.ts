import { Response, Request } from 'express';
import { UserModel } from '../../models/User/userModel';
import { crypt } from '../../utils/misc/crypt';
import { db } from '../../utils/misc/db';
import { BadRequestError } from '../../utils/errors/badRequestError';
import { jwtToken } from '../../utils/misc/token';
import dbCollectionsCodes from '../../config/dbCollectionsCodes.json';
const userCollection = dbCollectionsCodes.User.collectionName


export const userSigninController = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    var userBindVars = {
        "@collection": userCollection,
        "email": email
    }
    const users: Array<UserModel> = await db.query('FOR eachUser IN @@collection FILTER eachUser.email == @email RETURN eachUser', userCollection, userBindVars);
    if (users.length === 0) {
        throw new BadRequestError('Invalid credentials');
    }
    const user = users[0];
    const isPasswordMatch = await crypt.compare(user.password, password);
    if (!isPasswordMatch) {
        throw new BadRequestError('Invalid credentials');
    }
    const token = jwtToken.encode({
        email,
        _key: user._key,
        name: user.name,
    });
    req.session = { ...req.session, jwt: token };

    return res.send(true);
};

export const userAuthController = (req: Request, res: Response) => {
    try {
        res.send({ currentUser: req.currentUser || null });
    }
    catch (error) {
        if (error instanceof Error)
            res.send({
                success: false,
                message: "Some error occurred" + error.message,
            });
    }
};
export const userSignoutController = (req: Request, res: Response) => {
    try {
        req.session = null;
        return res.send(true);
    }
    catch (error) {
        if (error instanceof Error)
            res.send({
                success: false,
                message: "Some error occurred. " + error.message,
            });
    }
};




export const userFetchOneController = async (req: Request, res: Response) => {
    const { email } = req.params;
    const collectionName = 'Users';
    const userBindVars = {
        '@collection': collectionName,
        email: email,
    };
    const query = 'FOR eachUser IN @@collection FILTER eachUser.email == @email RETURN eachUser';
    const users = await db.query(query, collectionName, userBindVars,);
    if (users) {
        res.send(users[0]);
    } else res.send([]);
}

export const updateLockForUser = async (req: Request, res: Response) => {
    const { email } = req.params;
    const { appNames, value } = req.body;
    const collectionName = 'Users';
    const userBindVars = {
        '@collection': collectionName,
        email: email,
    };
    const query = 'FOR eachUser IN @@collection FILTER eachUser.email == @email RETURN eachUser';
    const users = await db.query(query, collectionName, userBindVars,);
    if (users && users[0]) {
        appNames.forEach((appName: any) => {
            if (users[0].lockEditViewAutomatically) {
                users[0].lockEditViewAutomatically[appName] = value;
            } else {
                users[0].lockEditViewAutomatically = {
                    [appName]: value
                }
            }
        })
        const response = await db.upsert(users[0]._key, users[0], collectionName)
        res.send(response)
    } else res.send({ success: false })
}

export const updateUserSetting = async (req: Request, res: Response) => {
    try {
        const { email } = req.params;
        const { taskCardHeader, taskCardInfo, backlogTaskCardInfo } = req.body;
        var userBindVars = {
            "@collection": userCollection,
            "email": email
        }
        const user = await db.query('FOR eachUser IN @@collection FILTER eachUser.email == @email RETURN eachUser', userCollection, userBindVars);

        const userData = user[0]

        userData.taskCardHeader = taskCardHeader;
        userData.taskCardInfo = taskCardInfo;
        userData.backlogTaskCardInfo = backlogTaskCardInfo;
        const response = await db.upsert(userData._key, userData, "Users");

        res.send(response)
    }
    catch (error) {
        if (error instanceof Error)
            res.send({
                success: false,
                message: "Some error occurred while getting a user. " + error.message,
            });
    }
};
