module.exports = (Connection) => {
    return {
        all: (guild_id) => {
            return Connection('guilds_channels')
                .select('*')
                .where({
                    guild_id: guild_id
                })
                .orderBy('id')
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows };
                    } else {
                        return { status: 0, request: "Channels not found" }
                    }
                })
                .catch(err => console.log);
        },
        singleDel: (guild_id, channel_id, showDeleted) => {
            var deleted = showDeleted ? 1 : 0;
            return Connection('guilds_channels')
                .select('*')
                .where({
                    guild_id: guild_id,
                    channel_id: channel_id,
                    is_deleted: deleted
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "Channel not found" }
                    }
                })
                .catch(err => console.log);
        },
        single: (guild_id, channel_id) => {
            return Connection('guilds_channels')
                .select('*')
                .where({
                    guild_id: guild_id,
                    channel_id: channel_id
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "Channel not found" }
                    }
                })
                .catch(err => console.log);
        },
        singleText: (guild_id, channel_id) => {
            return Connection('guilds_channels')
                .select('*')
                .where({
                    guild_id: guild_id,
                    channel_id: channel_id,
                    type: "text"
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "Channel not found" }
                    }
                })
                .catch(err => console.log);
        }
    }
}

