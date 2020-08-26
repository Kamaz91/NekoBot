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
                        return { status: true, error: false, request: rows[0] };
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