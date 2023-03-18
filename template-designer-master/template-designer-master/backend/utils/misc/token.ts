import jwt from 'jsonwebtoken';
import { UserPayload } from '../interfaces/userPayload';
import { JwtKey } from './envCheck';

class Token {
	encode(data: UserPayload): string {
		const token = jwt.sign(data, JwtKey!);
		return token;
	}
	decode(token: string): UserPayload | string | undefined {
		const payload = jwt.verify(token, JwtKey!) as UserPayload | string;
		return payload;
	}
}

export const jwtToken = new Token();
