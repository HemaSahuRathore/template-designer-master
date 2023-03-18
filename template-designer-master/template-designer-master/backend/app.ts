import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import { json, urlencoded } from 'body-parser';
import compression from 'compression';
import cookie from 'cookie-session';
import logger from 'morgan';
import cors from 'cors';
import { config } from 'dotenv';

const app = express();

const isDevMode = process.env.NODE_ENV?.trim() !== 'production';
if (isDevMode) {
	config();
}


app.use(express.static('public'));
app.use(cors());
app.use(helmet());
app.use(logger('dev'));

app.use(json({ limit: '50MB' }));
app.use(urlencoded({ extended: false }));
app.use(compression());
app.use(
	cookie({
		sameSite : 'strict',
		secure: !isDevMode,
		secret: '$2b$10$o.Oktj6gTeM8i82NCkJ.TuPwuyjwe6BzahqkQJCtuvSvkR9DqtySO',
		
	})
);

export { app };
