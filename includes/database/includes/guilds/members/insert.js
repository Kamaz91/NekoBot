module.exports = (Connection) => {
    return {
        single(data) {
            return Connection('members')
                .insert({
                    user_id: data.user_id,
                    guild_id: data.guild_id,
                    nickname: data.nickname,
                    username: data.username,
                    avatar: data.defaultAvatarURL,
                    avatar_id: data.avatar,
                    discriminator: data.discriminator,
                    is_bot: data.is_bot,
                    account_created_timestamp: data.createdTimestamp,
                    joined_timestamp: data.joinedTimestamp

                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: "Cant add member" }
                    }
                })
                .catch((error) => {
                    return { status: false, error: true, request: error }
                });
        }
    }
}

