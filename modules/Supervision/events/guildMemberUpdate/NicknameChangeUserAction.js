const moment = require('moment');
const _ = require('lodash');

class NicknameChangeUserAction {
    constructor(args) {
        this.oldMember = args[0];
        this.newMember = args[1];

        try {
            if (!this.newMember.user.bot) {
                var diff = {};
                this.oldMember.nickname !== this.newMember.nickname ? diff.nickname = this.newMember.nickname : false;
                if (!_.isEmpty(diff)) {

                    knex('members_actions').insert({
                        user_id: this.oldMember.id,
                        guild_id: this.oldMember.guild.id,
                        type: 'nickname',
                        new_value: this.newMember.nickname,
                        old_value: this.oldMember.nickname,
                        create_timestamp: moment().valueOf()
                    })
                        .then()
                        .catch(console.error);
                }
            }
        } catch (e) {
            console.log(e);
        }

    }
}

module.exports = NicknameChangeUserAction;