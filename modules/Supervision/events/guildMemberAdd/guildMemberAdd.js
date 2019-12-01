class guildMemberAdd {
    constructor(args) {
        this.member = args[0];

        if (!this.member.user.bot) {
            // if user exist in db update
            knex('members')
                .where({
                    user_id: this.member.id,
                    guild_id: this.member.guild.id,
                })
                .update({
                    nickname: this.member.nickname,
                    username: this.member.user.username,
                    avatar: this.member.user.displayAvatarURL,
                    discriminator: this.member.user.discriminator,
                    left: 0
                })
                .then(i => {
                    // if 0 db cant find row to update so create one
                    if (i === 0) {
                        knex('members')
                            .insert({
                                user_id: this.member.id,
                                guild_id: this.member.guild.id,
                                nickname: this.member.nickname,
                                username: this.member.user.username,
                                avatar: this.member.user.displayAvatarURL,
                                discriminator: this.member.user.discriminator,
                                is_bot: this.member.user.bot,
                                account_created_timestamp: this.member.user.createdTimestamp,
                                joined_timestamp: this.member.joinedTimestamp

                            })
                            .then(console.log('User joined ', this.member.displayName, " to ", this.member.guild.name))
                            .catch(console.error);
                    }
                });
        }
    }
}

module.exports = guildMemberAdd;