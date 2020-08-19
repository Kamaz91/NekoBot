const _ = require('lodash');

class NicknameChange {
    constructor(args) {
        var oldMember = args[0];
        var newMember = args[1];

        try {
            if (!newMember.user.bot) {
                var diff = {};
                oldMember.nickname !== newMember.nickname ? diff.nickname = newMember.nickname : false;
                if (!_.isEmpty(diff)) {
                    knex('members').update(diff).where({ user_id: newMember.id, guild_id: newMember.guild.id })
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