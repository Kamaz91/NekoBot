import { Database } from "../../services/database/index.js";
import logger from "../../services/logger/index.js";
import { Quote } from "../../types/database.js";
import { guildId, QuoteContent } from "../../types/quotes.js";

export async function AddQuoteToDatabase(guild_id: guildId, user_id: string, Data: QuoteContent) {
    let quotePosition = await GetQuoteLastPosition(guild_id) + 1;
    let timestamp = new Date().getTime();
    if (quotePosition != null) {
        Database()
            .table("quotes")
            .insert({ guild_id: guild_id, quote_guild_position: quotePosition, user_id: user_id, data: JSON.stringify(Data), created_timestamp: timestamp })
            .catch(error => {
                logger?.error("Quotes: Cant add quote to Database");
                logger?.error(JSON.stringify(error));
            });
    }
    return quotePosition;
}

export function GetQuoteLastPosition(guild_id: guildId): Promise<number> {
    return Database()
        .from('quotes')
        .select("quote_guild_position")
        .where("guild_id", guild_id)
        .orderBy("quote_guild_position", "desc")
        .limit(1)
        .then((rows) => { return rows.length > 0 ? rows[0].quote_guild_position : 0 })
        .catch(error => {
            logger?.error("Quotes: Cant gather quote position");
            logger?.error(JSON.stringify(error));
            return null;
        });
}

export async function getQuote(guildId, quotePosition?): Promise<Quote> {
    if (quotePosition) {
        return Database().select("*").from("quotes").where({ guild_id: guildId, hidden: 0, quote_guild_position: quotePosition }).first();
    } else {
        return randomQuote(guildId);
    }
}

export async function randomQuote(guildId): Promise<Quote> {
    return Database().select("*").from("quotes").where({ guild_id: guildId, hidden: 0 }).orderByRaw("RAND()").first();
}