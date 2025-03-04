import { ActionRowBuilder, Attachment, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, CommandInteraction, EmbedBuilder, MessageContextMenuCommandInteraction, ModalSubmitInteraction, SnowflakeUtil, User } from "discord.js";
import { Client } from "../../core/Bot.js";

import logger from "../../services/logger/index.js";
import { ButtonTemplate, QuoteContent, QuoteData, guildId } from "../../types/quotes.js";
import Store from "../../store/quotes.js";

export const Buttons: ButtonTemplate[] = [
    {
        id: "quote:delete-button",
        name: "Delete Quote",
        style: ButtonStyle.Danger
    },
    {
        id: "quote:save-button",
        name: "Save Quote!",
        style: ButtonStyle.Primary
    },
    {
        id: "quote:remove-button",
        name: "Remove last quote line",
        style: ButtonStyle.Secondary
    },
    {
        id: "quote:title-button",
        name: "Change Quote Title",
        style: ButtonStyle.Secondary
    }
];

export function embedBuildFields(data: QuoteContent, messageLink: string, iconURL: string, timestamp?: number | Date) {
    var embed = new EmbedBuilder()
        .setAuthor({ name: data.title, iconURL: iconURL, url: messageLink })
        .setTimestamp(timestamp ? timestamp : new Date());

    for (const field of data.fields) {
        if (field.name && field.content) {
            embed.addFields({ name: field.name, value: field.content });
        } else {
            logger?.error(`Quotes: Fields are wrong`);
            logger?.error(JSON.stringify(field));
        }
    }
    return embed;
}

export function isInteractionCustomIdValid(customId: string): boolean {
    try {
        let GuildData = Store.getElement(customId);
        return GuildData?.Id == customId ? true : false;
    } catch (error) {
        return false;
    }
}

export function createQuoteTemplateHolder(interaction: MessageContextMenuCommandInteraction, text: string, userId: string, username: string): QuoteData {
    let id = SnowflakeUtil.generate().toString();
    let fields: {
        name: string,
        content: string
    }[] = new Array();

    let field = createFieldTemplate(username, userId, text);
    if (field) {
        fields.push(field);
    }

    return { Interaction: interaction, Id: id, userId: userId, guildId: interaction.guildId, Quote: { title: "Untitled quote", messageLink: interaction.targetMessage.url, fields: fields } };
}

export function createFieldTemplate(username: string, userId: string, text: string): {
    name: string,
    content: string
} {
    return { name: `${username}`, content: text };
}

export function getAttachmentsURLs(attachments: Collection<string, Attachment>) {
    let Content = "";
    for (const [, attachment] of attachments) {
        Content += "\n" + attachment.url;
    }
    return Content;
}

export function DeleteQuoteTemplateData(QuoteData: QuoteData, message: string) {
    QuoteData.Interaction.editReply({ content: message, embeds: [], components: [] });
    Store.removeElement(QuoteData.Id);
}

export function buildInteractionComponents(QuoteData: QuoteData, Buttons: ButtonTemplate[]) {
    let row = new ActionRowBuilder<ButtonBuilder>();
    let rowComponents: ButtonBuilder[] = new Array();

    for (const [, button] of Object.entries(Buttons)) {
        let buttonBuilder = new ButtonBuilder().setCustomId(`${button.id}:<${QuoteData.Id}>`).setStyle(button.style).setLabel(button.name);
        rowComponents.push(buttonBuilder);
    }

    return row.addComponents(rowComponents);
}

export async function getGuildMember(userId, guildId) {
    let user = await (await Client.guilds.fetch(guildId)).members.fetch(userId);
    if (user) {
        return { nickname: user.nickname, avatar: user.displayAvatarURL({ size: 64 }) };
    }
    return { nickname: "User not found", avatar: Client.user?.displayAvatarURL({ size: 64 }) };
}