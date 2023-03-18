import { DatabaseConnectionError } from '../errors/databaseConnectionError';
const { Database, aql } = require("arangojs");
let dbConnect: any = null
import { validator } from '../../utils/middlewares/inputValidation';
import { createErrorLog } from '../../utils/errors/errorLog';
const stopWords = [
    'risk',
    'the',
    'a',
    'and',
    'or',
    'of',
    'with',
    'at',
    'an',
    'this',
    'that',
    'these',
    'those',
    'i',
    'my',
    'your',
    'his',
    'her',
    'their',
    'them',
    'from',
    'into',
    'during',
    'do',
    'did',
    'including',
    'until',
    'against',
    'among',
    'throughout',
    'despite',
    'towards',
    'upon',
    'concerning',
    'to',
    'in',
    'for',
    'on',
    'by',
    'about',
    'like',
    'through',
    'over',
    'before',
    'between',
    'after',
    'since',
    'without',
    'under',
    'within',
    'along',
    'following',
    'across',
    'behind',
    'beyond',
    'between',
    'plus',
    'except',
    'but',
    'up',
    'out',
    'around',
    'down',
    'off',
    'above',
    'near',
];

class DataBase {
    async connect(url: string, username: string, password: string, databaseName: string, port: string) {
        try {
            if (!(await validator.validatePort(port))) {
                const errorMsg = 'ARANGODB_PORT is not correct, plese check in .env file and restart server!'
                console.error('\x1b[31m', errorMsg);
                process.exit();
            }
            const resObj: any = await validator.checkUrl(url);
            if (!resObj.isValid) {
                const errorMsg = 'ARANGODB_URL is not correct, plese check in .env file and restart server!'
                console.log('\x1b[31m', errorMsg);
                process.exit();
            } else if (resObj.isValid) {
                dbConnect = await new Database({
                    url: `${resObj.url}:${port}`,
                    databaseName: databaseName,
                });
                await dbConnect.useBasicAuth(username, password);
                if (await dbConnect.exists()) {
                    console.log('Connected to ArangoDB');
                } else {
                    const errorMsg = 'Error connecting to db, please check Db name or db service is running and restart server!'
                    console.log('\x1b[31m', errorMsg);
                    throw new DatabaseConnectionError(
                        errorMsg);
                }
            }
        } catch (e: any) {
            const errorMsg = 'Error connecting to db, please check if db service is running and username/password is correct and restart server!'
            console.error('\x1b[31m');
            throw new DatabaseConnectionError(errorMsg
            );
        }
    }
    createCollection(collectionName: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let collectionObject = await dbConnect.collection(collectionName);
            const data = {
                success: true,
                message: 'Collection created',
            };
            if (!(await collectionObject.exists())) {
                await this.createSeachView(collectionName);
                return collectionObject.create().then(
                    () => {
                        resolve(data);
                    },
                    (err: any) => {
                        const errorMsg = 'Failed to create collection: ' + err.message + collectionName
                        createErrorLog('DbErrors', `BE: ${errorMsg}`)
                        console.error(errorMsg);
                        data.success = false;
                        data.message = err.message;
                        resolve(data);
                    }
                );
            } else {
                await this.createSeachView(collectionName);
                resolve(data);
            }
        });
    }
    async createSeachView(collectionName: any) {
        var analyzers = await dbConnect.analyzers();
        var isAnalyzerExist = analyzers.some((analyzer: any) => analyzer._name === '_system::text_en_stopwords');
        if (!isAnalyzerExist) {
            await this.englishAnalyzer();
        }
        isAnalyzerExist = analyzers.some(
            (analyzer: any) => analyzer._name === '_system::risk_norm_accent_lower_analyzer'
        );
        if (!isAnalyzerExist) {
            await this.normalizedAnalyzer();
        }
        const views = await dbConnect.views();
        const viewName = collectionName + "SearchView";
        const isViewExist = views.some((view: any) => view._name === viewName);
        if (!isViewExist) {
            dbConnect
                .createView(viewName, {
                    links: {
                        [collectionName]: {
                            analyzers: ['text_en', 'identity', 'text_en_stopwords', 'risk_norm_accent_lower_analyzer'],
                            fields: {},
                            includeAllFields: true,
                            storeValues: 'none',
                            trackListPositions: false,
                        },
                    },
                })
                .then((data: { isArangoView: any; name: any }) => {
                    if (data.isArangoView) {
                        console.log(data.name);
                    }
                })
                .catch((err: { code: any; message: any }) => {
                    console.log(err.code, err.message);
                });
        }
    }

    async insert(data: any, collectionName: string): Promise<any> {
        let collectionObject = await dbConnect.collection(collectionName);
        const collectionResponse = await this.createCollection(collectionName);
        if (collectionResponse.success) {
            return new Promise((resolve, reject) => {
                collectionObject.save(data).then(
                    (meta: any) => {
                        const data = {
                            success: true,
                            message: meta.refId,
                        };
                        resolve(data);
                    },
                    (err: any) => {
                        const data = {
                            success: false,
                            message: err.message,
                        };
                        resolve(data);
                    }
                );
            });
        }
        return new Promise((resolve, reject) => {
            resolve(collectionResponse);
        });
    }

    async get(collectionName: string): Promise<any> {
        let collectionObject = await dbConnect.collection(collectionName);
        const collectionResponse = await this.createCollection(collectionName);
        if (collectionResponse.success) {
            return new Promise((resolve, reject) => {
                collectionObject.all().then(
                    async (response: any) => {
                        const data = await response.all();
                        const responseData = {
                            success: true,
                            data: data,
                        };
                        resolve(responseData);
                    },
                    (err: any) => {
                        const data = {
                            success: false,
                            message: err.message,
                        };
                        resolve(data);
                    }
                );
            });
        }
        return new Promise((resolve, reject) => {
            resolve(collectionResponse);
        });
    }

    async update(key: string, data: any, collectionName: string): Promise<any> {
        let collectionObject = await dbConnect.collection(collectionName);
        const collectionResponse = await this.createCollection(collectionName);
        if (collectionResponse.success) {
            return new Promise((resolve, reject) => {
                collectionObject.update(key, data).then(
                    (meta: any) => {
                        const data = {
                            success: true,
                            message: meta.refId,
                        };
                        resolve(data);
                    },
                    (err: any) => {
                        const data = {
                            success: false,
                            message: err.message,
                        };
                        resolve(data);
                    }
                );
            });
        }
        return new Promise((resolve, reject) => {
            resolve(collectionResponse);
        });
    }

    async getOne(key: string, collectionName: string): Promise<any> {
        let collectionObject = await dbConnect.collection(collectionName);
        const collectionResponse = await this.createCollection(collectionName);
        if (collectionResponse.success) {
            return new Promise((resolve, reject) => {
                collectionObject.document(key).then(
                    (response: any) => {
                        const responseData = {
                            success: true,
                            data: response,
                        };
                        resolve(responseData);
                    },
                    (err: any) => {
                        const data = {
                            success: false,
                            message: err.message,
                        };
                        resolve(data);
                    }
                );
            });
        }
        return new Promise((resolve, reject) => {
            resolve(collectionResponse);
        });
    }

    async delete(key: string, collectionName: string): Promise<any> {
        let collectionObject = await dbConnect.collection(collectionName);
        const collectionResponse = await this.createCollection(collectionName);
        if (collectionResponse.success) {
            return new Promise((resolve, reject) => {
                collectionObject.remove(key).then(
                    (response: any) => {
                        const responseData = {
                            success: true,
                            data: response,
                        };
                        resolve(responseData);
                    },
                    (err: any) => {
                        const data = {
                            success: false,
                            message: err.message,
                        };
                        resolve(data);
                    }
                );
            });
        }
        return new Promise((resolve, reject) => {
            resolve(collectionResponse);
        });
    }

    async upsert(key: string, data: any, collectionName: string): Promise<any> {
        let collectionObject = await dbConnect.collection(collectionName);
        const collectionResponse = await this.createCollection(collectionName);
        if (collectionResponse.success) {
            return new Promise(async (resolve, reject) => {
                const result = await this.getOne(key, collectionName);

                if (result.success) {
                    collectionObject.replace(key, data).then(
                        (meta: any) => {
                            const data = {
                                success: true,
                                data: meta,
                            };
                            resolve(data);
                        },
                        (err: any) => {
                            const data = {
                                success: false,
                                message: err.message,
                            };
                            resolve(data);
                        }
                    );
                } else {
                    data._key = key;
                    const result = await this.insert(data, collectionName);
                    resolve(result);
                }
            });
        }
        return new Promise((resolve, reject) => {
            resolve(collectionResponse);
        });
    }
    async query(query: string, collectionName: any, bindVars: any): Promise<Array<any>> {
        const collectionResponse = await this.createCollection(collectionName);

        if (collectionResponse.success) {
            return new Promise((resolve, reject) => {
                dbConnect
                    .query({
                        query: query,
                        bindVars: bindVars,
                    })
                    .then((cursor: any) => cursor.all((doc: any) => { }))
                    .then(
                        (doc: any) => {
                            resolve(doc);
                        },
                        (err: any) => {
                            const errorMsg = 'Query Failed:' + err.message
                            createErrorLog('DbErrors', `BE: ${errorMsg}`)
                            console.error(errorMsg)
                        }
                    );
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(collectionResponse);
            });
        }
    }


    async englishAnalyzer() {
        await dbConnect
            .createAnalyzer('text_en_stopwords', {
                type: 'text',
                properties: {
                    locale: 'en.utf-8',
                    stemming: true,
                    stopWords: stopWords,
                },
            })
            .then((data: { isArangoAnalyzer: any; _name: any }) => {
                if (data.isArangoAnalyzer) {
                    console.log(data._name);
                }
            })
            .catch((err: { message: any }) => {
                console.log(err.message);
            });
    }
    async normalizedAnalyzer() {
        await dbConnect
            .createAnalyzer('risk_norm_accent_lower_analyzer', {
                type: 'norm',
                properties: {
                    accent: false,
                    case: 'lower',
                    locale: 'en.utf-8',
                },
            })
            .then((data: { isArangoAnalyzer: any; _name: any }) => {
                if (data.isArangoAnalyzer) {
                    console.log(data._name);
                }
            })
            .catch((err: { message: any }) => {
                console.log(err.message);
            });
    }
}

export const db = new DataBase();
