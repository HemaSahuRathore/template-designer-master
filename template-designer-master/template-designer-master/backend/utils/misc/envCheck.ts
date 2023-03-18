import { NotFoundError } from '../errors/notFoundError';

const {
	PORT: Port,
	JWT_KEY: JwtKey,
	ARANGODB_PORT: ArangoDbPort,
	ARANGODB_USERNAME: ArangoDbUsername,
	ARANGODB_PASSWORD: ArangoDbPassword,
	ARANGODB_DATABASE_NAME: ArangoDbDataBaseName,
	ARANGODB_URL: ArangoDbUrl,
	FRONTEND_BASE_URL: FrontendBaseUrl
} = process.env;

if (!Port) {
	throw new NotFoundError('PORT is Required');
}
if (!JwtKey) {
	throw new Error('JWT KEY is required');
}
if (!ArangoDbUrl) {
	throw new Error('ArangoDb url is required');
}
if (!ArangoDbPort) {
	throw new Error('ArangoDb Port is required');
}
if (!ArangoDbUsername) {
	throw new Error('ArangoDb username is required');
}
if (!ArangoDbDataBaseName) {
	throw new Error('ArangoDb DataBase Name is required');
}


export {
	Port, 
	JwtKey, 
	ArangoDbDataBaseName,
	ArangoDbPassword,
	ArangoDbUsername,
	ArangoDbPort,
	ArangoDbUrl,
	FrontendBaseUrl
};
