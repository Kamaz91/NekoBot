const moment = require('moment');

module.exports = (Connection) => {
    return {
        /**
         * Create a user's message counter of the day, at the current hour the user will be 1
         * @param {string} user_id - User id.
         * @param {string} guild_id - Guild id.
         * @returns {Promise} Connection Promise object
         */
        UserDay(user_id, guild_id) {
            var ymd = moment().format("YYYYMMDD");
            var hour = moment().format("H");

            return Connection('message_counter')
                .insert({
                    user_id: user_id,
                    guild_id: guild_id,
                    ymd: ymd,
                    [hour]: 1
                })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: true, error: false, request: rows };
                    } else {
                        return { status: false, error: false, request: "Cant insert" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: false, error: true, request: err }
                });
        },
        UserStats(user_id, guild_id, words, chars, attachments) {
            let timestamp = moment().valueOf();
            return Connection('message_counter_user_stats')
                .insert({
                    user_id: user_id,
                    guild_id: guild_id,
                    random_quote_last_update: timestamp,
                    created_timestamp: timestamp,
                    last_message_timestamp: timestamp,
                    total_messages: 1,
                    total_words: words,
                    total_chars: chars,
                    total_attachments: attachments
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
        GuildDay(guild_id) {
            let hour = moment().format("H");
            return Connection('message_counter_guilds')
                .insert({
                    guild_id: guild_id,
                    ymd: moment().format("YYYYMMDD"),
                    [hour]: 1
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
        }
    }
}