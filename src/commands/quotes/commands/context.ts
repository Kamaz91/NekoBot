import { MessageContextMenuCommandInteraction, SnowflakeUtil } from "discord.js";
import logger from "../../../services/logger/index.js";
import Config from "../../../core/Config.js";
import { buildInteractionComponents, Buttons, createFieldTemplate, embedBuildFields, getAttachmentsURLs } from "../utility.js";
import Store from "../../../store/quotes.js";
import { wait } from "../../../utils/index.js";
import { QuoteData } from "../../../types/quotes.js";
import { log } from "console";

// Quote create or add line
export async function ContextMenuExecute(interaction: MessageContextMenuCommandInteraction) {
    const Settings = Config.getGuildConfig(interaction.guildId).Quotes;

    try {
        if (!Settings.enabled) {
            interaction.reply({ content: "Quotes not enabled on this server", flags: ["Ephemeral"] })
                .catch(error => {
                    logger?.error("[Quotes] [ContextMenuExecute] Cant reply! " + interaction.commandName);
                    logger?.error(JSON.stringify(error));
                });
            return;
        }

        // if message is empty and no attachments then abort
        if (interaction.targetMessage.content.length == 0 && interaction.targetMessage.attachments.size == 0) {
            interaction.reply({ content: "Message is somehow empty", flags: ["Ephemeral"] })
                .catch(error => {
                    logger?.error("[Quotes] [ContextMenuExecute] Cant reply! " + interaction.commandName);
                    logger?.error(JSON.stringify(error));
                });
            return;
        }

        let Content: string = interaction.targetMessage.content;
        Content += getAttachmentsURLs(interaction.targetMessage.attachments);

        let element = Store.getElementByUserAndGuild(interaction.user.id, interaction.guildId);

        // if element is not set create new element
        if (!element) {
            // id for element
            let elementId = SnowflakeUtil.generate().toString();
            // 15 minutes timeout
            let ElementTimeout = 15 * 60 * 1000;
            // data for element
            let elementData: QuoteData = {
                Id: elementId,
                Interaction: interaction,
                guildId: interaction.guildId,
                userId: interaction.user.id,
                Quote: {
                    title: "Quotes",
                    fields: [],
                    messageLink: interaction.targetMessage.url
                }
            }
            // add element to store
            Store.addElement(elementId, elementData, ElementTimeout);
            // get created element from store
            element = Store.getElement(elementId);

            logger.debug("[Quotes] [ContextMenuExecute] Element Created");
            logger.debug(`[Quotes] [ContextMenuExecute] id:${element.Id}`);
            logger.debug(elementData);
        }

        // 
        element.Quote.fields.push(createFieldTemplate(interaction.targetMessage.author.username, interaction.targetMessage.author.id, Content));

        // if quote fields size is 1 and not replied
        if (element.Quote.fields.length == 1 && !element.Interaction.replied) {
            let embed = embedBuildFields(element.Quote, element.Quote.messageLink, interaction.user.displayAvatarURL({ size: 64 }));
            let components = buildInteractionComponents(element, Buttons);

            element.Interaction.reply({ embeds: [embed], components: [components], flags: ["Ephemeral"] })
                .catch(error => {
                    logger?.error("[Quotes] [ContextMenuExecute] Cant reply! " + interaction.commandName);
                    logger?.error(JSON.stringify(error));
                });
        } else {
            // if quote fields size is greater than 1
            let embed = embedBuildFields(element.Quote, element.Quote.messageLink, interaction.user.displayAvatarURL({ size: 64 }));
            element.Interaction.editReply({ embeds: [embed] })
                .catch(error => {
                    logger?.error("[Quotes] [ContextMenuExecute] Cant editReply! " + interaction.commandName);
                    logger?.error(JSON.stringify(error));
                });
            // added new line, send reply
            interaction.reply({ content: "Added!", flags: ["Ephemeral"] })
                .catch(error => {
                    logger?.error("[Quotes] [ContextMenuExecute] Cant reply! " + interaction.commandName);
                    logger?.error(JSON.stringify(error));
                });
            // wait 4 seconds and delete reply
            await wait(4000, () => {
                interaction.deleteReply()
                    .catch(error => {
                        logger?.error("[Quotes] [ContextMenuExecute] Cant deleteReply! " + interaction.commandName);
                        logger?.error(JSON.stringify(error));
                    });
            });
        }
    } catch (error) {
        logger?.error("[Quotes] [ContextMenuExecute] Context Command Execute error");
        logger?.error(error);
        interaction.reply({ content: "Can't handle this message in quote", flags: ["Ephemeral"] });
    }
}