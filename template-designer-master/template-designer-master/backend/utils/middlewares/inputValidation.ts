class Validation {
    async checkUrl(inputUrl: any) {
        const url = inputUrl.replace(/ /g, "").toLowerCase()
        const data = {
            isValid: true,
            url: url
        }
        if (!(url.indexOf("http://") == 0)) {
            const srt = 'http://'
            if (url.indexOf("localhost") == 0 && url == "localhost") {
                data.url = srt.concat(url);
                return data;
            }
            else {
                const isUrlValid = url.match("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")
                if (isUrlValid == null) {
                    data.isValid = false
                    return data;
                }
                else {
                    data.url = srt.concat(url);
                    return data;
                }
            }
        }
        else {
            if (url.indexOf("localhost") >= 0 && url == "http://localhost") {
                return data;
            }
            else {
                const isUrlValid = url.match("^(http?://)?(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")
                if (isUrlValid == null) {
                    data.isValid = false
                    return data;
                }
                else
                    return data
            }
        }
    }

    async validatePort(port:any) {
        const isportValid = await port.match("^([1-9]{1})([0-9]{3,4})$")
        if (isportValid == null) {
            return false;
        }
        else
            return true
    }
}

export const validator = new Validation();
