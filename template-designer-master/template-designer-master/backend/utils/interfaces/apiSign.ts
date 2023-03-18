import { HttpMethod } from '../enums/httpMethods';

export interface ApiSign {
	url: string;
	method?: HttpMethod;
	controller: any;
	middlewares: Array<any>;
}
