const moment = require('moment');

module.exports = (Connection) => {
    return {
        single: (token, type, siteToken, data) => {
            return Connection('users')
                .insert({
                    user_id: data.id,
                    username: data.username,
                    avatar: data.avatar,
                    discriminator: data.discriminator,
                    locale: data.locale,
                    discord_token: token,
                    dtoken_type: type,
                    site_token: siteToken,
                    token_expire: moment().add(1, 'd').valueOf(),
                    created_timestamp: moment().valueOf(),
                    modified_timestamp: moment().valueOf(),
                })
                .then()
                .catch(err => console.log(err));
        }
    }
}