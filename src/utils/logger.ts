import {createLogger, format, transports} from "winston";

enum LogFilePaths {
    error = "logs/error.log",
    all = "logs/all.log"
}

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: LogFilePaths.error, level: "error"}),
        new transports.File({filename: LogFilePaths.all})
    ]
})