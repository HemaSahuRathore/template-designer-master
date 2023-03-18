import { DocumentModel } from '../Document/documentModel';
import { TeamModel } from '../Team/teamModel';

export interface ProjectModel {
	name: string;
	_key: string;
	refId: string;
	description: string;
	teams: Array<TeamModel | string>;
	templates: Array<string>;
	documents: Array<DocumentModel | string>;
	startDate: number;
	endDate: number;
	createdAt: number;
	updatedAt: number;
	suspensionDate?: number;
	type: string;
	environment: string;
	tags: Array<string>;
	state: '';
	[key: string]: any;
	appSettings: object;
	journal: object;
}
