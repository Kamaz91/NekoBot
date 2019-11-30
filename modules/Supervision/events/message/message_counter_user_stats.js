const moment = require('moment');

class message_counter_user_stats {
    constructor(args) {
        this.message = args[0];
        try {
            if (this.message.channel.type == "text" &&
                !this.message.author.bot &&
                this.message.guild
            ) {
                var userid = this.message.author.id;
                var guildid = this.message.guild.id;

                var words = this.message.content.split(' ').length;
                var chars = this.message.content.length;
                var attachments = 0;

                // attachments counter 
                if (this.message.attachments.array().length > 0) {
                    attachments = this.message.attachments.array().length;
                }

                knex('message_counter_user_stats')
                    .where({
                        user_id: userid,
                        guild_id: guildid
                    })
                    .increment({
                        total_messages: 1,
                        total_words: words,
                        total_chars: chars,
                        total_attachments: attachments
                    })
                    .update({ last_message_timestamp: moment().valueOf() })
                    .then(i => {
                        // if 0 db cant find row to update so create one
                        if (i === 0) {
                            let timestamp = moment().valueOf();
                            knex('message_counter_user_stats').insert({
                                user_id: userid,
                                guild_id: guildid,
                                random_quote_last_update: timestamp,
                                created_timestamp: timestamp,
                                last_message_timestamp: timestamp,
                                total_messages: 1,
                                total_words: words,
                                total_chars: chars,
                                total_attachments: attachments
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

module.exports = message_counter_user_stats;