import { ActionRowBuilder, Attachment, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, CommandInteraction, EmbedBuilder, Interaction, MessageContextMenuCommandInteraction, ModalBuilder, Snowflake, SnowflakeUtil, TextInputBuilder, TextInputStyle, User } from "discord.js";
import logger from "@includes/logger";
import { InteractionBuilder, Timer } from "@src/utils";
import InteractionManager from "@core/InteractionManager";
import Config from "@core/config";
import { Database } from "@includes/database";
import { Quote } from "@/@types/database"
import { CommandType } from "@/@types/core";

interface QuoteTemplateHolder {
    Interaction: MessageContextMenuCommandInteraction;
    Quote: QuoteTemplate;
    Timeout: Timer;
    ButtonsId: string[];
}

interface QuoteTemplate {
    fields: Array<{
        name: string,
        content: string
    }>;
    title: string;
}

type guildId = string | Snowflake;

interface DataStore {
    Quotes: Map<guildId, Map<string, QuoteTemplateHolder>>;
    Timers: Timer[];
}

interface ButtonTemplate {
    id: Snowflake | string;
    name: string;
    style: ButtonStyle;
    type: CommandType;
    execute: (interaction: ButtonInteraction) => void;
}

const Timeout = 60 * 5;

const Store: DataStore = {
    Quotes: new Map(),
    Timers: new Array()
};

const Buttons: ButtonTemplate[] = [
    {
        id: SnowflakeUtil.generate().toString(),
        name: "Delete Quote",
        style: ButtonStyle.Danger,
        type: "Once",
        execute: (interaction) => { DeleteQuoteTemplate(interaction, "Quote Aborted") }
    },
    {
        id: SnowflakeUtil.generate().toString(),
        name: "Save Quote!",
        style: ButtonStyle.Primary,
        type: "Once",
        execute: (interaction) => { SaveQuoteTemplateToDatabase(interaction) }
    },
    {
        id: SnowflakeUtil.generate().toString(),
        name: "Remove last quote line",
        style: ButtonStyle.Secondary,
        type: "infinite",
        execute: (interaction) => { removeLastLine(interaction) }
    },
    {
        id: SnowflakeUtil.generate().toString(),
        name: "Change Quote Title",
        style: ButtonStyle.Secondary,
        type: "infinite",
        execute: (interaction) => { SendModal(interaction) }
    }
];

function embedBuild(data: QuoteTemplateHolder) {
    var embed = new EmbedBuilder()
        .setAuthor({ name: data.Quote.title, iconURL: 'https://i.imgur.com/AfFp7pu.png' })
        .setDescription('Some description here')
        .setTimestamp(new Date());

    for (const field of data.Quote.fields) {
        if (field.name && field.content) {
            embed.addFields({ name: field.name, value: field.content });
        } else {
            logger.error(`Quotes: Fields are wrong`);
            console.log(field);
        }
    }

    return embed;
}

async function SlashCommandExecute(interaction: CommandInteraction) {
    interaction.reply({ content: "Work in progress", ephemeral: true })
        .catch((e) => logger.error("Quotes: " + e));
    const Settings = Config.getGuildConfig(interaction.guildId).Quotes;
    logger.info("Quotes:" + JSON.stringify(await randomQuote(interaction.guildId)));
    logger.info("Quotes:" + JSON.stringify(Settings));
}

async function ContextMenuExecute(interaction: MessageContextMenuCommandInteraction) {
    var UserQuote: QuoteTemplateHolder;
    if (interaction.targetMessage.content.length == 0 && interaction.targetMessage.attachments.size == 0) {
        interaction.reply({ content: "Message is somehow empty", ephemeral: true })
            .catch(e => {
                logger.error("Quotes: Cant reply! " + interaction.commandName);
                console.log(e);
            });
        return;
    }

    let Content: string = interaction.targetMessage.content;
    Content += getAttachmentsURLs(interaction.targetMessage.attachments);

    let guild = getCreateGuild(interaction.guildId);
    if (guild.has(interaction.user.id)) {
        // if user is set
        UserQuote = guild.get(interaction.user.id);
        UserQuote.Quote.fields.push(createFieldTemplate(interaction.targetMessage.author.username, interaction.targetMessage.author.id, Content));
        UserQuote.Timeout.reset();
        resetButtons(UserQuote.ButtonsId, interaction.guildId);

        interaction.reply({ content: "Added!", ephemeral: true })
            .catch(e => {
                logger.error("Quotes: Cant reply! " + interaction.commandName);
                console.log(e);
            });
        interaction.deleteReply()
            .catch(e => {
                logger.error("Quotes: Cant deleteReply! " + interaction.commandName);
                console.log(e);
            });
    } else {
        // if user is not set
        let UserData = {
            interaction: interaction,
            quoteText: Content,
            author: interaction.targetMessage.author
        }
        UserQuote = createUser(interaction.guildId, interaction.user.id, UserData);
    }

    if (UserQuote.Quote.fields.length > 1) {
        // if quote have more than 1 field
        let embed = embedBuild(UserQuote);
        UserQuote.Interaction.editReply({ embeds: [embed] })
            .catch(e => {
                logger.error("Quotes: Cant editReply! " + interaction.commandName);
                console.log(e);
            });
    } else {
        // if quote fields size is 1 
        let components = buildInteractionComponents(interaction, UserQuote);
        let embed = embedBuild(UserQuote);

        UserQuote.Interaction.reply({ embeds: [embed], components: [components], ephemeral: true })
            .catch(e => {
                logger.error("Quotes: Cant reply! " + interaction.commandName);
                console.log(e);
            });
    }
}

