const db = require('../../../../includes/database/index.js');
const { config } = require('../../../../includes/config/config.js');

class message_counter {
    constructor(args) {
        var message = args[0];

        if (message.channel.type == "text" && message.guild) {

            var user_id = message.author.id;
            var guild_id = message.guild.id;
            var channel_id = message.channel.id;
            // TODO Listing kanałów MC blacklist/whitelist

            var guild = config.guilds.get(guild_id);
            if (!guild.modules.messageCounter.enabled) {
                return;
            }

            if (
                (
                    message.author.bot && !(message.author.bot && guild.modules.messageCounter.bots == true)
                ) ||
                (
                    (
                        guild.modules.messageCounter.listing.type == "whitelist" &&
                        !guild.modules.messageCounter.listing.channels.get(channel_id)
                    ) ||
                    (
                        guild.modules.messageCounter.listing.type == "blacklist" &&
                        guild.modules.messageCounter.listing.channels.get(channel_id)
                    )
                )
            ) {
                return;
            }

            var words = message.content.split(' ').length;
            var chars = message.content.length;
            var attachments = 0;

            // attachments counter 
            if (message.attachments.array().length > 0) {
                attachments = message.attachments.array().length;
            }

            // User Hour
            db.messageCounter.update.incrementUserCurrentHour(user_id, guild_id)
                .then((result) => {
                    if (!result.status) {
                        db.messageCounter.insert.UserDay(user_id, guild_id);
                    }
                });
            // User Stats
            db.messageCounter.update.incrementUserStats(user_id, guild_id, words, chars, attachments)
                .then((result) => {
                    if (!result.status) {
                        db.messageCounter.insert.UserStats(user_id, guild_id, words, chars, attachments);
                    }
                });
            // Guild Hour
            db.messageCounter.update.incrementGuildCurrentHour(guild_id)
                .then((result) => {
                    if (!result.status) {
                        db.messageCounter.insert.GuildDay(guild_id);
                    }
                });
        }
    }
}

module.exports = message_counter;