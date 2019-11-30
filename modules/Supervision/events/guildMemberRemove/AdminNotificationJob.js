const moment = require('moment');
const Cfg = require('../../../../includes/Config.js');
var config = new Cfg();

class AdminNotification {
    constructor(args) {
        this.member = args[0];

        try {
            if (config.guildLeftAdminPM.hasOwnProperty(this.member.guild.id)) {
                var guild = this.member.guild;
                var admins = config.guildLeftAdminPM[guild.id];

                // User Spent time
                var leftTime = moment(new Date());
                var joined = moment(this.member.joinedAt);
                var duration = moment.duration(leftTime.diff(joined));
                //

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
                embed.setAuthor(this.member.displayName + "#" + this.member.user.discriminator, this.member.user.displayAvatarURL);
                embed.setThumbnail(guild.iconURL);
                embed.setDescription('**Left** ' + guild.name);
                embed.addField('Time', timestring);
                embed.setFooter('User Id: ' + this.member.id)
                embed.setColor([214, 44, 38]);

                for (var id in admins) {
                    guild.members.get(admins[id]).send(embed);
                }
            }
        } catch (e) {
            console.log(e);
        }
        console.log('User ', this.member.displayName, " left ", this.member.guild.name);
    }
}

module.exports = AdminNotification;