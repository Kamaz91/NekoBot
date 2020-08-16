module.exports = (Connection) => {
    const TABLE = "api_tokens";
    return {
        discord: () => {
            return Connection(TABLE)
                .select('token')
                .where({
                    token_type: "discord"
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0].token };
                    } else {
                        return { status: 0, request: "Token not found" }
                    }
                })
                .catch(err => {
                    return { status: 0, request: err }
                });
        },
        wotApp: () => {
            return Connection(TABLE)
                .select('token')
                .where({
                    token_type: "WotAppId"
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "Token not found" }
                    }
                })
                .catch(err => {
                    return { status: 0, request: err }
                });
        }
    }
}