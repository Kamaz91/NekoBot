import { NotifierChannels, NotifierUsersDM } from "@/@types/database";
import { Database } from "@includes/database";
import { Notifier } from "@/@types/config";

const template: Notifier = {
    messageDelete: {
        channelId: null,
        usersDM: new Array()
    },
    voiceChange: {
        channelId: null,
        usersDM: new Array()
    },
    guildLeft: {
        channelId: null,
        usersDM: new Array()
    }
};

const sql = [
    (guildsArray) => Database().from("notifier_logs_channels").whereIn('guild_id', guildsArray),
    (guildsArray) => Database().from("notifier_users_dm_notifications").whereIn('guild_id', guildsArray).andWhere({ enabled: 1 })
];

function prepareData(GuildsIds: string[], data: [NotifierChannels[], NotifierUsersDM[]]) {
    var GuildsSettings = new Map();

    for (const GuildId of GuildsIds) {
        let channels = data[0].filter((el) => el.guild_id == GuildId);
        var users_DM = data[1].filter((el) => el.guild_id == GuildId);

        let settings: Notifier = {
            messageDelete: {
                channelId: null,
                usersDM: new Array()
            },
            voiceChange: {
                channelId: null,
                usersDM: new Array()
            },
            guildLeft: {
                channelId: null,
                usersDM: new Array()
            }
        };

        for (const user of users_DM) {
            switch (user.type) {
                case "guild_left":
                    settings.guildLeft.usersDM.push(user.user_id);
                    break;
                case "message_delete":
                    settings.messageDelete.usersDM.push(user.user_id);
                    break;
                case "voice_change":
                    settings.voiceChange.usersDM.push(user.user_id);
                    break;
            }
        }

        for (const channel of channels) {
            switch (channel.type) {
                case "guild_left":
                    settings.guildLeft.channelId = channel.channel_id;
                    break;
                case "message_delete":
                    settings.messageDelete.channelId = channel.channel_id;
                    break;
                case "voice_change":
                    settings.voiceChange.channelId = channel.channel_id;
                    break;
            }
        }

        GuildsSettings.set(GuildId, settings);
    }
    return GuildsSettings
}

export default {
    template, sql, prepareData
}