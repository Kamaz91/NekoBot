import { Message } from "discord.js";
import { config } from "@core/Bot";
import moment from "moment";
import { Database } from "@includes/database";
import logger from "@includes/logger";

export function processMessage(Message: Message) {
    var User = Message.author;
    var ChannelId = Message.channelId
    var GuildId = Message.guildId;

    if (!config.hasGuild(GuildId)) {
        return;
    }

    var GuildData = config.getGuildConfig(GuildId).MessageCounter;

    // if MessageCounter is enebled
    if (!GuildData.enabled) {
        return;
    }

    // if bots counting is enebled
    if (!GuildData.bots && User.bot) {
        return;
    }

    // If channel is in whitelist or blacklist
    if (GuildData.listing.type == "whitelist" && !GuildData.listing.channels.has(ChannelId)) {
        return;
    }
    if (GuildData.listing.type == "blacklist" && GuildData.listing.channels.has(ChannelId)) {
        return;
    }

    var words = Message.content.split(' ').length;
    var chars = Message.content.replaceAll(" ", "").length;
    var attachments = Message.attachments.size;

    incrementGuildCurrentHour(GuildId);
    incrementUserHour(User.id, GuildId);
    incrementUserStats(User.id, GuildId, words, chars, attachments);
};


function incrementUserHour(user_id: string, guild_id: string) {
    var ymd = moment().format("YYYYMMDD");
    var hour = moment().format("H");

    Database()('message_counter')
        .increment(hour, 1)
        .where({
            user_id: user_id,
            guild_id: guild_id,
            ymd: ymd
        })
        .then((rows) => {
            if (rows <= 0) {
                InsertUserDay(user_id, guild_id);
            }
        })
        .catch(err => {
            (err);
        });
}

function incrementUserStats(user_id: string, guild_id: string, words: number, chars: number, attachments: number) {
    Database()('message_counter_user_stats')
        .where({
            user_id: user_id,
            guild_id: guild_id
        })
        .increment(
            "total_messages", 1
        )
        .increment(
            "total_words", words,
        )
        .increment(
            "total_chars", chars,
        )
        .increment(
            "total_attachments", attachments
        )
        .update({ last_message_timestamp: moment().valueOf() })
        .then((rows) => {
            if (rows <= 0) {
                InsertUserStats(user_id, guild_id, words, chars, attachments);
            }
        })
        .catch(err => {
            logger.info(err);
        });
}

function incrementGuildCurrentHour(guild_id) {
    let hour = moment().format("H");

    Database()('message_counter_guilds')
        .where({
            guild_id: guild_id,
            ymd: moment().format("YYYYMMDD")
        })
        .increment(hour, 1)
        .then((rows) => {
            if (rows <= 0) {
                InsertGuildDay(guild_id);
            }
        })
        .catch(err => {
            logger.info(err);
        });
}

function InsertUserDay(user_id: string, guild_id: string) {
    var ymd = moment().format("YYYYMMDD");
    var hour = moment().format("H");

    Database()('message_counter')
        .insert({
            user_id: user_id,
            guild_id: guild_id,
            ymd: ymd,
            [hour]: 1
        })
        .then((rows) => {
            if (rows.length <= 0) {
                throw new Error("Message Counter InsertUserDay Cant insert");
            }
        })
        .catch(err => {
            logger.info(err);
        });
}

function InsertUserStats(user_id: string, guild_id: string, words: number, chars: number, attachments: number) {
    let timestamp = moment().valueOf();
    Database()('message_counter_user_stats')
        .insert({
            user_id: user_id,
            guild_id: guild_id,
            random_quote_last_update: timestamp,
            created_timestamp: timestamp,
            last_message_timestamp: timestamp,
            total_messages: 1,
            total_words: words,
            total_chars: chars,
            total_attachments: attachments
        })
        .then((rows) => {
            if (rows.length <= 0) {
                throw new Error("Message Counter InsertUserStats Cant insert");
            }
        })
        .catch(err => {
            logger.info(err);
        });
}

function InsertGuildDay(guild_id: string) {
    let hour = moment().format("H");
    Database()('message_counter_guilds')
        .insert({
            guild_id: guild_id,
            ymd: moment().format("YYYYMMDD"),
            [hour]: 1
        })
        .then((rows) => {
            if (rows.length <= 0) {
                throw new Error("Message Counter InsertGuildDay Cant insert");
            }
        })
        .catch(err => {
            logger.info(err);
        });
}