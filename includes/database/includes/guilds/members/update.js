const moment = require('moment');

module.exports = (Connection) => {
    return {
        memberPersonalData(user_id, guild_id, data) {
            return Connection('members')
                .where({
                    user_id: user_id,
                    guild_id: guild_id,
                })
                .update({
                    nickname: data.nickname,
                    username: data.username,
                    avatar_id: data.avatar_id,
                    discriminator: data.discriminator,
                    left: 0
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant update" }
                    }
                })
                .catch((error) => {
                    return { status: false, error: true, request: error }
                });
        },
        setLeft(user_id, guild_id) {
            return Connection('members')
                .where({
                    user_id: user_id,
                    guild_id: guild_id,
                })
                .update({
                    leave_timestamp: moment().valueOf(),
                    left: 1,
                    is_admin: 0,
                    avatar_id: null,
                    is_vip: 0
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant update" }
                    }
                })
                .catch((error) => {
                    return { status: false, error: true, request: error }
                });
        }
    }
}

