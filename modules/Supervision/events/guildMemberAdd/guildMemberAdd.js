const db = require('../../../../includes/database/index.js');

class guildMemberAdd {
    constructor(args) {
        var member = args[0];

        let data = {
            nickname: null,
            username: member.user.username,
            avatar_id: member.user.avatar,
            discriminator: member.user.discriminator
        }

        db.guilds.members.update.memberPersonalData(member.id, member.guild.id, data)
            .then((result) => {
                // if user doesnt exist in db insert
                if (!result.status) {
                    db.guilds.members.insert.single({
                        user_id: member.id,
                        guild_id: member.guild.id,
                        nickname: null,
                        username: member.user.username,
                        defaultAvatarURL: member.user.defaultAvatarURL,
                        avatar_id: member.user.avatar,
                        discriminator: member.user.discriminator,
                        is_bot: member.user.bot,
                        account_created_timestamp: member.user.createdTimestamp,
                        joined_timestamp: member.joinedTimestamp
                    });
                }
            });

        db.guilds.members.actions.insert.join(member.id, member.guild.id);
    }
}

module.exports = guildMemberAdd;