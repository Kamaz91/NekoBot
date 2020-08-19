const Cfg = require('../../../../includes/Config.js');
const { MessageEmbed } = require('discord.js'); // for embed builder
var config = new Cfg();

class voiceChannelNotifier {
    constructor(args) {
        var oldMember = args[0];
        var newMember = args[1];

        try {
            if (newMember.voiceChannelID === null || newMember.voiceChannelID === undefined) {
                var guild = newMember.guild;
            } else {
                var guild = oldMember.guild;
            }

            if (config.logsChannels.hasOwnProperty(guild.id)) {
                // Jeśli istnieje przypisany kanał do logów
                var logsChannelId = config.logsChannels[guild.id];
                if (newMember.channelID !== oldMember.channelID && logsChannelId !== null) {
                    var logsChannel = guild.channels.resolve(logsChannelId);
                    if (oldMember.channelID === null || oldMember.channelID === undefined) {
                        var author = `${newMember.member.displayName}#${newMember.member.user.discriminator}`;
                        var img = newMember.member.user.displayAvatarURL;
                        var action = 'Joined to **' + newMember.channel.name + '**';
                        var color = [79, 214, 38];
                    } else if (newMember.channelID && oldMember.channelID) {
                        var author = `${newMember.member.displayName}#${newMember.member.user.discriminator}`;
                        var img = newMember.member.user.displayAvatarURL;
                        var action = 'Switched from **' + oldMember.channel.name + '** to **' + newMember.channel.name + '**';
                        var color = [33, 108, 198];
                    } else {
                        var author = `${oldMember.member.displayName}#${oldMember.member.user.discriminator}`;
                        var img = oldMember.member.user.displayAvatarURL;
                        var action = `Left **${oldMember.channel.name}**`;
                        var color = [214, 44, 38];
                    }

                    const embed = new MessageEmbed()
                        .setTimestamp()
                        .setAuthor(author, img)
                        .setDescription(action)
                        .setColor(color)
                    logsChannel.send({ embed: embed });
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = voiceChannelNotifier;