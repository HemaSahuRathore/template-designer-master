import { Request, Response } from 'express';
import { ProjectModel } from '../../models/Project/projectModel';
import { db } from '../../utils/misc/db';
import { BadRequestError } from '../../utils/errors/badRequestError';
import dbCollectionsCodes from '../../config/dbCollectionsCodes.json';
import { getCollectionMetaForDoc } from '../../utils/misc/docUtils';
const teamCollection = dbCollectionsCodes.Team.collectionName

export const getProjectFromDb = async (data: any) => {
    const {
        projectCollection,
    } = getCollectionMetaForDoc(dbCollectionsCodes.Project.docType);

    const projectId = data.projectId
    var projBindVars = {
        '@collection': projectCollection,
        projectId: projectId,
    };

    var query = `for value in @@collection FILTER value.refId == @projectId return value`;
    const projectObj = await db.query(query, projectCollection, projBindVars);
    if (projectObj && projectObj.length === 0) {
        throw new BadRequestError('Invalid Project Request');
    }
    const project: ProjectModel = projectObj[0];
    return project
}

/**
 * @description to check role for requested project
 */
export const projectGetMyRoleController = async (req: Request, res: Response) => {
    try {
        const { _key: userId, email: mailId, name: fullName } = req.currentUser;
        const { } = req.currentUser;
        const { id } = req.params;

        const projectQueryData = {
            projectId: id
        }
        const project: ProjectModel = await getProjectFromDb(projectQueryData);

        var teamBindVars = {
            "@collection": teamCollection,
            "teamId": project.teams[0]
        }
        const teams = await db.query('FOR team IN @@collection FILTER team._key == @teamId RETURN team',
            teamCollection, teamBindVars);

        const team = teams[0];

        let role: string = '';
        for (let i = 0; i < team.teamMember.length; i++) {
            let existingUser = team.teamMember[i];
            if (existingUser.email == mailId) {
                role = existingUser.role;
                break;
            }
        }
        return res.send(role);
    } catch (error) {
        if (error instanceof Error)
            return res.send({
                success: false,
                message: 'Some error occurred while fetching user role. ' + error.message,
            });
    }
};

export const getUserRoleAccessController = async (req: Request, res: Response) => {
    try {
        const { projectId, userRole, applicationName } = req.params;
        let isUserRoleHasReadWriteAccess = false
        let isUserHasApplicationAccess = false
        const projectQueryData = {
            projectId: projectId
        }
        const project: ProjectModel = await getProjectFromDb(projectQueryData);

        var roleBindVars = {
            "@collection": teamCollection,
            "roleId": project.roles[0]
        }
        const roles = await db.query('FOR roles IN @@collection FILTER roles._key == @roleId RETURN roles',
            teamCollection, roleBindVars);

        const role = roles[0]
        role.newRole.forEach((eachRole: any) => {
            if (eachRole.role == userRole) {
                eachRole.applicationNames.forEach((eachApplication: any) => {
                    if (eachApplication.applicationName == applicationName) {
                        isUserHasApplicationAccess = true
                        if (eachApplication.roleAccess.includes("Read") && eachApplication.roleAccess.includes("Write")) {
                            isUserRoleHasReadWriteAccess = true
                        }
                        else isUserRoleHasReadWriteAccess = false
                        if (eachApplication.roleAccess.indexOf("Read") == -1)
                            isUserHasApplicationAccess = false

                    }
                })

            }
        });
        const data = {
            isUserRoleHasReadWriteAccess: isUserRoleHasReadWriteAccess,
            isUserHasApplicationAccess: isUserHasApplicationAccess
        }


        return res.send(data)
    } catch (error) {
        if (error instanceof Error)
            return res.send({
                success: false,
                message: 'Some error occurred while fetching user role. ' + error.message,
            });
    }
};




