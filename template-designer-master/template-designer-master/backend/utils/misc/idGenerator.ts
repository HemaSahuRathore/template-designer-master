import { nanoid } from 'nanoid'
import idLength from "../../../config/nanoIdConfig.json"

// nanoId should not exceed maximum id length limit
// refId should not exceeds maximum refId length limit
if (idLength.nanoReferenceIdLength > idLength.nanoIdLength) {

    console.error("\x1b[31m", 'refId length should be less than nano id length.');
    process.exit()
}

if (idLength.nanoIdLength > idLength.nanoIdMaxLength) {
    console.error("\x1b[31m", 'nano id length exceeding maximum limit.');
    process.exit()
}

if (idLength.nanoReferenceIdLength > idLength.nanoReferenceIdMaxLength) {
    console.error("\x1b[31m", 'refId length exceeding maximum limit.');
    process.exit()
}
export const idGenerator = (modelName: string) => {
    const nanoId = nanoid(idLength.nanoIdLength);
    const _key = `${modelName}-${nanoId}`;
    const refId = 'P_' + nanoId.substring(0, idLength.nanoReferenceIdLength)
    return { _key, refId }
};