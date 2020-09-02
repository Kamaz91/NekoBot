const { MessageEmbed } = require('discord.js'); // embed builder
const { config } = require('../../../../includes/config/config.js');

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

        if (message.channel.type != "text") {
            return;
        }

        var guild = config.guilds.get(message.guild.id);

        if (
            message.author.bot === false &&
            guild.modules.logsChannels.enabled &&
            guild.modules.logsChannels.activity != null
        ) {
            // Logs channel 
            var logsChannel = message.guild.channels.resolve(guild.modules.logsChannels.activity);
            // Get all attachments from the message
            var attachments = message.attachments.array();
            // All attachments url in string
            var urls = "";

            const embed = new MessageEmbed()
                .setDescription("**Deleted in **<#" + message.channel.id + ">")
                .setFooter("Message id: " + message.id)
                .setColor([214, 44, 38])
                .setTimestamp(message.createdAt)
                .setAuthor(message.member.displayName + " [" + message.author.username + " #" + message.author.discriminator + "]", message.author.displayAvatarURL);

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
        }
    }
}

module.exports = messageDeleteNotifier;