var method = quotes.prototype;

var knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: "../data/database.sqlite"
    }
});

function quotes(message, trigger) {
    switch (trigger.splitTigger[1]) {
        case 'add':
            this.addQoute(message, trigger);
            break;
        case 'del':
            this.deleteQoute(message, trigger);
            break;
        default:
            if (trigger.splitTigger[2] === null) {
                this.randomQoute(message, trigger);
            } else {
                this.getQoute(message, trigger);
            }
            break;
    }

    method.addQuote = function (message, trigger) {
        knex('quotes').insert(
                {
                    autorId: 166956114154356736, /**** TO DO ****/
                    autorName: 'Kamaz', /**** TO DO ****/
                    guildId: 166962880489586688, /**** TO DO ****/
                    guildName: 'Partia Fanów Anime', /**** TO DO ****/
                    text: 'Slaughterhouse Five', /**** TO DO ****/
                    timestamp: Date.now()
                }
        ).then(function () {
            /**** TO DO ****/
            /**** Wiadomość zwrotna ****/
            console.log('done');
        });
    };
    method.deleteQuote = function (message, trigger) {
        /**********TO DO**********/
    };
    method.getQoute = function (message, trigger) {
        knex('quotes').where({
            id: trigger.splitTigger[1],
            guildId: message.guild.id /**** TO DO ****/
        }).then(function (result) {
            /**********TO DO**********/
        });
    };
    method.randomQuote = function (message, trigger) {
        /**********TO DO**********/
        knex('quotes').where({
            guildId: message.guild.id /**** TO DO ****/
        }).then(function (result) {
            /**********TO DO**********/
        });
    };
}
module.exports = quotes;