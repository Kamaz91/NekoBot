import cfg from "./config";
import { EventsManager, config } from "@core/Bot";
import { Events, Message } from "discord.js";
import { Database } from "@includes/database";
import moment from "moment";
import { StartCron } from "./cronJob";
import logger from "@includes/logger";

export default { cfg, execute };

function execute() {
    logger.info("Auto Purge");
    EventsManager.addEventTask(Events.MessageCreate, processMessage);
    StartCron();
}

function processMessage(Message: Message) {
    if (!Message.inGuild()) {
        return;
    }

    var GuildId = Message.guildId;
    var ChannelId = Message.channelId;
    var GuildData = config.getGuildConfig(GuildId).AutoPurge;

    // If module is enabled and channel is set
    if (GuildData.channels.has(ChannelId) && GuildData.enabled) {
        insertMessage(GuildId, ChannelId, Message.id);
    }
}

function insertMessage(guild_id, channel_id, message_id) {
    Database()('auto_purge_messages')
        .insert({
            message_id: message_id,
            channel_id: channel_id,
            guild_id: guild_id,
            create_timestamp: moment().valueOf()
        })
        .then()
        .catch(err => logger.error(err));
}