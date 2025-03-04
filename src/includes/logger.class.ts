import fs from 'fs';
import path from 'path';
import winston from 'winston';
import moment from 'moment';

// Define log levels
const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
    },
};

const date = moment().local(true);

function main() {
    let logLevel = 2;

    if (!process.env.LOGS_DIR || process.env.LOGS_DIR.length === 0) {
        console.log("No logging directory specified");
        return;
    }

    if (process.env.LOGS_LEVEL) {
        const parsedLevel = Math.abs(Number(process.env.LOGS_LEVEL));
        logLevel = parsedLevel > 3 ? 3 : parsedLevel;
    } else {
        console.log("No logging level specified, using default (info)");
    }
    console.log("Log level", logLevel);

    // Create logs directory if it doesn't exist
    const logDir = process.env.LOGS_DIR;
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Define log file paths with date in name
    const formattedDate = date.format('DD-MM-YYYY');
    const allLogPath = path.join(logDir, `${formattedDate}_all.log`);

    // Create logger instance
    const logger = winston.createLogger({
        levels: logLevels.levels,
        level: Object.keys(logLevels.levels)[logLevel], // Setting correct log level
        format: winston.format.combine(
            winston.format.printf(({ level, message }) => {
                const timestamp = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
            })
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: allLogPath, level: Object.keys(logLevels.levels)[logLevel] }),
        ],
    });

    return logger;
}

export default main;
