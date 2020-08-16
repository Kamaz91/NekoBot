const db = require('../../../../includes/database/index.js');
const { config } = require('../../../../includes/config/config.js');

class message_autoPurge {
    constructor(args) {
        var message = args[0];
        if (message.channel.type == "text" &&
            message.guild
        ) {
            var message_id = message.id;
            var guild_id = message.guild.id;
            var channel_id = message.channel.id;

            var guild = config.guilds.get(guild_id);

            if (guild.modules.autoPurge.channels.get(channel_id) && guild.modules.autoPurge.enabled)
                db.guildManagment.modules.autoPurge.insertMessage(guild_id, channel_id, message_id);
        }
    }
}

module.exports = message_autoPurge;