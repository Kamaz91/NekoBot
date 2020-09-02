const moment = require('moment');

module.exports = (Connection) => {
    return {
        join(user_id, guild_id) {
            return Connection('members_actions')
                .insert({
                    user_id: user_id,
                    guild_id: guild_id,
                    type: 'join',
                    create_timestamp: moment().valueOf()
                })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: true, error: false, request: rows };
                    } else {
                        return { status: false, error: false, request: "Cant add action" }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    return { status: false, error: true, request: error }
                });
        },
        leave(user_id, guild_id) {
            return Connection('members_actions')
                .insert({
                    user_id: user_id,
                    guild_id: guild_id,
                    type: 'leave',
                    create_timestamp: moment().valueOf()
                })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: true, error: false, request: rows };
                    } else {
                        return { status: false, error: false, request: "Cant add action" }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    return { status: false, error: true, request: error }
                });
        },
        nicknameChange(new_value, old_value, user_id, guild_id) {
            return Connection('members_actions')
                .insert({
                    user_id: user_id,
                    guild_id: guild_id,
                    type: 'nickname',
                    new_value: new_value,
                    old_value: old_value,
                    create_timestamp: moment().valueOf()
                })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: true, error: false, request: rows };
                    } else {
                        return { status: false, error: false, request: "Cant add action" }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    return { status: false, error: true, request: error }
                });
        }
    }
}