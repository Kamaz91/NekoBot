const Cfg = require('../../includes/Config.js');
const Discord = require('discord.js'); // for embed builder

var config = new Cfg();

class Supervision {
    constructor(client) {
        client.on('voiceStateUpdate', (oldMember, newMember) => {

            if (newMember.voiceChannelID === null || newMember.voiceChannelID === undefined) {
                var guild = newMember.guild;
            } else {
                var guild = oldMember.guild;
            }

            if (config.logsChannels.hasOwnProperty(guild.id)) {
                // Jeśli istnieje w tablicy przypisany kanał do logów
                var logsChannelId = config.logsChannels[guild.id];

                let date = new Date();
                let t = [
                    `0${date.getHours()}`.slice(-2), // Godziny
                    `0${date.getMinutes()}`.slice(-2), // Minuty
                    `0${date.getSeconds()}`.slice(-2) // Sekundy
                ];
                var messageTime = t.join(':');

                try {
                    if (newMember.voiceChannelID !== oldMember.voiceChannelID && logsChannelId !== null) {
                        var logsChannel = guild.channels.get(logsChannelId);

                        if (oldMember.voiceChannelID === null || oldMember.voiceChannelID === undefined) {
                            logsChannel.send('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' joined to **' + newMember.voiceChannel + '**');
                        } else if (newMember.voiceChannelID && oldMember.voiceChannelID) {
                            logsChannel.send('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' switched from **' + oldMember.voiceChannel + '** to **' + newMember.voiceChannel + '**');
                        } else {
                            logsChannel.send('[' + messageTime + '] **' + oldMember.displayName + '** (' + oldMember.user.username + ')' + ' left **' + oldMember.voiceChannel + '**');
                        }

                        //serverDeaf serverMute
                    }
                    if (newMember.guild.id !== oldMember.guild.id) {
                        var ologsChannel = oldMember.guild.channels.get(config.logsChannels[oldMember.guild.id]);
                        ologsChannel.send('[' + messageTime + '] **' + oldMember.displayName + '** (' + oldMember.user.username + ')' + ' left **' + oldMember.voiceChannel + '**');

                        var nlogsChannel = newMember.guild.channels.get(config.logsChannels[newMember.guild.id]);
                        nlogsChannel.send('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' joined to **' + newMember.voiceChannel + '**');

                    }
                } catch (exception) {
                    console.log(exception);
                }
            }
        });

        client.on('messageDelete', (message) => {
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
                        .setTitle("Deleted")
                        .addField('User id', message.author.id)
                        .addField('Channel', "#" + message.channel.name)

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