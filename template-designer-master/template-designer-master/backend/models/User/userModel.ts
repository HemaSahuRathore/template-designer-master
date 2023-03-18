export interface UserModel {
	_key: string;
	name: string;
	email: string;
	password: string;
	image: string;
	createdAt: number;
	updatedAt?: number;
	signature?: string;
}
