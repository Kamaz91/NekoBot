const { MessageEmbed } = require('discord.js');
const db = require('../../includes/database/index.js');

class quotes {
    constructor(DiscordClient, TriggerManager, ModuleLoader) {
        TriggerManager.RegisterTrigger({
            moduleName: "Quotes",
            content: (message, trigger) => {
                if (trigger.text.length > 0) {
                    this.getQuote(message, trigger);
                } else {
                    this.randomQuote(message);
                }
            },
            key: "quote",
            desc: "Cytaty",
            subTrigger: [{
                activator: "add",
                desc: "Dodaj cytat",
                content: (message, trigger) => { this.addQuote(message, trigger); }
            },
            {
                activator: "del",
                desc: "Usuń cytat",
                content: (message, trigger) => { this.deleteQuote(message, trigger); }
            }
            ],
            prefix: "!" //optional. if not defined using default prefix
        });
    }

    async addQuote(message, trigger) {
        if (trigger.text.length > 0) {
            let autor_id = message.author.id;
            let autorName = message.author.username;
            let guild_id = message.guild.id;
            let guildName = message.guild.name;

            var query = await db.guildManagment.modules.quotes.addQuote(guild_id, guildName, autor_id, autorName, trigger.text);
            if (query.status) {
                const embed = new MessageEmbed()
                    .setAuthor('Quote #' + query.request.quoteIdByGuild)
                    .setColor(0xEF017C)
                    .setFooter('Author: ' + message.author.username)
                    .setTimestamp(new Date().toISOString())
                    .addField('Quote:', trigger.text);

                message.channel.send(embed);
            } else {
                console.log('')
                message.channel.send("Error");
            }
        } else {
            message.channel.send("Cant add empty quote");
        }
    };

    async deleteQuote(message, trigger) {
        if (isNaN(parseInt(trigger.arguments[0]))) {
            message.channel.send("Argument is not a number");
            return;
        }
        if (message.member.hasPermission('ADMINISTRATOR')) {
            var query = await db.guildManagment.modules.quotes.deleteQuote(message.guild.id, trigger.arguments[0]);
            if (query.status) {
                message.channel.send(`Quote #${trigger.arguments[0]} deleted`);
            } else {
                message.channel.send("Quote #" + trigger.arguments[0] + " not exist");
            }
        } else {
            message.channel.send("Only Administrator can delete quotes");
        }
    };

    async getQuote(message, trigger) {
        if (isNaN(parseInt(trigger.arguments[0]))) {
            message.channel.send("Argument is not a number");
            return;
        }
        var query = await db.guildManagment.modules.quotes.getQuote(message.guild.id, trigger.arguments[0]);
        if (!query.status) {
            message.channel.send("Quote #" + trigger.arguments[0] + " not exist");
            return;
        }
        const embed = new MessageEmbed()
            .setAuthor('Quote #' + query.request.quoteIdByGuild)
            .setColor(0xEF017C)
            .setFooter('Author: ' + query.request.autorName)
            .setTimestamp(new Date(query.request.timestamp).toISOString())
            .addField('Quote:', query.request.text);

        message.channel.send(embed);
    };

    async randomQuote(message) {
        var quotes = await db.guildManagment.modules.quotes.getQuotes(message.guild.id);
        if (!quotes.status) {
            message.channel.send("No quotes");
            return;
        }
        let rand = Math.floor((Math.random() * quotes.request.length));
        let quote = quotes.request[rand];

        const embed = new MessageEmbed()
            .setAuthor('Quote #' + quote.quoteIdByGuild)
            .setColor(0xEF017C)
            .setFooter('Author: ' + quote.autorName)
            .setTimestamp(new Date(quote.timestamp).toISOString())
            .addField('Quote:', quote.text);

        message.channel.send(embed);
    };
}
module.exports = quotes;