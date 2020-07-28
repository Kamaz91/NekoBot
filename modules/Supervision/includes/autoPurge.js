const CronJob = require('cron').CronJob;
const { config } = require('../../../includes/config/config.js');
const db = require('../../../includes/database/index.js');
const DiscordClient = require('../../../includes/Discord/connection.js');
const moment = require('moment');

const autoPurge = new CronJob('0 0 */1 * * *', async function () {
    var msgArray = new Object;
    var guildsKeys = DiscordClient.guilds.keyArray();
    var autoPurge = db.connection('auto_purge_messages');
    for (const guild_id of guildsKeys) {
        let cGuild = config.guilds.get(guild_id);
        if (cGuild.modules.autoPurge.enabled) {
            msgArray[guild_id] = { channels: new Object };
            for (const channel of cGuild.modules.autoPurge.channels.array()) {
                msgArray[guild_id].channels[channel.id] = new Array;
                autoPurge.orWhere(function () {
                    this.andWhere({ guild_id: guild_id });
                    this.andWhere({ channel_id: channel.id });
                    this.andWhere("create_timestamp", "<", moment().subtract(channel.time, 'h').valueOf());
                });
            }
        }
    }
    var messages = await autoPurge.then((rows) => { return rows });
    for (const msg of messages) {
        msgArray[msg.guild_id].channels[msg.channel_id].push(msg.message_id);
    }
    for (const [guild_id, guild] of Object.entries(msgArray)) {
        for (const [channel_id, messages] of Object.entries(guild.channels)) {
            let channel = DiscordClient.guilds.get(guild_id).channels.get(channel_id);
            channel.bulkDelete(messages);
            db.guildManagment.modules.autoPurge.deleteMessagesArray(messages);
        }
    }
});
console.info("AutoPurge channels job started");
autoPurge.start();