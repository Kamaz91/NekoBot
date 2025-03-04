import { ChatInputCommandInteraction } from "discord.js";
import Config from "../../../core/Config.js";
import logger from "../../../services/logger/index.js";
import { buildInteractionComponents, Buttons, embedBuildFields, getGuildMember } from "../utility.js";
import Store from "../../../store/quotes.js";
import { DeleteQuoteTemplate } from "./button.js";
import { Quote } from "../../../types/database.js";
import { getQuote } from "../database.js";

export async function mainCommand(interaction: ChatInputCommandInteraction) {
    const Settings = Config.getGuildConfig(interaction.guildId).Quotes;
    if (!Settings.enabled) {
        interaction.reply({ content: "Quotes not enabled on this server", ephemeral: true })
            .catch(error => {
                logger?.error("Quotes: Cant reply! " + interaction.commandName);
                logger?.error(JSON.stringify(error));
                return 0;
            });
        return;
    }
}

export async function SlashCommandShow(interaction?: ChatInputCommandInteraction, id?) {
    if (!interaction) {
        throw "No Interaction Object";
    }
    const quotePosition = interaction.options.get("quote-position");
    var quote: Quote;

    if (quotePosition?.value) {
        quote = await getQuote(interaction.guildId, quotePosition.value);
    } else {
        quote = await getQuote(interaction.guildId);
    }
    if (!quote) {
        interaction.reply({ content: "Quote Not exist", ephemeral: true })
            .catch(error => {
                logger?.error("Quotes: Cant reply! " + interaction.commandName);
                logger?.error(JSON.stringify(error));
            });
        return;
    }

    let quoteAuthor = await getGuildMember(quote.user_id, interaction.guildId);
    let embed = embedBuildFields(quote.data, quote.data.messageLink, quoteAuthor.avatar || "", quote.created_timestamp);
    embed.setDescription("Quote by: " + quoteAuthor.nickname);
    embed.setFooter({ text: "Quote No. " + quote.quote_guild_position });
    interaction.reply({ embeds: [embed] })
        .catch(error => {
            logger?.error("Quotes: Cant reply! " + interaction.commandName);
            logger?.error(JSON.stringify(error));
        });
}

export async function SlashCommandShowEmbed(interaction?: ChatInputCommandInteraction) {
    try {
        if (!interaction) {
            throw ("Interaction is undefined");
        }
        var UserQuote = Store.getElementByUserAndGuild(interaction.user.id, interaction.guildId);
        //getGuildData(interaction.guildId, interaction.user.id);
        if (!UserQuote) {
            throw ("UserQuote is undefined");
        }
        let embed = embedBuildFields(UserQuote.Quote, UserQuote.Quote.messageLink, interaction.user.displayAvatarURL({ size: 64 }));
        let components = buildInteractionComponents(UserQuote, Buttons);

        interaction.reply({ embeds: [embed], components: [components], flags: ["Ephemeral"] })
            .then(reply => {
                if (!UserQuote) {
                    throw ("UserQuote is undefined");
                }
                if (typeof interaction.guildId != "string") {
                    throw ("guildId is undefined");
                }
                UserQuote.Interaction = interaction;
                Store.editElement(UserQuote.Id, UserQuote);
            })
            .catch(error => {
                logger?.error("Quotes: Cant reply! " + interaction.commandName);
                logger?.error(JSON.stringify(error));
            });

    } catch (error) {
        interaction.reply({ content: "No templates found", flags: ["Ephemeral"] });
        logger?.error("Quotes: No templates found! " + interaction.commandName);
        logger?.error(JSON.stringify(error));
    }
}

export async function SlashCommandDelete(interaction?: ChatInputCommandInteraction) {
    if (!interaction) {
        throw ("Interaction is undefined");
    }
    try {
        const UserQuote = Store.getElementByUserAndGuild(interaction.user.id, interaction.guildId);
        if (DeleteQuoteTemplate(interaction, UserQuote?.Id, "Quote Aborted")) {
            interaction.reply({ content: "Template deleted", ephemeral: true });
        }
    } catch (error) {
        interaction.reply({ content: "No templates found", ephemeral: true });
        logger?.error("Quotes: No templates found! " + interaction.commandName);
        logger?.error(JSON.stringify(error));
    }
}
