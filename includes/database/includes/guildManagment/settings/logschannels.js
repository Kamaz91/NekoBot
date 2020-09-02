const moment = require('moment');

module.exports = (Connection) => {
    return {
        /**
         * Get LogsChannels settings for guilds
         * @param {string} guildsArray - The ids of the guilds.
         * @returns {Promise} Connection Promise object
         */
        getBulk: (guildsArray) => {
            return Connection('log_channels')
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
        //* VOICE CHANNELS LOGS
        /**
         * Add new voice channel logs
         * @param {string} guild_id - The id of the guild.
         * @param {string} channel_id - The id of the channel.
         * @returns {Promise} Connection Promise object
         */
        addVoiceLog: (guild_id, channel_id) => {
            return Connection('log_channels')
                .insert({
                    guild_id: guild_id,
                    channel_id: channel_id,
                    type: 'voice',
                    created_timestamp: moment().valueOf(),
                    edited_timestamp: 0,
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: { id: rows[0] } };
                    } else {
                        return { status: 0, request: "Cant add channel" }
                    }
                })
                .catch(err => { return { status: 0, request: err } });
        },
        /**
         * Change voice channel logs for guild
         * @param {string} guild_id - The id of the guild.
         * @param {string} channel_id - The id of the channel.
         * @returns {Promise} Connection Promise object
         */
        UpdateVoiceLog: (guild_id, channel_id) => {
            return Connection('log_channels')
                .update({
                    channel_id: channel_id,
                    edited_timestamp: moment().valueOf()
                })
                .where({
                    guild_id: guild_id,
                    type: 'voice',
                })
                .then((rows) => {
                    if (rows) {
                        return { status: 1, request: "Channel updated" };
                    } else {
                        return { status: 0, request: "Cant update channel" }
                    }
                })
                .catch(err => { return { status: 0, request: 'db error while updating' } });
        },
        /**
         * Get voice channel logs for guild
         * @param {string} guild_id - The id of the guild.
         * @returns {Promise} Connection Promise object
         */
        getVoiceLog: (guild_id) => {
            return Connection('log_channels')
                .select(["channel_id", "created_timestamp", "edited_timestamp"])
                .where({
                    guild_id: guild_id,
                    type: 'voice',
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "Channel not found" }
                    }
                })
                .catch(err => { return { status: 0, request: err } });
        },
        /**
         * Add new acivity logs
         * @param {string} guild_id - The id of the guild.
         * @param {string} channel_id - The id of the channel.
         * @returns {Promise} Connection Promise object
         */

        //* ACTIVITY LOGS
        addActivityLog: (guild_id, channel_id) => {
            return Connection('log_channels')
                .insert({
                    guild_id: guild_id,
                    channel_id: channel_id,
                    type: 'activity',
                    created_timestamp: moment().valueOf(),
                    edited_timestamp: 0,
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: { id: rows[0] } };
                    } else {
                        return { status: 0, request: "Cant add channel" }
                    }
                })
                .catch(err => { return { status: 0, request: err } });
        },
        /**
         * Change acivity logs for guild
         * @param {string} guild_id - The id of the guild.
         * @param {string} channel_id - The id of the channel.
         * @returns {Promise} Connection Promise object
         */
        UpdateActivityLog: (guild_id, channel_id) => {
            return Connection('log_channels')
                .update({
                    channel_id: channel_id,
                    edited_timestamp: moment().valueOf()
                })
                .where({
                    guild_id: guild_id,
                    type: 'activity',
                })
                .then((rows) => {
                    if (rows) {
                        return { status: 1, request: "Channel updated" };
                    } else {
                        return { status: 0, request: "Cant update channel" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: 0, request: 'db error while updating' }
                });
        },
        /**
         * Get acivity logs for guild
         * @param {string} guild_id - The id of the guild.
         * @returns {Promise} Connection Promise object
         */
        getActivityLog: (guild_id) => {
            return Connection('log_channels')
                .select(["channel_id", "created_timestamp", "edited_timestamp"])
                .where({
                    guild_id: guild_id,
                    type: 'activity',
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "Channel not found" }
                    }
                })
                .catch(err => { return { status: 0, request: err } });
        }
    }
}