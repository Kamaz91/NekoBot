const db = require('../../../../includes/database/index.js');

class UserRemoveUserAction {
    constructor(args) {
        var member = args[0];

        db.guilds.members.update.setLeft(member.id, member.guild.id);
        db.guilds.members.actions.insert.leave(member.id, member.guild.id);
    }
}

module.exports = UserRemoveUserAction;