import { Message, ChatInputCommandInteraction, User, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } from "discord.js";
import logger from "./../../services/logger/index.js";

export async function addReactions(Messages: Message[]) {
    for (const message of Messages) {
        message.react("❗").catch(err => logger?.error(err));
    }
}

export function removeReactions(Messages: Message[]) {
    for (const message of Messages) {
        if (message.deletable) {
            message.reactions.cache.get("❗")?.remove().catch(err => logger?.error(err));
        }
    }
}

export function createResponseMessage(interaction: ChatInputCommandInteraction, filteredMessages: Message[], targetUser: User, filter: string) {
    const embed = new EmbedBuilder()
        .setTitle("Filtered Messages")
        .setDescription(`Found ${filteredMessages.length} messages matching the filters.`)
        .addFields(
            { name: "Oldest Message", value: filteredMessages[0].url, inline: true },
            { name: "User", value: targetUser ? targetUser.username : "All Users", inline: true },
            { name: "Filter", value: filter, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary),
        );

    return {
        embeds: [embed],
        components: [row]
    };
}

export function filterMessages(messages: Collection<string, Message>, filterOptions: string, targetUser?: string) {
    let filters: ((message: Message) => boolean)[] = [];
    filters.push((message) => message.deletable); // Ignore messages that cannot be deleted
    filters.push((message) => !message.flags.has(["Ephemeral"])); // Ignore ephemeral messages

    if (filterOptions.includes("text")) {
        filters.push((message) => message.content.trim().length > 0);
    }
    if (filterOptions.includes("mentions-users")) {
        filters.push((message) => message.mentions.users.size > 0);
    }
    if (filterOptions.includes("mentions-roles")) {
        filters.push((message) => message.mentions.roles.size > 0);
    }
    if (filterOptions.includes("attachments")) {
        filters.push((message) => message.attachments.size > 0);
    }
    if (filterOptions.includes("images")) {
        filters.push((message) => message.attachments.some((attachment) =>
            attachment.contentType?.startsWith("image/")
        ));
    }
    if (filterOptions.includes("videos")) {
        filters.push((message) => message.attachments.some((attachment) =>
            attachment.contentType?.startsWith("video/")
        ));
    }
    if (filterOptions.includes("audio")) {
        filters.push((message) => message.attachments.some((attachment) =>
            attachment.contentType?.startsWith("audio/")
        ));
    }
    if (filterOptions.includes("files")) {
        filters.push((message) => message.attachments.some((attachment) =>
            !attachment.contentType?.startsWith("image/") &&
            !attachment.contentType?.startsWith("video/") &&
            !attachment.contentType?.startsWith("audio/")
        ));
    }
    if (filterOptions.includes("embeds")) {
        filters.push((message) => message.embeds.length > 0);
    }

    if (targetUser) {
        filters.push((message) => message.author.id === targetUser);
    }

    return messages.filter(message => filters.every(filter => filter(message)));
}