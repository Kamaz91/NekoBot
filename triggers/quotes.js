var method = quotes.prototype;
const Discord = require('discord.js');

function quotes(message, trigger) {
    switch (trigger.splitTigger[1]) {
        case 'add':
            this.addQuote(message, trigger);
            break;
        case 'del':
            this.deleteQoute(message, trigger);
            break;
        default:
            if (trigger.text.length) {
                //this.getQuote(message, trigger);
                console.log("nie random");
            } else {
                this.randomQuote(message);
                console.log("random");
            }
            break;
    }
}

method.addQuote = function (message, trigger) {
    var text = trigger['text'].slice(trigger.splitTigger[1].length).trim();

    if (text !== null) {

        knex('quotes').insert({
            autorId: message.author.id,
            autorName: message.author.username,
            guildId: message.guild.id,
            guildName: message.guild.name,
            text: text,
            timestamp: Date.now()
        }).then(() => {
            message.reply("Dodano cytat");
        });
    }
};

method.deleteQuote = function (message, trigger) {
    /**********TO DO**********/
};

method.getQoute = function (message, trigger) {
    knex('quotes').where({
        id: trigger.splitTigger[1],
        guildId: message.guild.id /**** TO DO ****/
    }).then(function (result) {
        console.log(result);
        message.reply("Dodano cytat: " + result);
    });
};

method.randomQuote = function (message) {
    /**********TO DO**********/
    knex('quotes').where({
        guildId: message.guild.id /**** TO DO ****/
    }).orderBy('id', 'asc').then((result) => {
        let rand = Math.floor((Math.random() * result.length));
        let quote = result[rand];

        const embed = new Discord.RichEmbed()
                .setAuthor('Quote #' + quote.id)
                .setColor(0xEF017C)
                .setFooter('Autor: ' + quote.autorName)
                .setTimestamp(new Date(quote.timestamp).toISOString())
                .addField('Cytat:', quote.text);

        message.channel.send(embed);
        //message.reply(embed);
    });
};

module.exports = quotes;