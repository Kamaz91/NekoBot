import config from '@config/db.json' assert { type: 'json' };
import logger from '@includes/logger';
import { getConnection, connect, disconnect } from "./dbconnect";

connect(config).then((database) => {
    if (!database.status) {
        logger.error(database.message);
        logger.error("Database: ERROR while connecting to database");
    } else {
        logger.info("Database: " + database.message);
    }
});

export const Database = getConnection;
export const Disconnect = disconnect;