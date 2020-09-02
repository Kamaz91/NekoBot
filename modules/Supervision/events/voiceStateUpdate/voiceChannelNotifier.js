const { MessageEmbed } = require('discord.js'); // embed builder
const { config } = require('../../../../includes/config/config.js');

class voiceChannelNotifier {
    constructor(args) {
        // VoiceState variables new in discord.js v12
        // https://discord.js.org/#/docs/main/v12/class/Client?scrollTo=e-voiceStateUpdate
        var oldState = args[0];
        var newState = args[1];

        // Get guild data 
        var guild = newState.guild;

        // Get guild config data 
        var guildConfig = config.guilds.get(guild.id);

        // Is enabled logs for guild
        if (guildConfig.modules.logsChannels.enabled) {
            var logsChannel = guild.channels.resolve(guildConfig.modules.logsChannels.voice);
            // Check if the log channel exists in config
            if (newState.channelID !== oldState.channelID && logsChannel != null) {

                if (oldState.channelID === null) {
                    //* Joined to voice channel
                    var author = `${newState.member.displayName}#${newState.member.user.discriminator}`;
                    var img = newState.member.user.displayAvatarURL;
                    var action = 'Joined to **' + newState.channel.name + '**';
                    var color = [79, 214, 38];
                } else if (newState.channelID && oldState.channelID) {
                    //* Switched voice channels
                    var author = `${newState.member.displayName}#${newState.member.user.discriminator}`;
                    var img = newState.member.user.displayAvatarURL;
                    var action = 'Switched from **' + oldState.channel.name + '** to **' + newState.channel.name + '**';
                    var color = [33, 108, 198];
                } else {
                    //* Left voice channel
                    var author = `${oldState.member.displayName}#${oldState.member.user.discriminator}`;
                    var img = oldState.member.user.displayAvatarURL;
                    var action = `Left **${oldState.channel.name}**`;
                    var color = [214, 44, 38];
                }

                const embed = new MessageEmbed()
                    .setTimestamp()
                    .setAuthor(author, img)
                    .setDescription(action)
                    .setColor(color)

                logsChannel.send(embed);
            }
        }
    }
}

module.exports = voiceChannelNotifier;