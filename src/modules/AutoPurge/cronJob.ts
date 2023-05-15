import { CronJob } from "cron";
import Config from "@core/config";
import Client from "@core/Connection";
import { Database } from "@includes/database";
import moment from "moment";
import { AutoPurgeMessage } from "@/@types/database";
import logger from "@includes/logger";

export function StartCron() {
    const autoPurge = new CronJob('0 0 */1 * * *', CronTask);
    logger.info("AutoPurge: channels job started");
    autoPurge.start();
}

async function CronTask() {
    let Data = await prepareData();
    let Messages = PrepareMessages(Data);
    deleteMessages(Messages);
}

async function prepareData() {
    let GuildsKeys = Array.from((await Client.guilds.fetch()).keys());
    var query = Database()('auto_purge_messages');

    for (const GuildId of GuildsKeys) {
        let AutoPurgeSettings = Config.getGuildConfig(GuildId).AutoPurge;
        if (!AutoPurgeSettings.enabled) {
            break;
        }
        for (const [ChannelId, channel] of AutoPurgeSettings.channels) {
            let timeDiff = moment().subtract(channel.older_than, 'h').valueOf();

            query.orWhere(function () {
                this.andWhere({
                    guild_id: GuildId,
                    channel_id: ChannelId
                });
                this.andWhere("create_timestamp", "<", timeDiff);
            })
        }
    }
    return query
        .then((rows: AutoPurgeMessage[]) => rows)
        .catch((err) => {
            logger.error(err);
            return [];
        });
}

function PrepareMessages(messages: AutoPurgeMessage[]) {
    let MessagesByChannel: Map<string, Array<string>> = new Map();

    for (const message of messages) {
        if (MessagesByChannel.has(message.channel_id)) {
            let channel = MessagesByChannel.get(message.channel_id)
            channel.push(message.message_id);
        } else {
            let arr = new Array();
            arr.push(message.message_id);
            MessagesByChannel.set(message.channel_id, arr)
        }
    }
    return MessagesByChannel;
}

function deleteMessages(MessagesByChannel: Map<string, Array<string>>) {
    for (const [channelId, messages] of MessagesByChannel) {
        let channel = Client.channels.resolve(channelId);
        if (channel.isTextBased() && !channel.isDMBased())
            channel.bulkDelete(messages)
                .then(() => releaseDatabaseMessages(messages));
    }
}

function releaseDatabaseMessages(Messages) {
    Database()('auto_purge_messages')
        .whereIn('message_id', Messages)
        .del()
        .then()
        .catch(logger.error);
}