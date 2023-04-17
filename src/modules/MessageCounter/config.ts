import { MessageCounterSettings, MessageCounterChannelList } from "@type/database";
import { Database } from "@includes/database";
import { MessageCounter } from "@type/config";

const template = {
    enabled: false,
    bots: 0,
    is_hidden: 0,
    listing: {
        type: "all", // whitelist, blacklist, all
        channels: new Map()
    }
}

const sql = [
    (guildsArray) => Database().from("message_counter_guild_settings").whereIn('guild_id', guildsArray),
    (guildsArray) => Database().from("message_counter_channel_list").whereIn('guild_id', guildsArray)
];

function prepareData(GuildsIds: string[], data: [MessageCounterSettings[], MessageCounterChannelList[]]) {
    var GuildsSettings = new Map();

    for (const GuildId of GuildsIds) {
        // Find element with GuildId
        let db = data[0].find((el) => el.guild_id == GuildId);
        // Find elements with GuildId
        var channels = data[1].filter((el) => el.guild_id == GuildId)
        let settings: MessageCounter = {
            enabled: db.enabled,
            bots: db.bots,
            is_hidden: db.is_hidden,
            listing: {
                type: db.listing,
                channels: new Map()
            }
        }
        channels.forEach((el) => settings.listing.channels.set(el.channel_id, { id: el.channel_id }));
        GuildsSettings.set(GuildId, settings);
    }
    return GuildsSettings
}

export default {
    template, sql, prepareData
}