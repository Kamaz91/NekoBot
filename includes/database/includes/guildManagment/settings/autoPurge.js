const moment = require('moment');

module.exports = (Connection) => {
    return {
        /**
         * Get autoPurge settings for guilds
         * @param {string} guildsArray - The ids of the guilds.
         * @returns {Promise} Connection Promise object
         */
        getBulk: (guildsArray) => {
            return Connection('auto_purge_settings')
                .select()
                .whereIn('guild_id', guildsArray)
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows };
                    } else {
                        return { status: 0, request: "Settings not found" }
                    }
                })
                .catch(err => { return { status: 0, request: err } });
        }
    }
}