const SlashCommand = new InteractionBuilder("quote").SlashCommand(SlashCommandExecute, "infinite");
const ContextMenu = new InteractionBuilder("quote-create").MessageContextMenuCommand(ContextMenuExecute, "infinite");

InteractionManager.addGlobalInteraction(SlashCommand);
InteractionManager.addGlobalInteraction(ContextMenu);

//! Wyświetlanie quota jako embed z możliwością przewijania przyciskami (następny, poprzedni) wszystko jako ukryte
//* dodawanie quota prawym klikiem z menu Aplikacje (łączenie kilku wiadomości w ten sposób)
//! sprawdzanie czy wiadomość jest pusta, zakaz (embedów, wiadomości botów?, obrazków)
//! przy wyświetlaniu quote przycisk na dole skocz do pierwszej wiadomości (message url)

function randomQuote(guildId): Promise<Quote> {
    return Database().select("*").from("quotes").where({ guild_id: guildId }).orderByRaw("RAND()").first();
}

function DeleteQuoteTemplate(Interaction: ButtonInteraction, message: string) {
    try {
        DeleteQuoteTemplateData(Interaction.guildId, Interaction.user.id, message);
    } catch (e) {
        logger.error("Quotes: Cant Delete TemplateData");
        console.log(e);
    }
}

function DeleteQuoteTemplateData(guildId: guildId, userId: string, message: string) {
    let GuildData: Map<guildId, QuoteTemplateHolder>;
    if (!Store.Quotes.has(guildId)) {
        throw new Error("Not found guild in Store Quotes guildId" + guildId);
    }
    GuildData = Store.Quotes.get(guildId);
    if (!GuildData.has(userId)) {
        throw new Error("Not found user in Store Quotes userId:" + userId);
    }

    GuildData.get(userId).Interaction.editReply({ content: message, embeds: [], components: [] });
    GuildData.delete(userId);
}

function SaveQuoteTemplateToDatabase(Interaction: ButtonInteraction) {
    try {
        let GuildQuotes = Store.Quotes.get(Interaction.guildId);
        let UserQuote = GuildQuotes.get(Interaction.user.id);

        AddQuoteToDatabase(Interaction.guildId, Interaction.user.id, Interaction.user.username, UserQuote.Quote);
        DeleteQuoteTemplateData(Interaction.guildId, Interaction.user.id, "Quote Saved!");
    } catch (e) {
        logger.error("Quotes: Error While saving quote");
        console.log(e);
    }
}

function buildInteractionComponents(Interaction: MessageContextMenuCommandInteraction, UserStore: QuoteTemplateHolder) {
    let row = new ActionRowBuilder<ButtonBuilder>();
    let rowComponents: ButtonBuilder[] = new Array();

    for (const [, button] of Object.entries(Buttons)) {
        let builder = new InteractionBuilder(button.id).ButtonInteraction(button.execute, button.type, Timeout);
        let buttonBuilder = new ButtonBuilder().setCustomId(button.id).setStyle(button.style).setLabel(button.name);
        InteractionManager.addGuildInteraction(builder, Interaction.guildId);
        rowComponents.push(buttonBuilder);
        UserStore.ButtonsId.push(button.id);
    }

    return row.addComponents(rowComponents);
}

