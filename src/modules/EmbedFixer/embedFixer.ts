import { Message } from "discord.js";

import { processInstagram } from "./instagram.js";
import { processTwitter } from "./twitter.js";

import logger from "../../services/logger/index.js";

import { EmbedFixerReply } from "../../types/embedFixer.js";


function extractURLsFromString(text: string): string[] | null {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    return text.match(urlRegex) || null;
}

async function sendReply(Message: Message, reply: EmbedFixerReply): Promise<void> {
    logger?.debug("[Embed Fixer] Send Reply");
    if (!Message.channel.isSendable()) {
        logger?.debug("[Embed Fixer] Channel not sendable  " + Message.channel.id);
        return;
    }
    logger?.debug("[Embed Fixer] Channel sendable  " + Message.channel.id);
    if (reply.content) {
        let messageData = {
            content: reply.content,
            // if there is an embed, we need to send it as an array
            embeds: reply.embed ? [reply.embed] : []
        }
        if (reply.supressEmbeds) {
            logger?.debug("[Embed Fixer] Supress Embeds");
            Message.suppressEmbeds(true);
        }
        if (messageData.embeds.length > 0) {
            logger?.debug("[Embed Fixer] Message with Embed");
            await Message.reply({ content: "", embeds: messageData.embeds, allowedMentions: { repliedUser: false } })
                .then((_msg) => {
                    logger?.debug("[Embed Fixer] Message Sent");
                    logger?.debug("[Embed Fixer] Message without Embed");
                    _msg.reply({ content: messageData.content, allowedMentions: { repliedUser: false } });
                })
                .catch((e) => {
                    logger?.error("[Embed Fixer] Error while repling to message");
                    logger?.error(JSON.stringify(e));
                });
        } else {
            logger?.debug("[Embed Fixer] Message without Embed");
            await Message.reply({ content: messageData.content, allowedMentions: { repliedUser: false } })
                .catch((e) => {
                    logger?.error("[Embed Fixer] Error while sending message to channel");
                    logger?.error(JSON.stringify(e));
                });
        }
    }
}

export async function processMessage(Message: Message): Promise<void> {
    logger?.debug("[Embed Fixer] Get Message " + Message.content);
    if (Message.author.bot) {
        // if the message is from a bot, we don't need to process it
        return;
    }
    logger?.debug("[Embed Fixer] Guild Message");
    let urls = extractURLsFromString(Message.content)
    if (!urls) {
        logger?.debug("[Embed Fixer] No URLs");
        return;
    }
    logger?.debug("[Embed Fixer] URLs " + urls.length);
    logger?.debug(urls);

    for (const url of urls) {
        let data = new URL(url);
        logger?.debug("[Embed Fixer] Data:{");
        console.log(data);
        logger?.debug("[Embed Fixer] }");
        let reply: EmbedFixerReply | undefined = undefined;
        // if there is no pathname, we can't do anything
        if (data.pathname == "/") {
            logger?.debug("[Embed Fixer] No Pathname");
            continue;
        }
        // remove the www. from the hostname
        let hostname = data.hostname.startsWith("www.") ? data.hostname.slice(4) : data.hostname;

        logger?.debug("[Embed Fixer] Pathname " + data.pathname);
        logger?.debug("[Embed Fixer] Hostname " + hostname);

        // check the hostname and process the data
        switch (hostname) {
            case "instagram.com":
                logger?.debug("[Embed Fixer] Instagram");
                reply = await processInstagram(data);
                break;
            case "twitter.com":
                logger?.debug("[Embed Fixer] Twitter");
                reply = await processTwitter(data);
                break;
            case "x.com":
                logger?.debug("[Embed Fixer] X");
                reply = await processTwitter(data);
                break;
            case "facebook.com":
                console.log("Facebook");
                break;
            case "telegram.com":
                console.log("Telegram");
                break;
        }
        // if we have a reply, send it
        if (reply) {
            logger?.debug("[Embed Fixer] Reply");
            sendReply(Message, reply);
        }
        logger?.debug("[Embed Fixer] End");
    }
}