import { AutoPurgeSettings, ModuleSettings } from "@/@types/database";
import { Database } from "@includes/database";
import { AutoPurge } from "@/@types/config";

const Template = {
    enabled: false,
    channels: new Map()
}

const SQL = [
    (guildsArray) => Database().from("auto_purge_settings").whereIn('guild_id', guildsArray),
    (guildsArray) => Database().from("modules_settings").whereIn('guild_id', guildsArray).andWhere("module_name", "autoPurge")
];

function PrepareData(GuildsIds: string[], data: [AutoPurgeSettings[], ModuleSettings[]]) {
    var GuildsSettings = new Map();

    for (const GuildId of GuildsIds) {
        let settings = data[1].find((el) => el.guild_id == GuildId);
        let rawChannels = data[0].filter((el) => el.guild_id == GuildId)
        var channels = new Map();

        rawChannels.every(el => { channels.set(el.channel_id, { older_than: el.older_than }) });

        let template: AutoPurge = {
            enabled: settings.enabled,
            channels: channels
        }

        GuildsSettings.set(GuildId, template);
    }
    return GuildsSettings
}

export default {
    Template, SQL, PrepareData
}