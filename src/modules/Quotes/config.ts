import { Database } from "@includes/database";

const template = {
    enabled: false
}

const sql = [
    (guildsArray) => Database().from("quotes_guild_settings").whereIn('guild_id', guildsArray)
];

function prepareData(GuildsIds: string[], data: any[]) {
    var GuildsSettings = new Map();

    for (const GuildId of GuildsIds) {
        let db = data[0].find((el) => el.guild_id == GuildId);
        let settings = {
            enabled: db.enabled
        }
        GuildsSettings.set(GuildId, settings);
    }
    return GuildsSettings
}

export default {
    template, sql, prepareData
}