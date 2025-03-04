import { ActionRowBuilder, ButtonInteraction, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { DeleteQuoteTemplateData, embedBuildFields, isInteractionCustomIdValid } from "../utility.js";
import { AddQuoteToDatabase } from "../database.js";

import logger from "../../../services/logger/index.js";
import InteractionManager from "../../../core/InteractionManager.js";
import Store from "../../../store/quotes.js";

export function DeleteQuoteTemplate(Interaction: ButtonInteraction | ChatInputCommandInteraction, id: string, message: string): boolean {
    logger.debug(`[Quotes] [modal-button] id:${id}`);
    logger.debug(`[Quotes] [delete] isInteractionIdValid:${isInteractionCustomIdValid(id)}`);
    if (!isInteractionCustomIdValid(id)) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }
    logger.debug(`[Quotes] [delete-button] inGuild:${Interaction.inGuild()}`);
    if (!Interaction.inGuild()) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }
    try {
        let element = Store.getElementByUserAndGuild(Interaction.user.id, Interaction.guildId);
        DeleteQuoteTemplateData(element, message);
        return true;
    } catch (error) {
        logger?.error("Quotes: Cant Delete TemplateData");
        logger?.error(JSON.stringify(error));
        return;
    }
}

export async function SaveQuoteTemplateToDatabase(Interaction: ButtonInteraction, id?: string) {
    logger.debug(`[Quotes] [save-button] id:${id}`);
    logger.debug(`[Quotes] [save-button] isInteractionIdValid:${isInteractionCustomIdValid(id)}`);
    if (!isInteractionCustomIdValid(id)) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }
    logger.debug(`[Quotes] [save-button] inGuild:${Interaction.inGuild()}`);
    if (!Interaction.inGuild()) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }
    try {
        let UserQuote = Store.getElement(id);

        if (!UserQuote) {
            logger.error(`[Quotes] [save-button] UserQuote is undefined`);
            throw "UserQuote is undefined";
        }

        let quotePos = await AddQuoteToDatabase(Interaction.guildId, Interaction.user.id, UserQuote.Quote);
        logger.debug(`[Quotes] [save-button] quotePos:`, quotePos);
        if (quotePos == null) {
            Interaction.reply({ content: "Error while adding to Database.", flags: ["Ephemeral"] })
                .catch(error => {
                    logger?.error("[Quotes] [save-button] cant reply, saveQuoteTemplateToDatabase");
                    logger?.error(JSON.stringify(error));
                });
            logger?.error("Quotes: Error While adding quote to database");
            logger?.error(JSON.stringify(quotePos));
        } else {
            DeleteQuoteTemplateData(UserQuote, `Quote No. ${quotePos} Saved!`);
        }
    } catch (error) {
        logger?.error("[Quotes] [save-button] Error While saving quote");
        logger?.error(JSON.stringify(error));
        InteractionManager.sendInteractionNotExecutable(Interaction);
    }
}

export function removeLastLine(Interaction: ButtonInteraction, id?: string) {
    logger.debug(`[Quotes] [remove-button] id:${id}`);
    logger.debug(`[Quotes] [remove-button] isInteractionIdValid:${isInteractionCustomIdValid(id)}`);
    if (!isInteractionCustomIdValid(id)) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }
    logger.debug(`[Quotes] [remove-button] inGuild:${Interaction.inGuild()}`);
    if (!Interaction.inGuild()) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }
    let guildId = Interaction.guildId;

    if (typeof guildId != "string") {
        return;
    }

    let UserQuote = Store.getElement(id);

    if (!UserQuote) {
        return;
    }

    if (UserQuote.Quote.fields.length == 0) {
        Interaction.reply({ content: "Nothing to remove", flags: ["Ephemeral"] })
            .catch(error => {
                logger?.error("Quotes: cant reply, removeLastLine");
                logger?.error(JSON.stringify(error));
                return 0;
            });
        return;
    }

    Interaction.reply({ content: "Removed last Line", flags: ["Ephemeral"] })
        .catch(error => {
            logger?.error("Quotes: cant reply, removeLastLine");
            logger?.error(JSON.stringify(error));
            return 0;
        });

    UserQuote.Quote.fields.pop();
    let embed = embedBuildFields(UserQuote.Quote, UserQuote.Quote.messageLink, Interaction.user.displayAvatarURL({ size: 64 }));
    UserQuote.Interaction.editReply({ embeds: [embed] })
        .catch(error => {
            logger?.error("Quotes: cant editReply, removeLastLine");
            logger?.error(JSON.stringify(error));
            return 0;
        });
}

export function SendModal(Interaction: ButtonInteraction, id?: string) {
    logger.debug(`[Quotes] [modal-button] id:${id}`);
    logger.debug(`[Quotes] [modal-button] isInteractionIdValid:${isInteractionCustomIdValid(id)}`);
    if (!isInteractionCustomIdValid(id)) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }

    const Modals = {
        Title: {
            id: `quote:modal-submit:<${id}>`,
            name: "Quote Modal"
        }
    }
    var Modal = new ModalBuilder()
        .setCustomId(Modals.Title.id)
        .setTitle(Modals.Title.name);

    var QuoteTitleInput = new TextInputBuilder()
        .setCustomId(`title`)
        .setLabel("Quote Title")
        .setStyle(TextInputStyle.Short);

    Modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents([QuoteTitleInput]));

    Interaction.showModal(Modal);
}