const Cfg = require('../../includes/Config.js');
const Discord = require('discord.js'); // for embed builder
const moment = require('moment');

var config = new Cfg();

class Supervision {
    constructor(DiscordClient) {
        DiscordClient.on('guildMemberRemove', (member) => {
            try {
                if (config.guildLeftAdminPM.hasOwnProperty(member.guild.id)) {
                    var guild = member.guild;
                    var admins = config.guildLeftAdminPM[guild.id];

                    // User Spent time
                    var leftTime = moment(new Date());
                    var joined = moment(member.joinedAt);
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
                    embed.setAuthor(member.displayName + "#" + member.user.discriminator, member.user.displayAvatarURL);
                    embed.setThumbnail(guild.iconURL);
                    embed.setDescription('**Left** ' + guild.name);
                    embed.addField('Time', timestring);
                    embed.setFooter('Guild Id: ' + guild.id)
                    embed.setColor([214, 44, 38]);

                    console.log(admins);
                    for (var id in admins) {
                        guild.members.get(admins[id]).send(embed);
                    }
                }
            } catch (exception) {
                console.log(exception);
            }

        });
        DiscordClient.on('voiceStateUpdate', (oldMember, newMember) => {

            if (newMember.voiceChannelID === null || newMember.voiceChannelID === undefined) {
                var guild = newMember.guild;
            } else {
                var guild = oldMember.guild;
            }

            if (config.logsChannels.hasOwnProperty(guild.id)) {
                // Jeśli istnieje w tablicy przypisany kanał do logów
                var logsChannelId = config.logsChannels[guild.id];

                try {
                    const embed = new Discord.RichEmbed().setTimestamp(new Date());
                    if (newMember.voiceChannelID !== oldMember.voiceChannelID && logsChannelId !== null) {
                        var logsChannel = guild.channels.get(logsChannelId);

                        if (oldMember.voiceChannelID === null || oldMember.voiceChannelID === undefined) {
                            embed.setAuthor(newMember.displayName + "#" + newMember.user.discriminator, newMember.user.displayAvatarURL);
                            embed.setDescription('Joined to **' + newMember.voiceChannel + '**');
                            embed.setColor([79, 214, 38]);
                        } else if (newMember.voiceChannelID && oldMember.voiceChannelID) {
                            embed.setAuthor(newMember.displayName + "#" + newMember.user.discriminator, newMember.user.displayAvatarURL);
                            embed.setDescription('Switched from **' + oldMember.voiceChannel + '** to **' + newMember.voiceChannel + '**');
                            embed.setColor([33, 108, 198]);
                        } else {
                            embed.setAuthor(oldMember.displayName + "#" + oldMember.user.discriminator, oldMember.user.displayAvatarURL);
                            embed.setDescription('Left **' + oldMember.voiceChannel + '**');
                            embed.setColor([214, 44, 38]);
                        }
                        logsChannel.send(embed);

                        //serverDeaf serverMute
                    }
                    if (newMember.guild.id !== oldMember.guild.id) {
                        const oembed = new Discord.RichEmbed().setTimestamp(new Date());
                        var ologsChannel = oldMember.guild.channels.get(config.logsChannels[oldMember.guild.id]);
                        oembed.setAuthor(oldMember.displayName + "#" + oldMember.user.discriminator, oldMember.user.displayAvatarURL);
                        oembed.setDescription('Left **' + oldMember.voiceChannel + '**');
                        oembed.setColor([214, 44, 38]);
                        ologsChannel.send(oembed);

                        const nembed = new Discord.RichEmbed().setTimestamp(new Date());
                        var nlogsChannel = newMember.guild.channels.get(config.logsChannels[newMember.guild.id]);
                        nembed.setAuthor(newMember.displayName + "#" + newMember.user.discriminator, newMember.user.displayAvatarURL);
                        nembed.setDescription('Joined to **' + newMember.voiceChannel + '**');
                        nembed.setColor([79, 214, 38]);
                        nlogsChannel.send(nembed);
                    }
                } catch (exception) {
                    console.log(exception);
                }
            }
        });

        DiscordClient.on('messageDelete', (message) => {
            /* 
             * ************ ! UWAGA ! ************
             *
             *  Niestety wykrywane są usunięcia 
             *  tylko tych wiadomości które były 
             *  zamieszczone podczas działania bota,
             *  wszystkie inne są nie zauważone
             *
             * ***********************************
             */

            var guild = message.guild;

            if (config.activityLogChannels.hasOwnProperty(guild.id) && message.author.bot === false) {
                // Jeśli istnieje w tablicy przypisany kanał do logów i autor nie jest botem
                let logsChannel = guild.channels.get(config.activityLogChannels[guild.id]);
                // 
                var attachments = message.attachments.array();
                var urls = "";
                try {
                    const embed = new Discord.RichEmbed()
                        .setDescription("**Deleted in **<#" + message.channel.id + ">")
                        .setFooter("Message id: " + message.id)
                        .setColor([214, 44, 38])

                    .setTimestamp(message.createdAt);

                    if (message.member.id.length > 0) {
                        embed.setAuthor(message.member.displayName + " [" + message.author.username + " #" + message.author.discriminator + "]", message.author.displayAvatarURL);
                    } else {
                        embed.setAuthor("[" + message.author.username + " #" + message.author.discriminator + "]", message.author.displayAvatarURL);
                    }

                    if (message.content.length > 0) {
                        embed.addField('Message', message.content);
                    }

                    if (attachments.length > 0) {
                        for (var i in attachments) {
                            urls += attachments[i].proxyURL + "\n";
                        }
                        embed.addField('Attachments', urls);
                    }
                    logsChannel.send(embed);
                } catch (error) {
                    console.log(error);
                }
                console.log("*******************************");
                console.log("Message Deletation Detected!");
                console.log("Message id:" + message.id);
                console.log("Author:" + message.author.username + " id:" + message.author.id);
                console.log("Guild:" + message.guild.name);
                console.log("Channel:" + message.channel.name);
                console.log("*******************************");
                console.log(message.cleanContent);
                console.log(urls);
                console.log("*******************************");
            }
        });
    }
}

module.exports = Supervision;