const moment = require('moment');

class message_counter {
    constructor(args) {
        this.message = args[0];
        try {
            if (this.message.channel.type == "text" &&
                !this.message.author.bot &&
                this.message.guild
            ) {
                var userid = this.message.author.id;
                var guildid = this.message.guild.id;
                var ymd = moment().format("YYYYMMDD");
                var hour = moment().format("H");

                knex('message_counter')
                    .where({ user_id: userid, guild_id: guildid, ymd: ymd })
                    .increment(hour, 1)
                    .then(i => {
                        // if 0 db cant find row to update so create one
                        if (i === 0) {
                            knex('message_counter').insert({
                                user_id: userid,
                                guild_id: guildid,
                                ymd: ymd,
                                [hour]: 1
                            })
                                .then()
                                .catch(console.error);
                        }
                    })
                    .catch(console.error);
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = message_counter;