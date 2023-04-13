import fs from 'fs';
import path from 'path';
import winston from 'winston';
import moment from 'moment';

// Define log levels and colors
const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
    }
};
const locale = 'pl-PL';

let Date = moment();
Date.locale(locale);

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define log file paths with date in name

const formattedDate = Date.format('DD-MM-YYYY');
const errorLogPath = path.join(logDir, `${formattedDate}_error.log`);
const allLogPath = path.join(logDir, `${formattedDate}_all.log`);

// Create logger instance with options
const logger = winston.createLogger({
    levels: logLevels.levels,
    format: winston.format.combine(
        winston.format.printf(({ level, message }) => {
            let timestamp = moment().format('YYYY-MM-DD hh:mm:ss.SSS').trim();
            return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        }),
    ),
    transports: [
        new winston.transports.Console({ handleExceptions: true }),
        new winston.transports.File({ filename: errorLogPath, level: 'error' }),
        new winston.transports.File({ filename: allLogPath }),
    ],
});

export default logger;
