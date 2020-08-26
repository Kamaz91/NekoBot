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
                    if (rows.length > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant insert" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: false, error: true, request: err }
                });
        }
    }
}