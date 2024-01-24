import { LinkChangerSettings } from "@/@types/database";
import { LinkChanger } from "@/@types/config";
import { Embed, Events, Message } from "discord.js";

import { Client } from "@core/Bot";
import ModuleManager from "@core/ModuleManager";
import Config from "@core/Config";
import EventsManager from "@core/EventsManager";

import logger from "@includes/logger";
import { Database } from "@includes/database";

import { ModuleBuilder, wait } from "@utils/index"

type Url = {
    type: "delete" | "reply";
    removeText: boolean;
    domain: string;
    tld: string;
    domainChangeTo: string;
    checkEmbed: boolean;
    tldChangeTo: string;
    bots: boolean;
}

function createNewSettingsArray(oldArray: LinkChangerSettings[]): Url[] {
    return oldArray.map((el) => ({
        type: el.type,
        removeText: el.remove_text,
        domain: el.domain,
        domainChangeTo: el.domain_change_to,
        checkEmbed: el.check_embed,
        tld: el.tld,
        tldChangeTo: el.tld_change_to,
        bots: el.bots,
    }));
}

const cfg = {
    template: {
        enabled: false
    },
    sql: [
        (guildsArray) => Database().from("link_changer_domains").whereIn('guild_id', guildsArray).andWhere("on", 1),
        (guildsArray) => Database().from("modules_settings").whereIn('guild_id', guildsArray).andWhere("module_name", "linkChanger")
    ],
    prepareData(GuildsIds: string[], data: any[]) {
        var GuildsSettings = new Map();

        for (const GuildId of GuildsIds) {
            let module = data[1].find((el) => el.guild_id == GuildId);
            let db: LinkChangerSettings[] = data[0].filter((el) => el.guild_id == GuildId);
            let urls = createNewSettingsArray(db);
            let settings: LinkChanger = {
                enabled: module.enabled,
                urls: urls
            }
            GuildsSettings.set(GuildId, settings);
        }
        return GuildsSettings
    }
}


function detectURLToReplace(url: string, object: { domain: string, tld: string, domainChangeTo: string, tldChangeTo: string }): boolean {
    const { domain, tld } = object;

    // Construct the regular expression pattern dynamically
    const pattern = new RegExp(`(^|\\s)(https?:\\/\\/)(www\\.)?${domain}\\.${tld}(\\S*)`, 'i');

    // Test if the URL matches the pattern
    return pattern.test(url);
}

function detectURLs(text): boolean {
    const pattern = /(https?:\/\/[^\s]+)/gi;
    return pattern.test(text);
}

function replaceDomain(url: string, object: { domain: string, tld: string, domainChangeTo: string, tldChangeTo: string }): string {
    const { domain, tld, domainChangeTo, tldChangeTo } = object;

    // Construct the regular expression pattern dynamically
    const pattern = new RegExp(`(^|\\s)(https?:\\/\\/)(www\\.)?${domain}\\.${tld}(\\S*)`, 'gi');

    // Replace the matched URLs with the modified domain
    const replacedURL = url.replace(pattern, `$1$2$3${domainChangeTo}.${tldChangeTo}$4`);

    return replacedURL;
}

function extractURLsFromString(text: string): string {
    const pattern = /(https?:\/\/[^\s]+)/gi;
    const matches = text.match(pattern);
    return matches.join("\n") || "";
}

function processText(Message: Message, url: Url): void {
    let data = { domain: url.domain, tld: url.tld, domainChangeTo: url.domainChangeTo, tldChangeTo: url.tldChangeTo };
    if (detectURLToReplace(Message.content, data) && url.bots && Message.author.id !== Client.user.id) {
        let replacedText = replaceDomain(Message.content, data);
        replacedText = url.removeText ? extractURLsFromString(replacedText) : replacedText;

        if (url.type == "reply") {
            Message.reply({ content: replacedText, allowedMentions: { repliedUser: false } })
                .catch((e) => {
                    console.log("LinkChanger: Original Message:");
                    console.log(Message.content);
                    console.log("replacedText:");
                    console.log(replacedText);
                    logger.error("LinkChanger: Error while repling to message")
                    logger.error(JSON.stringify(e))
                });
        }
        if (url.type == "delete") {
            Message.channel.send({ content: replacedText, allowedMentions: { repliedUser: false } })
                .catch((e) => {
                    console.log("LinkChanger: Original Message:");
                    console.log(Message.content);
                    console.log("replacedText:");
                    console.log(replacedText);
                    logger.error("LinkChanger: Error while sending message to channel")
                    logger.error(JSON.stringify(e))
                });
            Message.delete().catch((e) => {
                logger.error("LinkChanger: Error while deleting message")
                logger.error(JSON.stringify(e))
            });
        }
    }
}

async function processMessage(Message: Message): Promise<void> {
    if (Message.inGuild() && detectURLs(Message.content)) {
        const Settings = Config.getGuildConfig(Message.guildId).LinkChanger;
        if (!Settings.enabled) {
            return;
        }
        await wait(1500);
        for (const url of Settings.urls) {
            if (!isEmbeds(Message.embeds, url)) {
                processText(Message, url);
            }
        }
    }
}

function isEmbeds(Embeds: Embed[], url: Url): boolean {
    var isValid = false;
    if (url.checkEmbed && Embeds.length > 0) {
        for (const embed of Embeds) {
            console.log("embed:");
            console.log(embed);
            if (embed.data.url || embed.data.title || embed.data.description) {
                isValid = true;
            }
        }
    }
    return isValid;
}


const module = new ModuleBuilder();

module.setConfig(cfg.sql, cfg.template, cfg.prepareData);
module.setExecute(() => {
    logger.info("Link Changer");
    EventsManager.addEventTask(Events.MessageCreate, processMessage);
});

ModuleManager.addModule("LinkChanger", module.cfg, module.execute);