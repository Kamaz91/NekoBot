const CronJob = require('cron').CronJob;
const { config } = require('../../../includes/config/config.js');
const DiscordClient = require('../../../includes/Discord/connection.js');
const moment = require('moment');

const autoPurge = new CronJob('0 0 */1 * * *', function () {
    var guilds = DiscordClient.guilds.array();
    for (const guild of guilds) {
        let cGuild = config.guilds.get(guild.id);
        if (cGuild.modules.autoPurge.enabled) {
            var cChannels = cGuild.modules.autoPurge.channels.array();
            for (const cChannel of cChannels) {
                let channel = DiscordClient.guilds.get(cGuild.id).channels.get(cChannel.id);
                var messages = channel.messages.array();
                var time = moment().subtract(12, 'h').valueOf();
                var msgArray = [];

                for (const msg of messages) {
                    if (time > msg.createdTimestamp) {
                        msgArray.push(msg);
                    }
                }
                if (msgArray.length > 0) {
                    channel.bulkDelete(msgArray);
                }
            }
        }
    }
});
console.info("AutoPurge channels job started");
autoPurge.start();