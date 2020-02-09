const CronJob = require('cron').CronJob;
const Discord = require('discord.js'); // for embed builder
const moment = require('moment');

class memento {
    constructor(DiscordClient, TriggerManager, ModuleLoader) {
        this.DC = DiscordClient;
        var that = this;
        this.mementoLoop = new CronJob('0 */1 * * * *', function () { that.process(that) });

        this.mementoLoop.start();

        TriggerManager.RegisterTrigger({
            moduleName: "memento",
            desc: "Remind me, !rm DD/MM/YYYY,HH:mm",
            content: (message, trigger) => this.trigger(message, trigger),
            key: "rm",
            prefix: "!" //optional. if not defined using default prefix
        });
    }
    async process(that) {
        var data = await that.fetchData();
        if (data.status) {
            for (let el of data.elements) {
                var reminderString = `https://discordapp.com/channels/${el.guild_id}/${el.channel_id}/${el.message_id}`;
                that.DC.fetchUser(el.user_id).then((user) => { user.send(reminderString) });
                that.updateReminded(el.id);
                console.log('Reminder send');
            }
        }
    }

    trigger(message, trigger) {
        if (!message.channel.type == 'text') {
            message.reply('Not avaible here');
            return;
        }

        var time = trigger.arguments[0];
        var momtime = moment(time, 'DD/MM/YYYY,HH:mm', true);

        if (!momtime.isValid()) {
            message.reply('Not valid format, DD/MM/YYYY,HH:mm');
            return;
        }

        if (momtime.valueOf() < moment().valueOf()) {
            message.reply('Cannot be past');
            return;
        }
        this.addReminder({
            user_id: message.author.id,
            guild_id: message.guild.id,
            channel_id: message.channel.id,
            message_id: message.id,
            additional_text: 'null',
            fulfillment_timestamp: momtime.valueOf()
        });
        const embed = new Discord.RichEmbed().setTimestamp(new Date());
        embed.setAuthor(message.member.displayName + "#" + message.member.user.discriminator, message.member.user.displayAvatarURL);
        embed.setDescription('Reminder set');
        embed.addField('Time', momtime.format('DD/MM/YYYY HH:mm:ss'));
        embed.setFooter('Message id: ' + message.id)
        embed.setColor([37, 154, 72]);

        message.channel.send(embed);
    }

    addReminder(data) {
        return knex('memento_data').insert({
            user_id: data.user_id,
            guild_id: data.guild_id,
            channel_id: data.channel_id,
            message_id: data.message_id,
            additional_text: data.additional_text,
            created_timestamp: moment().valueOf(),
            fulfillment_timestamp: data.fulfillment_timestamp
        })
            .then()
            .catch(console.error);
    }
    updateReminded(id) {
        return knex('memento_data').update({
            is_active: 1
        }).where({
            id: id
        })
            .then()
            .catch(console.error);
    }
    fetchData() {
        return knex('memento_data').where({
            is_active: 0
        }).andWhere(
            'fulfillment_timestamp', '<', moment().valueOf()
        )
            .then((rows) => {
                if (rows.length > 0) {
                    return { status: 1, elements: rows };
                } else {
                    return { status: 0, elements: "no data" }
                }
            })
            .catch(console.error);
    }
}
module.exports = memento;