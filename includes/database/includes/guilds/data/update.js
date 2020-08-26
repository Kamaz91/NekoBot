const moment = require('moment');

module.exports = (Connection) => {
    return {
        /**
         * Update Guild name
         * @param {string} name - Update Guild name.
         * @param {string} guild_id - Guild id.
         * @returns {Promise} Connection Promise object
         */
        name: (name, guild_id) => {
            return Connection('guilds')
                .update({ name: name })
                .where({ guild_id: guild_id })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: 1, error: false, request: rows[0] };
                    } else {
                        return { status: 0, error: false, request: "Cant Update" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: 0, error: true, request: err }
                });
        },
        /**
         * Update Guild avatar
         * @param {string} avatar_url - Update Guild avatar.
         * @param {string} guild_id - Guild id.
         * @returns {Promise} Connection Promise object
         */
        avatar: (avatar_url, guild_id) => {
            return Connection('guilds')
                .update({ iconURL: avatar_url })
                .where({ guild_id: guild_id })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: 1, error: false, request: rows[0] };
                    } else {
                        return { status: 0, error: false, request: "Cant Update" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: 0, error: true, request: err }
                });
        },
        /**
         * Update Guild avatar
         * @param {string} owner_id - Update Guild owner id.
         * @param {string} guild_id - Guild id.
         * @returns {Promise} Connection Promise object
         */
        newOwner: (owner_id, guild_id) => {
            return Connection('guilds')
                .update({ owner_Id: owner_id })
                .where({ guild_id: guild_id })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: 1, error: false, request: rows[0] };
                    } else {
                        return { status: 0, error: false, request: "Cant Update" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: 0, error: true, request: err }
                });
        },
        /**
         * Update Guild region
         * @param {string} region - Update Guild region.
         * @param {string} guild_id - Guild id.
         * @returns {Promise} Connection Promise object
         */
        region: (region, guild_id) => {
            return Connection('guilds')
                .update({ region: region })
                .where({ guild_id: guild_id })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: 1, error: false, request: rows[0] };
                    } else {
                        return { status: 0, error: false, request: "Cant Update" }
                    }
                })
                .catch(err => {
                    console.log(err);
                    return { status: 0, error: true, request: err }
                });
        },
    }
}