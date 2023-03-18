import { compare, genSalt, hash } from 'bcrypt';

class Crypt {
	async toHash(data: string) {
		const salt = await genSalt(10);
		return hash(data, salt);
	}

	compare(encryptedData: string, comparisonData: string) {
		return compare(comparisonData, encryptedData);
	}
}

export const crypt = new Crypt();
