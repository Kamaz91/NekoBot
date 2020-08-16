const moment = require('moment');

module.exports = (Connection) => {
    return {
        /**
         * Get notifier settings for guilds
         * @param {string} guildsArray - The ids of the guilds.
         * @returns {Promise} Connection Promise object
         */
        getBulkByid: (guildsArray) => {
            return Connection('supervision_notifier')
                .select()
                .whereIn('guild_id', guildsArray)
                .andWhere('enabled', 1)
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows };
                    } else {
                        return { status: 0, request: "Settings not found" }
                    }
                })
                .catch(err => { return { status: 0, request: err } });
        },

    }
}