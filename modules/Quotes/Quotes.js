const Discord = require('discord.js');

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

    addQuote(message, trigger) {
        if (trigger.text.length > 0) {
            knex('quotes').where({ guildId: message.guild.id })
                .orderBy('quoteIdByGuild', 'desc')
                .limit(1)
                .then((quote) => {
                    if (quote.length > 0) {
                        var quoteIdByGuild = quote[0].quoteIdByGuild + 1;
                    } else {
                        var quoteIdByGuild = 1;
                    }
                    knex('quotes').insert({
                        autorId: message.author.id,
                        quoteIdByGuild: quoteIdByGuild,
                        autorName: message.author.username,
                        guildId: message.guild.id,
                        guildName: message.guild.name,
                        text: trigger.text,
                        timestamp: Date.now()
                    }).then(() => {
                        const embed = new Discord.RichEmbed()
                            .setAuthor('Quote #' + quoteIdByGuild)
                            .setColor(0xEF017C)
                            .setFooter('Autor: ' + message.author.username)
                            .setTimestamp(new Date().toISOString())
                            .addField('Cytat:', trigger.text);

                        message.channel.send(embed);
                    });
                });
        } else {
            message.channel.send("Nie można dodać pustego cytatu");
        }
    };

    deleteQuote(message, trigger) {
        if (message.member.hasPermission('ADMINISTRATOR')) {
            knex('quotes').where({
                quoteIdByGuild: trigger.arguments[0],
                guildId: message.guild.id
            }).then((result) => {
                if (result.length > 0) {
                    knex('quotes').where('quoteIdByGuild', trigger.arguments[0]).del()
                        .then(() => {
                            message.channel.send(`Cytat #${result[0].quoteIdByGuild} ${result[0].text} usunięty`);
                        });
                } else {
                    message.channel.send("Cytat #" + trigger.arguments[0] + " nie istnieje");
                }
            });
        } else {
            message.channel.send("Tylko Administrator może usuwać cytaty");
        }
    };

    getQuote(message, trigger) {
        knex('quotes').where({
            quoteIdByGuild: trigger.arguments[0],
            guildId: message.guild.id
        }).then(function(quote) {
            if (quote.length > 0) {
                const embed = new Discord.RichEmbed()
                    .setAuthor('Quote #' + quote[0].quoteIdByGuild)
                    .setColor(0xEF017C)
                    .setFooter('Autor: ' + quote[0].autorName)
                    .setTimestamp(new Date(quote[0].timestamp).toISOString())
                    .addField('Cytat:', quote[0].text);

                message.channel.send(embed);
            } else {
                message.channel.send("Cytat #" + trigger.arguments[0] + " nie istnieje");
            }
        });
    };

    randomQuote(message) {
        knex('quotes').where({
            guildId: message.guild.id
        }).orderBy('quoteIdByGuild', 'asc').then((result) => {
            let rand = Math.floor((Math.random() * result.length));
            let quote = result[rand];

            const embed = new Discord.RichEmbed()
                .setAuthor('Quote #' + quote.quoteIdByGuild)
                .setColor(0xEF017C)
                .setFooter('Autor: ' + quote.autorName)
                .setTimestamp(new Date(quote.timestamp).toISOString())
                .addField('Cytat:', quote.text);

            message.channel.send(embed);
        });
    };
}

module.exports = quotes;