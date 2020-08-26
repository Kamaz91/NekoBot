const moment = require('moment');

module.exports = (Connection) => {
    return {
        changeName: (new_value, old_value, guild_id) => {
            return Connection('guilds')
                .insert({
                    guild_id: guild_id,
                    type: 'name',
                    new_value: new_value,
                    old_value: old_value,
                    create_timestamp: moment().valueOf()
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant add action" }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    return { status: false, error: true, request: error }
                });
        },
        changeOwner: (new_value, old_value, guild_id) => {
            return Connection('guilds')
                .insert({
                    guild_id: guild_id,
                    type: 'owner',
                    new_value: new_value,
                    old_value: old_value,
                    create_timestamp: moment().valueOf()
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant add action" }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    return { status: false, error: true, request: error }
                });
        },
        changeAvatar: (new_value, old_value, guild_id) => {
            return Connection('guilds')
                .insert({
                    guild_id: guild_id,
                    type: 'avatar',
                    new_value: new_value,
                    old_value: old_value,
                    create_timestamp: moment().valueOf()
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant add action" }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    return { status: false, error: true, request: error }
                });
        },
    }
}

