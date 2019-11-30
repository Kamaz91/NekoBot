const Cfg = require('../../../../includes/Config.js');
const Discord = require('discord.js'); // for embed builder
var config = new Cfg();

class voiceChannelNotifier {
    constructor(args) {
        this.oldMember = args[0];
        this.newMember = args[1];

        try {
            if (this.newMember.voiceChannelID === null || this.newMember.voiceChannelID === undefined) {
                var guild = this.newMember.guild;
            } else {
                var guild = this.oldMember.guild;
            }

            if (config.logsChannels.hasOwnProperty(guild.id)) {
                // Jeśli istnieje przypisany kanał do logów
                var logsChannelId = config.logsChannels[guild.id];

                const embed = new Discord.RichEmbed().setTimestamp(new Date());
                if (this.newMember.voiceChannelID !== this.oldMember.voiceChannelID && logsChannelId !== null) {
                    var logsChannel = guild.channels.get(logsChannelId);

                    if (this.oldMember.voiceChannelID === null || this.oldMember.voiceChannelID === undefined) {
                        embed.setAuthor(this.newMember.displayName + "#" + this.newMember.user.discriminator, this.newMember.user.displayAvatarURL);
                        embed.setDescription('Joined to **' + this.newMember.voiceChannel + '**');
                        embed.setColor([79, 214, 38]);
                    } else if (this.newMember.voiceChannelID && this.oldMember.voiceChannelID) {
                        embed.setAuthor(this.newMember.displayName + "#" + this.newMember.user.discriminator, this.newMember.user.displayAvatarURL);
                        embed.setDescription('Switched from **' + this.oldMember.voiceChannel + '** to **' + this.newMember.voiceChannel + '**');
                        embed.setColor([33, 108, 198]);
                    } else {
                        embed.setAuthor(this.oldMember.displayName + "#" + this.oldMember.user.discriminator, this.oldMember.user.displayAvatarURL);
                        embed.setDescription('Left **' + this.oldMember.voiceChannel + '**');
                        embed.setColor([214, 44, 38]);
                    }
                    logsChannel.send(embed);

                    //serverDeaf serverMute
                }
                if (this.newMember.guild.id !== this.oldMember.guild.id) {
                    const oembed = new Discord.RichEmbed().setTimestamp(new Date());
                    var ologsChannel = this.oldMember.guild.channels.get(config.logsChannels[this.oldMember.guild.id]);
                    oembed.setAuthor(this.oldMember.displayName + "#" + this.oldMember.user.discriminator, this.oldMember.user.displayAvatarURL);
                    oembed.setDescription('Left **' + this.oldMember.voiceChannel + '**');
                    oembed.setColor([214, 44, 38]);
                    ologsChannel.send(oembed);

                    const nembed = new Discord.RichEmbed().setTimestamp(new Date());
                    var nlogsChannel = this.newMember.guild.channels.get(config.logsChannels[this.newMember.guild.id]);
                    nembed.setAuthor(this.newMember.displayName + "#" + this.newMember.user.discriminator, this.newMember.user.displayAvatarURL);
                    nembed.setDescription('Joined to **' + this.newMember.voiceChannel + '**');
                    nembed.setColor([79, 214, 38]);
                    nlogsChannel.send(nembed);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = voiceChannelNotifier;