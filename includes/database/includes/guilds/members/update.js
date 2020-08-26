const moment = require('moment');

module.exports = (Connection) => {
    return {
        userPersonalData(user_id, data) {
            return Connection('members')
                .where({
                    user_id: user_id
                })
                .update({
                    username: data.username,
                    avatar_id: data.avatar_id,
                    discriminator: data.discriminator
                })
                .then((rows) => {
                    if (rows > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant update" }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    return { status: false, error: true, request: error }
                });
        },
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
                    if (rows > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant update" }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    return { status: false, error: true, request: error }
                });
        },
        memberNickname(nickname, user_id, guild_id) {
            return Connection('members')
                .update({ nickname: nickname })
                .where({
                    user_id: user_id,
                    guild_id: guild_id
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant update" }
                    }
                })
                .catch((error) => {
                    console.error(error);
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
                    console.error(error);
                    return { status: false, error: true, request: error }
                });
        }
    }
}

