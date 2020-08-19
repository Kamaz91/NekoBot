const Discord = require('discord.js'); // for embed builder
const moment = require('moment');
const { config } = require('../../../../includes/config/config.js');

class userLeftNotification {
    constructor(args) {
        var member = args[0];

        var guild = config.guilds.get(member.guild.id);
        if (!guild.modules.notifier.enabled) {
            return;
        }

        var recipients = guild.modules.notifier.memberleft.users.array();

        if (recipients.length > 0) {
            // User Spent time
            var leftTime = moment(new Date());
            var joined = moment(member.joinedAt);
            var duration = moment.duration(leftTime.diff(joined));

            var timestring =
                `Joined: ${joined.format("DD/MM/YYYY, HH:mm:ss")}\n` +
                `Spent: ` +
                `${duration.years()} Years, ` +
                `${duration.months()} Months, ` +
                `${duration.days()} Days, ` +
                `${duration.hours()} Hours, ` +
                `${duration.minutes()} Minutes, ` +
                `${duration.seconds()} Seconds`;

            const embed = new Discord.RichEmbed().setTimestamp(new Date());
            embed.setAuthor(member.displayName + "#" + member.user.discriminator, member.user.displayAvatarURL);
            embed.setThumbnail(member.guild.iconURL);
            embed.setDescription('**Left** ' + member.guild.name);
            embed.addField('Time', timestring);
            embed.setFooter('User Id: ' + member.id)
            embed.setColor([214, 44, 38]);

            for (var recipient of recipients) {
                member.guild.members.resolve(recipient.id).send(embed);
            }
        }
        console.log('User ', member.displayName, " left ", member.guild.name);
    }
}

module.exports = userLeftNotification;