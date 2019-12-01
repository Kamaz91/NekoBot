const moment = require('moment');

class joinUserAction {
    constructor(args) {
        this.member = args[0];

        try {
            knex('members_actions').insert({
                user_id: this.member.id,
                guild_id: this.member.guild.id,
                type: 'join',
                create_timestamp: moment().valueOf()
            })
                .then()
                .catch(console.error);
        } catch (e) {
            console.log(e);
        }

    }
}

module.exports = joinUserAction;