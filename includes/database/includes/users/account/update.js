const moment = require('moment');

module.exports = (Connection) => {
    return {
        tokens: (user_id, type, discord_token, site_token) => {
            return Connection('users')
                .update({
                    "discord_token": discord_token,
                    "dtoken_type": type,
                    "site_token": site_token,
                    "token_expire": moment().add(1, 'd').valueOf(),
                    "modified_timestamp": moment().valueOf()
                })
                .where({ "user_id": user_id })
                .then()
                .catch(err => console.log(err));
        },
        userData: (user_id, data) => {
            return Connection('users')
                .update({
                    "username": data.username,
                    "avatar": data.avatar,
                    "discriminator": data.discriminator,
                    "locale": data.locale,
                    "modified_timestamp": moment().valueOf()
                })
                .where({ "user_id": user_id })
                .then()
                .catch(err => console.log(err));
        },
    }
}