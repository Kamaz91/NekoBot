const CronJob = require('cron').CronJob;
const { MessageEmbed } = require('discord.js'); // for embed builder
const discordClient = require('../../includes/Discord/connection.js');
const moment = require('moment');
const db = require('../../includes/database/index.js');

class memento {
    constructor(DiscordClient, TriggerManager, ModuleLoader) {
        var that = this;
        this.mementoLoop = new CronJob('0 */1 * * * *', function () { that.process() });

        this.mementoLoop.start();

        TriggerManager.RegisterTrigger({
            moduleName: "memento",
            desc: "Remind me, ``!rm DD/MM/YYYY,HH:mm text``",
            content: (message, trigger) => this.trigger(message, trigger),
            key: "rm",
            prefix: "!" //optional. if not defined using default prefix
        });
    }
    async process() {
        var data = await db.users.memento.fetchActiveData();
        if (data.status) {
            for (let el of data.elements) {
                var reminderString = `https://discordapp.com/channels/${el.guild_id}/${el.channel_id}/${el.message_id}`;
                var user = discordClient.users.resolve(el.user_id);

                const embed = new MessageEmbed()
                    .setTimestamp()
                    .setDescription('Reminder')
                    .addField('Link to the message', reminderString)
                    .setColor([37, 154, 72]) //#259A48
                    .addField('Text:', el.additional_text);

                user.send(embed);

                db.users.memento.updateReminded(el.id);
            }
        }
    }

    async trigger(message, trigger) {
        if (!message.channel.type == 'text') {
            message.member.send('Not available here');
            return;
        }

        var time = trigger.arguments[0];
        var momtime = moment(time, 'DD/MM/YYYY,HH:mm', true);

        // Delete first argument 
        trigger.arguments.splice(0, 1);

        if (!momtime.isValid()) {
            message.reply('Invalid format, ``DD/MM/YYYY,HH:mm text``');
            return;
        }

        if (momtime.valueOf() < moment().valueOf()) {
            message.reply('Cannot be in the past');
            return;
        }
        var text = trigger.arguments.join(" ");

        var query = await db.users.memento.addReminder({
            user_id: message.author.id,
            guild_id: message.guild.id,
            channel_id: message.channel.id,
            message_id: message.id,
            additional_text: text,
            fulfillment_timestamp: momtime.valueOf()
        });
        if (!query.status) {
            return;
        }
        const embed = new MessageEmbed()
            .setTimestamp()
            .setAuthor(message.member.displayName + "#" + message.member.user.discriminator, message.member.user.displayAvatarURL)
            .setDescription('The reminder has been set!')
            .addField('Time', momtime.format('DD/MM/YYYY HH:mm:ss'))
            .setFooter('Message id: ' + message.id)
            .setColor([37, 154, 72]) //#259A48
            .addField('Text:', text);

        message.channel.send(embed);
    }
}
module.exports = memento;