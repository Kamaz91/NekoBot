const db = require("../../../../includes/database/index.js");

class NicknameChange {
    constructor(args) {
        var oldMember = args[0];
        var newMember = args[1];

        if (oldMember.nickname !== newMember.nickname) {
            db.guilds.members.update.memberNickname(newMember.nickname, newMember.id, newMember.guild.id);
            db.guilds.members.actions.insert.nicknameChange(newMember.nickname, oldMember.nickname, oldMember.id, oldMember.guild.id);
        }
    }
}

module.exports = NicknameChange;