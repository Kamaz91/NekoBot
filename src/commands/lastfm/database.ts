import { Database } from "../../services/database/index.js";
import logger from "../../services/logger/index.js";

export async function GetApiKey() {
    var query = await Database()
        .from("api_tokens")
        .select("*")
        .where({ token_type: "lastfm_api" })
        .first();

    if (!query) {
        logger?.error("Lastfm: Cant get token");
        logger?.error("Lastfm: token is empty");
        throw new Error("Lastfm: Database Query Error");
    }
    return query.token;
}