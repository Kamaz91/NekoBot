var method = quotes.prototype;

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
                this.randomQuote(message, trigger);
                console.log("random");
            }
            break;
    }
}

method.addQuote = function (message, trigger) {
    var text = trigger['text'].slice(trigger.splitTigger[1].length).trim();

    if (text !== null) {

        knex('quotes').insert(
                {
                    autorId: message.author.id,
                    autorName: message.author.username,
                    guildId: message.guild.id,
                    guildName: message.guild.name,
                    text: text,
                    timestamp: Date.now()

                }
        ).then(function () {
            message.reply("Dodano cytat: " + text);
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

method.randomQuote = function (message, trigger) {
    /**********TO DO**********/
    knex('quotes').where({
        guildId: message.guild.id /**** TO DO ****/
    }).orderBy('id', 'asc').then(function (result) {
        rand = Math.floor((Math.random() * result.length));
        message.reply("Cytat: " + result[rand].text);
    });
};

module.exports = quotes;