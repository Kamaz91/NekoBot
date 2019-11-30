const moment = require('moment');

class UserRemoveUserAction {
    constructor(args) {
        this.member = args[0];

        try {
            if (!this.member.user.bot) {
                // Update user data
                knex('users').update({
                    leave_timestamp: moment().valueOf(),
                    left: 1
                })
                    .then()
                    .catch(console.error);

                knex('users_actions').insert({
                    user_id: this.member.id,
                    guild_id: this.member.guild.id,
                    type: "leave",
                    create_timestamp: moment().valueOf()
                })
                    .then()
                    .catch(console.error);
            }
        } catch (e) {
            console.log(e);
        }

    }
}

module.exports = UserRemoveUserAction;