import { ProjectUser } from '../../utils/interfaces/projectUser';

export interface TeamModel {
	users: Array<ProjectUser>;
}

export interface NewTeamModel {
    _key: any,
    teamMember: [{
        email: string,
        role: string,
        fullName: string,
		status:string,
        createdAt: number,
        isAdmin : boolean
    }]
}

