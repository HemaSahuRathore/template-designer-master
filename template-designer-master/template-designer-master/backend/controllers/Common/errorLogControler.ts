import { Request, Response } from 'express';
import { createErrorLog } from '../../utils/errors/errorLog'
let fileName: any = 'errors'
export const errorLogController = async (req: Request, res: Response) => {
    const { docType } = req.params;
    const { errorMsg } = req.body
      fileName = docType.replace(/\s/g, "") + "Errors"
    await createErrorLog(fileName, `FE: ${errorMsg}`)
    res.send(true);
};

