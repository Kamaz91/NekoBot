import { ButtonInteraction, ChatInputCommandInteraction, MessageContextMenuCommandInteraction, ModalSubmitInteraction, Snowflake } from "discord.js";
import { InteractionObject } from "../../includes/InteractionObject.class.js";

import { mainCommand, SlashCommandShow, SlashCommandShowEmbed, SlashCommandDelete } from "./commands/main.js";
import { ContextMenuExecute } from "./commands/context.js";
import { DeleteQuoteTemplate, SaveQuoteTemplateToDatabase, SendModal, removeLastLine } from "./commands/button.js";
import { changeTitle } from "./commands/modal.js";

export default [
    new InteractionObject<ChatInputCommandInteraction>("quote")
        .setExecutable(mainCommand)
        .setCheckIfEnabled("Quotes")
        .addSubOption("show", SlashCommandShow)
        .addSubOption("show-embed", SlashCommandShowEmbed)
        .addSubOption("delete-template", SlashCommandDelete),

    new InteractionObject<MessageContextMenuCommandInteraction>("quote-create")
        .setExecutable(ContextMenuExecute)
        .setCheckIfEnabled("Quotes"),

    new InteractionObject<ButtonInteraction>("quote:delete-button")
        .setExecutable(async (interaction: ButtonInteraction, id?: Snowflake) => { DeleteQuoteTemplate(interaction, id, "Quote Aborted") })
        .setCheckIfEnabled("Quotes"),

    new InteractionObject<ButtonInteraction>("quote:save-button")
        .setExecutable(SaveQuoteTemplateToDatabase)
        .setCheckIfEnabled("Quotes"),

    new InteractionObject<ButtonInteraction>("quote:remove-button")
        .setExecutable(removeLastLine)
        .setCheckIfEnabled("Quotes"),

    new InteractionObject<ButtonInteraction>("quote:title-button")
        .setExecutable(SendModal)
        .setCheckIfEnabled("Quotes"),

    new InteractionObject<ModalSubmitInteraction>("quote:modal-submit")
        .setExecutable(changeTitle)
        .setCheckIfEnabled("Quotes")
];