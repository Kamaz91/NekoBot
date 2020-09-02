const moment = require('moment');

module.exports = (Connection) => {
    return {
        /**
         * Increment message count 
         * @param {string} user_id - User id.
         * @param {string} guild_id - Guild id.
         * @returns {Promise} Connection Promise object
         */
        incrementUserCurrentHour: (user_id, guild_id) => {
            var ymd = moment().format("YYYYMMDD");
            var hour = moment().format("H");

            return Connection('message_counter')
                .increment(hour, 1)
                .where({
                    user_id: user_id,
                    guild_id: guild_id,
                    ymd: ymd
                })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: true, error: false, request: rows };
                    } else {
                        return { status: false, error: false, request: "No rows updated" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: false, error: true, request: err }
                });
        },
        incrementUserStats(user_id, guild_id, words, chars, attachments) {
            return Connection('message_counter_user_stats')
                .where({
                    user_id: user_id,
                    guild_id: guild_id
                })
                .increment({
                    total_messages: 1,
                    total_words: words,
                    total_chars: chars,
                    total_attachments: attachments
                })
                .update({ last_message_timestamp: moment().valueOf() })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: true, error: false, request: rows };
                    } else {
                        return { status: false, error: false, request: "No rows updated" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: false, error: true, request: err }
                });
        },
        incrementGuildCurrentHour(guild_id) {
            let hour = moment().format("H");
            return Connection('message_counter_guilds')
                .where({
                    guild_id: guild_id,
                    ymd: moment().format("YYYYMMDD")
                })
                .increment(hour, 1)
                .then((rows) => {
                    if (rows > 0) {
                        return { status: true, error: false, request: rows };
                    } else {
                        return { status: false, error: false, request: "No rows updated" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: false, error: true, request: err }
                });
        }
    }
}