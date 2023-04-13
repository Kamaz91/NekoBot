import config from '@config/db.json' assert { type: 'json' };
import logger from '@includes/logger';
import { getConnection, connect } from "./dbconnect";

connect(config).then((database) => {
    if (!database.status) {
        logger.error(database.message);
        logger.error("ERROR while connecting to database");
    } else {
        logger.info(database.message);
    }
});

export const Database = getConnection;
