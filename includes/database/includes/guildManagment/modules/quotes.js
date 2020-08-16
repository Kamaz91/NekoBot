const moment = require('moment');

module.exports = (Connection) => {
    return {
        async addQuote(guild_id, guildName, autor_id, autorName, text) {
            var guild_quote_id = await Connection
                .from('quotes')
                .select("quoteIdByGuild")
                .where("guildId", guild_id)
                .orderBy("quoteIdByGuild", "desc")
                .limit(1)
                .then((rows) => { return rows.length > 0 ? rows[0].quoteIdByGuild : 0 });

            return Connection('quotes')
                .insert({
                    autorId: autor_id,
                    quoteIdByGuild: guild_quote_id + 1,
                    autorName: autorName,
                    guildId: guild_id,
                    guildName: guildName,
                    text: text,
                    timestamp: moment().valueOf()
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return {
                            status: true,
                            request: {
                                quote_id: rows[0],
                                quoteIdByGuild: guild_quote_id + 1
                            }
                        };
                    } else {
                        return { status: false, request: "Cant add quote" }
                    }
                })
        },

        deleteQuote(guild_id, quote_guild_id) {
            return Connection('quotes')
                .where({
                    quoteIdByGuild: quote_guild_id,
                    guildId: guild_id
                })
                .del()
                .then((rows) => {
                    if (rows > 0) {
                        return { status: true, error: false, request: rows[0] };
                    } else {
                        return { status: false, error: false, request: null }
                    }
                })
                .catch(err => { return { status: false, error: true, request: err } });
        },
        getQuote(guild_id, quote_guild_id) {
            return Connection('quotes')
                .where({
                    quoteIdByGuild: quote_guild_id,
                    guildId: guild_id
                })
                .limit(1)
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: true, request: rows[0] };
                    } else {
                        return { status: false, request: "Quote not found" }
                    }
                })
                .catch(err => { return { status: false, request: err } });
        },
        getQuotes(guild_id) {
            return Connection('quotes')
                .where({
                    guildId: guild_id
                })
                .orderBy('quoteIdByGuild', 'asc')
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: true, request: rows };
                    } else {
                        return { status: false, request: "Quotes not found" }
                    }
                })
                .catch(err => { return { status: false, request: err } });
        }
    }
}