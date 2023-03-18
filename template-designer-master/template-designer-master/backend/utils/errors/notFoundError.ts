import { CustomError } from './customError';

export class NotFoundError extends CustomError {
	statusCode = 404;

	constructor(public message: string) {
		super(message || 'Route not found');

		Object.setPrototypeOf(this, NotFoundError.prototype);
	}

	serializeErrors() {
		return [{ message: this.message || 'Not Found' }];
	}
}
