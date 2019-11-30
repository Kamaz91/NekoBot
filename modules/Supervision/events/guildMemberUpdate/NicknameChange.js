const _ = require('lodash');

class NicknameChange {
    constructor(args) {
        this.oldMember = args[0];
        this.newMember = args[1];

        try {
            if (!this.newMember.user.bot) {
                var diff = {};
                this.oldMember.nickname !== this.newMember.nickname ? diff.nickname = this.newMember.nickname : false;
                if (!_.isEmpty(diff)) {
                    knex('users').update(diff).where({ user_id: this.newMember.id, guild_id: this.newMember.guild.id })
                        .then()
                        .catch(console.error);
                }
            }
        } catch (e) {
            console.log(e);
        }

    }
}

module.exports = NicknameChange;