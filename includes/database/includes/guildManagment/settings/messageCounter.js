const moment = require('moment');

module.exports = (Connection) => {
    return {
        /**
         * Get messageCounter settings for guilds
         * @param {string} guildsArray - The ids of the guilds.
         * @returns {Promise} Connection Promise object
         */
        getBulk: (guildsArray) => {
            return Connection('message_counter_guild_settings')
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
        },
        /**
         * Get messageCounter channels for guilds
         * @param {string} guildsArray - The ids of the guilds.
         * @returns {Promise} Connection Promise object
         */
        getChannelsBulk: (guildsArray) => {
            return Connection('message_counter_channel_list')
                .select()
                .whereIn('guild_id', guildsArray)
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows };
                    } else {
                        return { status: 0, request: "channels not found" }
                    }
                })
                .catch(err => { return { status: 0, request: err } });
        }
    }
}