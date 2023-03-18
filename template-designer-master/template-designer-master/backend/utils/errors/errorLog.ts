export const createErrorLog = async (fileName: any, errorMsg: any) => {
    var logger = await require('../misc/logger')(`${fileName}.log`);
    await logger.error(`${errorMsg}`)
}
export const createInfoLog = async (fileName: any, infoMsg: any) => {
    var logger = await require('../misc/logger')(`${fileName}.log`);
    await logger.info(`${infoMsg}`)
}
export const geterrorLogFileName = async (fileName: any) => {
    fileName = fileName.replace(/\s/g, "") + "Errors"
    if (fileName != '' && fileName != undefined)
        return fileName
    else return "errors"
}
