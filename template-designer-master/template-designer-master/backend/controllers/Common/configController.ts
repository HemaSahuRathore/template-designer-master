import { Request, Response } from 'express';
import { getCollectionMetaForDoc } from '../../utils/misc/docUtils';
import htmpl5StopWords from "../../config/html5StopWords.json";

export const getSocketConfigController = async (req: Request, res: Response) => {
    if (process.env.FRONTEND_BASE_URL)
        return res.send(process.env.FRONTEND_BASE_URL)
    else return res.send(null);
}

export const getHtml5StopWords = async (req: Request, res: Response) => {
    res.send(htmpl5StopWords)
}
export const getDoumentCode = async (req: Request, res: Response) => {
    const { docType } = req.params;
    const {
        docCode
    } = getCollectionMetaForDoc(docType);
    res.send(docCode)
}