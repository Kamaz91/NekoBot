const Cfg = require('../../../../includes/Config.js');
const { MessageEmbed } = require('discord.js'); // embed builder
var config = new Cfg();

class messageDeleteNotifier {
    constructor(args) {
        var message = args[0];
        /* 
             * ************ ! UWAGA ! ************
             *
             *  Niestety wykrywane są usunięcia 
             *  tylko tych wiadomości które były 
             *  zamieszczone podczas działania bota,
             *  wszystkie inne są niezauważone
             *
             * ***********************************
             */

        try {
            var guild = message.guild;
            if (message.channel.type == "text" &&
                message.author.bot === false &&
                config.activityLogChannels.hasOwnProperty(guild.id)
            ) {
                // Logs channel 
                var logsChannel = guild.channels.resolve(config.activityLogChannels[guild.id]);
                // Get all attachments from the message
                var attachments = message.attachments.array();
                // All attachments url in string
                var urls = "";

                const embed = new MessageEmbed()
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
                    for (let i in attachments) {
                        urls += attachments[i].proxyURL + "\n";
                    }
                    embed.addField('Attachments', urls);
                }
                logsChannel.send(embed);

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
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = messageDeleteNotifier;