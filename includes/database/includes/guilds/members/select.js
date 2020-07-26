const moment = require('moment');

module.exports = (Connection) => {
    return {
        guildMember: (guild_id, user_id) => {
            return Connection('members')
                .select('*')
                .where({
                    guild_id: guild_id,
                    user_id: user_id
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "Member not found" }
                    }
                })
                .catch(err => console.log);
        },
        currentGuildMember: (guild_id, user_id) => {
            return Connection('members')
                .select('*')
                .where({
                    guild_id: guild_id,
                    user_id: user_id,
                    left: 0
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "Member not found" }
                    }
                })
                .catch(err => console.log);
        }
    }
}

