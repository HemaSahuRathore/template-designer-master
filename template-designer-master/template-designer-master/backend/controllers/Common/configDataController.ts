import { Request, Response } from 'express';
import { getApplicationsDocTypes } from '../../utils/middlewares/configDataHelper';
import docTypeFilters from "../../../config/docTypeFilters.json"
export const getDocTypesController = async (req: Request, res: Response) => {
    try {
        const { docType } = req.params
        let docTypes: any = await getApplicationsDocTypes()
        if (docType == 'Cover Page')
            docTypes = docTypes.filter((a: any) => docTypeFilters.coverPageDocTypes.indexOf(a) > 0);

        else if (docType == 'Traceability Report')
            docTypes = docTypes.filter((a: any) => docTypeFilters.tracebilityReportDocTypes.indexOf(a) > 0);
        if (docTypes != undefined && docTypes.length != 0)
            return res.send(docTypes)
        else return res.send([])
    } catch (error) {
        if (error instanceof Error)
            return res.send({
                success: false,
                message: 'Some error occurred while getting doc Types. ' + error.message,
            });
    }
};