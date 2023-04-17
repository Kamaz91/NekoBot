import { ApplicationCommandType, CommandInteraction, ContextMenuCommandBuilder, Embed, EmbedBuilder, Guild, MessageContextMenuCommandInteraction, SlashCommandBuilder } from "discord.js";
import logger from "../includes/logger";

interface quoteData {
    interaction: MessageContextMenuCommandInteraction;
    fields: [{
        name: string,
        content: string
    }];
    title: string;

}

const name = "quotes";

var quoteData: Map<String, Map<string, quoteData>> = new Map();

var def = [
    new ContextMenuCommandBuilder()
        .setName(name)
        .setDMPermission(false)
        .setType(ApplicationCommandType.Message),
    new SlashCommandBuilder()
        .setName(name)
        .setDescription("Quotes")
        .setDMPermission(false)
];

function embedBuild(data: quoteData) {
    var embed = new EmbedBuilder()
        .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
        .setDescription('Some description here')
        .setTimestamp(1642593605);

    for (const field of data.fields) {
        embed.addFields({ name: field.name, value: field.content });
    }

    return embed;
}

async function execute(interaction: CommandInteraction) {
    try {
        // if guild and user are not set
        if (interaction.isMessageContextMenuCommand() && !quoteData.has(interaction.guildId)) {
            let usersMap: Map<string, quoteData> = new Map();
            let data: quoteData = { interaction: interaction, title: "Untitled quote", fields: [{ name: interaction.targetMessage.author.username, content: interaction.targetMessage.content }] };

            usersMap.set(interaction.user.id, data);
            quoteData.set(interaction.guildId, usersMap);

            let embed = embedBuild(data);
            interaction.reply({ embeds: [embed], ephemeral: true })
                .catch(logger.info);

            return;
        }
        // if guild is set but not user
        if (interaction.isMessageContextMenuCommand() && !quoteData.get(interaction.guildId).has(interaction.user.id)) {
            let guildMap = quoteData.get(interaction.guildId);
            let data: quoteData = { interaction: interaction, title: "Untitled quote", fields: [{ name: interaction.targetMessage.author.username, content: interaction.targetMessage.content }] };

            guildMap.set(interaction.user.id, data);

            let embed = embedBuild(data);
            interaction.reply({ embeds: [embed], ephemeral: true })
                .catch(logger.info);
            return;
        }
        // if guild and user are set
        if (interaction.isMessageContextMenuCommand() && quoteData.get(interaction.guildId).has(interaction.user.id)) {
            let Userdata = quoteData.get(interaction.guildId).get(interaction.user.id);
            Userdata.fields.push({ name: interaction.targetMessage.author.username, content: interaction.targetMessage.content });

            let embed = embedBuild(Userdata);
            Userdata.interaction.editReply({ embeds: [embed] });
            interaction.reply({ content: "Added!", ephemeral: true })
                .catch(logger.info);
            interaction.deleteReply()
                .catch(logger.info);
            return;
        }
    } catch (error) {
        logger.error(error);
    }
}

export default {
    def, execute, name
}

// TODO

//! Wyświetlanie quota jako embed z możliwością przewijania przyciskami (następny, poprzedni) wszystko jako ukryte
//* dodawanie quota prawym klikiem z menu Aplikacje (łączenie kilku wiadomości w ten sposób)
//! sprawdzanie czy wiadomość jest pusta, zakaz (embedów, wiadomości botów?, obrazków)
//! przy wyświetlaniu quote przycisk na dole skocz do pierwszej wiadomości (message url)