function SendModal(Interaction: ButtonInteraction) {
    const Modals = {
        Title: {
            id: SnowflakeUtil.generate().toString(),
            name: "My Modal"
        }
    }
    var Modal = new ModalBuilder()
        .setCustomId(Modals.Title.id)
        .setTitle(Modals.Title.name);

    var QuoteTitleInput = new TextInputBuilder()
        .setCustomId("title")
        .setLabel("Quote Title")
        .setStyle(TextInputStyle.Short);

    Modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents([QuoteTitleInput]));

    InteractionManager.resetGuildInteractionTimer(Interaction.customId, "Button", Interaction.guildId);
    InteractionManager.addGuildInteraction(new InteractionBuilder(Modals.Title.id).ModalSubmit((interaction) => {

        let title = interaction.fields.getTextInputValue("title")
        let GuildData = Store.Quotes.get(Interaction.guildId);
        let UserData = GuildData.get(Interaction.user.id)

        UserData.Quote.title = title;
        UserData.Interaction.editReply({ embeds: [embedBuild(UserData)] });

        interaction.reply({ content: "Title Changed to " + title, ephemeral: true });
        setTimeout(() => {
            interaction.deleteReply();
        }, 3000);

    }, "Once", Timeout), Interaction.guildId);
    Interaction.showModal(Modal);
}

async function AddQuoteToDatabase(guild_id: guildId, user_id: string, user_name: string, Data: QuoteTemplate) {
    let quotePosition = await GetQuoteLastPosition(guild_id);
    let timestamp = new Date().getTime();
    Database()
        .table("quotes")
        .insert({ guild_id: guild_id, quote_guild_position: quotePosition + 1, user_id: user_id, user_name: user_name, data: JSON.stringify(Data), created_timestamp: timestamp })
        .catch(e => {
            console.log(e);
            logger.error("Quotes: Cant add quote to Database");
        });
}

function GetQuoteLastPosition(guild_id: guildId) {
    return Database()
        .from('quotes')
        .select("quote_guild_position")
        .where("guild_id", guild_id)
        .orderBy("quote_guild_position", "desc")
        .limit(1)
        .then((rows) => { return rows.length > 0 ? rows[0].quote_guild_position : 0 })
        .catch(e => {
            console.log(e);
            logger.error("Quotes: Cant gather quote position");
        });
}

function createQuoteDataTimeout(guildId: string, userId: string) {
    return new Timer(() => {
        try {
            DeleteQuoteTemplateData(guildId, userId, "TimeOut! 5 minute inactivity, quote template removed");
        } catch (e) {
            logger.error("Quotes: Quote Data Timeout error " + e);
            console.log(e);
        }
    }, Timeout * 1000);
}

function createQuoteTemplateHolder(interaction: MessageContextMenuCommandInteraction, timer: Timer, text: string, userId: string, username: string): QuoteTemplateHolder {
    let fields: {
        name: string,
        content: string
    }[] = new Array();

    let field = createFieldTemplate(username, userId, text);
    if (field) {
        fields.push(field);
    }
    return { Interaction: interaction, ButtonsId: [], Timeout: timer, Quote: { title: "Untitled quote", fields: fields } };
}

function createFieldTemplate(username: string, userId: string, text: string): {
    name: string,
    content: string
} {
    if (username && userId && text) {
        return { name: `${username}`, content: text };
    } else {
        return null;
    }
}

function resetButtons(ButtonsId: string[], guildId: guildId) {
    for (const ButtonId of ButtonsId) {
        InteractionManager.resetGuildInteractionTimer(ButtonId, "Button", guildId);
    }
}

function getAttachmentsURLs(attachments: Collection<string, Attachment>) {
    let Content = "";
    for (const [, attachment] of attachments) {
        Content += "\n" + attachment.url;
    }
    return Content;
}

function getCreateGuild(guildId) {
    if (!Store.Quotes.has(guildId)) {
        let template: Map<string, QuoteTemplateHolder> = new Map();
        Store.Quotes.set(guildId, template);
    }
    return Store.Quotes.get(guildId);
}

function createUser(guildId, userId, data: { interaction: MessageContextMenuCommandInteraction, quoteText: string, author: User }) {
    let guild = Store.Quotes.get(guildId);
    let timer = createQuoteDataTimeout(guildId, userId).start();
    let template: QuoteTemplateHolder = createQuoteTemplateHolder(data.interaction, timer, data.quoteText, data.author.id, data.author.username);

    guild.set(userId, template);
    return template;
}

function removeLastLine(interaction: ButtonInteraction) {
    let UserQuote = Store.Quotes.get(interaction.guildId).get(interaction.user.id);
    UserQuote.Quote.fields.pop();

    resetButtons(UserQuote.ButtonsId, interaction.guildId);
    let embed = embedBuild(UserQuote);
    UserQuote.Interaction.editReply({ embeds: [embed] })
}


export default Store;