import { app } from './app';
import express from 'express';
import { apiRouter } from './routes';
import { db } from './utils/misc/db';
import { ArangoDbDataBaseName, ArangoDbPassword, ArangoDbUrl, ArangoDbUsername, Port, ArangoDbPort } from './utils/misc/envCheck';
import { NotFoundError } from './utils/errors/notFoundError';
import { errorHandler } from './utils/middlewares/errorHandler';
const path = require('path');
export const __basedir = __dirname
const start = async () => {
	try {
		db.connect(ArangoDbUrl!, ArangoDbUsername!, ArangoDbPassword!, ArangoDbDataBaseName!, ArangoDbPort!);

		app.use('/api/se', apiRouter);
		app.use('*', () => {
			throw new NotFoundError('No route');
		});
		app.use(express.static(path.join(__dirname, "se")))
		app.use(errorHandler);
		app.listen(Port, () => console.log(`Running on Port: ${Port}`));
	} catch (error) {
		if (error instanceof Error)
			console.log("\x1b[31m", error.message);
		process.exit();
	}
};

start();
