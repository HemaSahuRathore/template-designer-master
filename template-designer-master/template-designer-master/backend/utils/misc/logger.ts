const winston = require('winston');
function logger(fileName: any) {
    return winston.createLogger(
        {
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({ filename: `./logs/${fileName}`, level: 'error' }),
                new winston.transports.File({ filename: `./logs/${fileName}`, level: 'info' }),
                new winston.transports.File({ filename: './logs/allLogs.log' })
            ],
        }
    )
}
module.exports = logger
