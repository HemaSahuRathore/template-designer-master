import { Request, Response } from 'express';
import { ProjectModel } from '../../models/Project/projectModel';
import { db } from '../../utils/misc/db';
import { BadRequestError } from '../../utils/errors/badRequestError';
import dbCollectionsCodes from '../../config/dbCollectionsCodes.json';
const teamCollection = dbCollectionsCodes.Team.collectionName;
import { getCollectionMetaForDoc } from '../../utils/misc/docUtils';
import { RolesModel } from '../../models/Team/rolesModel';
import { statusChecker } from '../../utils/middlewares/statusChecker';
const projectCollection = dbCollectionsCodes.Project.collectionName
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
 * @description to fetch all projects of current logged in user from database
 */
export const projectFetchAllController = async (req: Request, res: Response) => {
    try {

        const { email: mailId } = req.currentUser;
        const docType = "Project"
        const {
            projectCollection,
        } = getCollectionMetaForDoc(docType);

        var projectBindVars = {
            "@collection": projectCollection,
        }
        const projects: Array<any> = await db.query(
            'FOR eachProject IN @@collection SORT eachProject.createdAt DESC RETURN eachProject',
            projectCollection, projectBindVars);
        if (projects.length == 0) {
            return res.send(projects);
        }

        let currentUserProject: Array<ProjectModel> = [];
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            if (project.teams && project.teams.length != 0 && project.teams[0] != undefined) {
                var teamBindVars = {
                    "@collection": teamCollection,
                    "teamId": project.teams[0]
                }
                const teams = await db.query('FOR team IN @@collection FILTER team._key == @teamId RETURN team',
                    teamCollection, teamBindVars);

                const team = teams[0];
                if (project.roles && project.roles.length != 0 && project.roles[0] != undefined) {
                    var roleBindVars = {
                        "@collection": teamCollection,
                        roleId: project.roles[0]
                    }

                    const roles = await db.query('FOR roles IN @@collection FILTER roles._key == @roleId RETURN roles',
                        teamCollection, roleBindVars);
                    const rolesInProject = roles[0];
                    if (roles && rolesInProject != undefined && team != undefined) {
                        for (let j = 0; j < team.teamMember.length; j++) {
                            let existingUser = team.teamMember[j];
                            if (existingUser.email == mailId) {
                                const role = existingUser.role;
                                const fullName = existingUser.fullName;
                                project.myRole = role;
                                project.fullName = fullName;
                                currentUserProject.push(project);
                                rolesInProject.newRole.forEach(function (checkRole: RolesModel) {
                                    if (checkRole.role == role) {
                                        project.myAccess = checkRole.applicationNames;
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
        if (currentUserProject.length == 0) {
            return res.send(currentUserProject);
        }
        return res.send(
            currentUserProject.map((project: any) => {
                project.id = project.refId;
                project.refId = project.refId;
                project.startDate = new Date(project.startDate);
                project.endDate = new Date(project.endDate);
                project.environment;
                project.tags;
                project.teams;
                project.myRole;
                project.release; project.projectPhase; project.discipline; project.roles;
                project.projectImage;
                project.projectGroup;
                const status = project.state;
                project.state = statusChecker(project.startDate, project.endDate, status);
                return project;
            })
        );
    } catch (error) {
        if (error instanceof Error)
            return res.send({
                data: [],
                success: false,
                message: 'Some error occurred while fetching Projects. ' + error.message,
            });
    }
};

/**
 * @description to fetch a project from database
 */
export const projectFetchOneController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const status = 'Active';
        const { email: mailId } = req.currentUser;
        const projectQueryData = {
            projectId: id
        }
        let project: any = await getProjectFromDb(projectQueryData);
        const currentState = statusChecker(project.startDate, project.endDate, status);
        project.state = currentState;
        var teamBindVars = {
            "@collection": teamCollection,
            "teamId": project.teams[0]
        }
        const teams = await db.query('FOR team IN @@collection FILTER team._key == @teamId RETURN team',
            teamCollection, teamBindVars);
        const team: any = teams[0]
        var roleBindVars = {
            "@collection": teamCollection,
            "roleId": project.roles[0]
        }
        const roles = await db.query('FOR roles IN @@collection FILTER roles._key == @roleId RETURN roles',
            teamCollection, roleBindVars);
        const rolesInProject: any = roles[0]
        for (let j = 0; j < team.teamMember.length; j++) {
            let existingUser = team.teamMember[j];
            if (existingUser.email == mailId) {
                const role = existingUser.role;
                project.myRole = role;
                project.fullName = existingUser.fullName;
                rolesInProject.newRole.forEach(function (checkRole: RolesModel) {
                    if (checkRole.role == role) {
                        project.myAccess = checkRole.applicationNames;
                    }
                });
            }
        }
        return res.send(project);
    } catch (error) {
        if (error instanceof Error)
            return res.send({
                success: false,
                message: 'Some error occurred while fetching a Project. ' + error.message,
            });
    }
};

/**
 * @description to update Project with new or changed value from user
 */
export const updateProjectAppSettingsController = async (req: Request, res: Response) => {
    const { projectId, type } = req.params;
    const { projectSettingsData } = req.body;
    const projBindVars = {
        projectId: projectId,
        '@collection': "Projects",
    };
    var query = `for value in @@collection FILTER value.refId == @projectId return value`;
    const projectObj = await db.query(query, "Projects", projBindVars);
    const project = projectObj[0];
    project.state = 'Active'
    project.appSettings[type] = projectSettingsData;
    await db.upsert(project._key, project, "Projects");
    return res.send({ success: true });
};