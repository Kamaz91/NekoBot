import { ChatInputCommandInteraction, ButtonInteraction, Message } from "discord.js";
import { addReactions, removeReactions, createResponseMessage, filterMessages } from "../utils.js";

import logger from "../../../services/logger/index.js";

const Timeout = 60_000 * 5; // Timeout to wait for confirmation (5 minutes)

async function mainCommand(interaction: ChatInputCommandInteraction) {
    return;
}

async function deleteAnyMessages(interaction?: ChatInputCommandInteraction) {
    if (!interaction) return;
    let limit = interaction.options.getNumber("limit") || 1;
    let messagesCache = interaction.channel?.messages.cache;

    logger?.debug(`[deleteAnyMessages] -> [deleteAnyMessages] limit:${limit}`);

    let filters: ((message: Message) => boolean)[] = [];
    filters.push((message) => message.deletable); // Ignore messages that cannot be deleted
    filters.push((message) => !message.flags.has(["Ephemeral"])); // Ignore ephemeral messages

    const filteredMessages = messagesCache.filter(message => filters.every(filter => filter(message))).last(limit);
    if (filteredMessages.length === 0) {
        interaction.reply({ content: `No messages found. cache size ${interaction.channel?.messages.cache.size}`, flags: ["Ephemeral"] });
        return;
    }

    let reactionAddTask = addReactions(filteredMessages);
    let responseContent = createResponseMessage(interaction, filteredMessages, null, "any");

    const response = await interaction.reply({
        embeds: responseContent.embeds,
        ephemeral: true,
        components: responseContent.components,
        withResponse: true,
    });

    const collectorFilter = i => i.user.id === interaction.user.id;
    try {
        if (!response.resource || !response.resource.message) {
            await interaction.editReply({ content: 'Failed to retrieve confirmation message.', components: [] });
            return;
        }
        const confirmation: ButtonInteraction | null = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: Timeout })
            .catch(err => {
                logger?.error(err);
                return null;
            });

        if (!confirmation) {
            await interaction.editReply({ content: 'Confirmation not received within 5 minutes, cancelling', components: [] });
            removeReactions(filteredMessages);
            return;
        }

        logger?.debug(`[deleteAnyMessages] -> [deleteAnyMessages] confirmation:${confirmation.customId}`);

        if (confirmation.customId === 'confirm') {
            await interaction.editReply({ components: [] });
            let deletedCount = await interaction.channel.bulkDelete(filteredMessages, true);
            //let deletedCount = await proceedDeletingMessages(filteredMessages);
            await interaction.editReply({ content: `Deleted ${deletedCount.size} messages.`, components: [] });
        } else if (confirmation.customId === 'cancel') {
            removeReactions(filteredMessages);
            await interaction.editReply({ content: 'Action cancelled', components: [] });
        }
    } catch (e) {
        removeReactions(filteredMessages);
        logger?.error(`[deleteAnyMessages] -> [deleteAnyMessages]`);
        logger?.error(e);
    }
}

async function deleteMessagesWithFilters(interaction?: ChatInputCommandInteraction) {
    if (!interaction) return;
    let limit = interaction.options.getNumber("limit") || 1;
    let filterOptions = interaction.options.getString("filter");
    let targetUser = interaction.options.getUser("user");
    let messagesCache = interaction.channel?.messages.cache;

    logger?.debug(`[deleteMessagesWithFilters] -> [deleteMessagesWithFilters] limit:${limit} filterOptions:${filterOptions} targetUser:${targetUser}`);

    if (messagesCache && filterOptions) {
        const filteredMessages = filterMessages(messagesCache, filterOptions, targetUser?.id).last(limit);

        if (filteredMessages.length === 0) {
            interaction.reply({ content: `No messages found matching the filters. cache size ${interaction.channel?.messages.cache.size}`, flags: ["Ephemeral"] });
            return;
        }

        let reactionAddTask = addReactions(filteredMessages);
        let responseContent = createResponseMessage(interaction, filteredMessages, targetUser, filterOptions);

        const response = await interaction.reply({
            embeds: responseContent.embeds,
            ephemeral: true,
            components: responseContent.components,
            withResponse: true,
        });

        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            if (!response.resource || !response.resource.message) {
                await interaction.editReply({ content: 'Failed to retrieve confirmation message.', components: [] });
                return;
            }
            const confirmation: ButtonInteraction | null = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: Timeout })
                .catch(err => {
                    logger?.error(err);
                    return null;
                });

            if (!confirmation) {
                await interaction.editReply({ content: 'Confirmation not received within 5 minutes, cancelling', components: [] });
                removeReactions(filteredMessages);
                return;
            }

            logger?.debug(`[deleteMessagesWithFilters] -> [deleteMessagesWithFilters] confirmation:${confirmation.customId}`);

            if (confirmation.customId === 'confirm') {
                await interaction.editReply({ components: [] });
                let deletedCount = await interaction.channel.bulkDelete(filteredMessages, true);
                //let deletedCount = await proceedDeletingMessages(filteredMessages);
                await interaction.editReply({ content: `Deleted ${deletedCount.size} messages.`, components: [] });
            } else if (confirmation.customId === 'cancel') {
                removeReactions(filteredMessages);
                await interaction.editReply({ content: 'Action cancelled', components: [] });
            }
        } catch (e) {
            removeReactions(filteredMessages);
            logger?.error(`[deleteMessagesWithFilters] -> [deleteMessagesWithFilters]`);
            logger?.error(e);
        }
    } else {
        interaction.reply({ content: "No messages to delete.", flags: ["Ephemeral"] });
    }
}

async function cacheSizeCommand(interaction?: ChatInputCommandInteraction) {
    if (!interaction) return;
    let messagesCache = interaction.channel?.messages.cache;
    if (messagesCache) {
        interaction.reply({ content: `Cache size: ${messagesCache.size}`, flags: ["Ephemeral"] });
    } else {
        interaction.reply({ content: "No messages to delete.", flags: ["Ephemeral"] });
    }
}

export default {
    mainCommand,
    cacheSizeCommand,
    deleteMessagesWithFilters,
    deleteAnyMessages
}