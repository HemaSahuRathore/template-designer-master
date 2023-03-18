import { CustomError } from './customError';

export class DatabaseConnectionError extends CustomError {
	statusCode = 500;
	reason = 'Error connecting to database';

	constructor(msg: any) {
		super(msg);
		this.reason = msg
		console.log(msg)
	
		Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
		process.exit()

	}
	serializeErrors() {
		return [{ message: this.reason }];
	}
}
