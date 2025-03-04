import logger from '../../services/logger/index.js';
import { getConnection, connect, disconnect } from "./dbconnect.js";

connect().then((database) => {
    if (!database.status) {
        logger.error(database.message);
        logger.error("Database: ERROR while connecting to database");
    } else {
        logger.info("Database: " + database.message);
    }
});

export const Database = getConnection;
export const Disconnect = disconnect;