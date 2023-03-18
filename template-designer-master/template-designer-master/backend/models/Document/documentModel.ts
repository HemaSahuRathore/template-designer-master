import { UserModel } from '../User/userModel';

export interface DocumentModel {
	_key: string;
	id: string;
	refId: string;
	projectRef: string;
	tree: string;
	properties: {
		name: string;
		creator: string;
		tags: Array<string>;
		description: string;
		editors: Array<UserModel | string>;
		templateName: string;
		subject: string;
		company: string;
		keywords: Array<string>;
		createdAt: Date;
		modifiedAt: Date;
		docType: any;
		authorsList: Array<object>,
	};
	use: string;
	dataFiles: Array<string>;
	version: number;
	isVersioned: boolean,
	hasChanged: boolean
}
