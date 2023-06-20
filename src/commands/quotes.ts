import { Quote } from "@/@types/database"
import { CommandType, QuoteTemplate } from "@/@types/core";
import { ActionRowBuilder, Attachment, ButtonBuilder, ButtonInteraction, ButtonStyle, Collection, CommandInteraction, EmbedBuilder, MessageContextMenuCommandInteraction, ModalBuilder, Snowflake, SnowflakeUtil, TextInputBuilder, TextInputStyle, User } from "discord.js";
import { Client } from "@core/Bot";
import Config from "@core/config";
import InteractionManager from "@core/InteractionManager";
import { Database } from "@includes/database";
import logger from "@includes/logger";
import { InteractionBuilder, Timer } from "@src/utils";

interface QuoteTemplateHolder {
    ButtonsId: string[];
    Interaction: MessageContextMenuCommandInteraction;
    Quote: QuoteTemplate;
    Timeout: Timer;
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

const Timeout = 60 * 15;

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

function embedBuildFields(data: QuoteTemplate, messageLink: string, iconURL: string, timestamp?: number | Date) {
    var embed = new EmbedBuilder()
        .setAuthor({ name: data.title, iconURL: iconURL, url: messageLink })
        .setTimestamp(timestamp ? timestamp : new Date());

    for (const field of data.fields) {
        if (field.name && field.content) {
            embed.addFields({ name: field.name, value: field.content });
        } else {
            logger.error(`Quotes: Fields are wrong`);
            logger.error(JSON.stringify(field));
        }
    }
    return embed;
}

async function getGuildMember(userId, guildId) {
    let user = await (await Client.guilds.fetch(guildId)).members.fetch(userId);
    if (user) {
        return { nickname: user.nickname, avatar: user.displayAvatarURL({ size: 64 }) };
    }
    return { nickname: "User not found", avatar: Client.user.displayAvatarURL({ size: 64 }) };
}

async function SlashCommandExecute(interaction: CommandInteraction) {
    const Settings = Config.getGuildConfig(interaction.guildId).Quotes;
    const quotePosition = interaction.options.get("quote-position");
    let quote: Quote;

    if (!Settings.enabled) {
        interaction.reply({ content: "Quotes not enabled on this server", ephemeral: true })
            .catch((e) => logger.error("Quotes: " + e));
        return;
    }

    if (quotePosition?.value) {
        quote = await getQuote(interaction.guildId, quotePosition.value);
    } else {
        quote = await getQuote(interaction.guildId);
    }

    let quoteAuthor = await getGuildMember(quote.user_id, interaction.guildId);
    let embed = embedBuildFields(quote.data, quote.data.messageLink, quoteAuthor.avatar, quote.created_timestamp);
    embed.setDescription("Quote by: " + quoteAuthor.nickname);
    embed.setFooter({ text: "Quote No. " + quote.quote_guild_position });
    interaction.reply({ embeds: [embed] })
        .catch((e) => logger.error("Quotes: " + e));
}

async function ContextMenuExecute(interaction: MessageContextMenuCommandInteraction) {
    var UserQuote: QuoteTemplateHolder;
    if (interaction.targetMessage.content.length == 0 && interaction.targetMessage.attachments.size == 0) {
        interaction.reply({ content: "Message is somehow empty", ephemeral: true })
            .catch(e => {
                logger.error("Quotes: Cant reply! " + interaction.commandName);
                logger.error(JSON.stringify(e));
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
                logger.error(JSON.stringify(e));
            });
        interaction.deleteReply()
            .catch(e => {
                logger.error("Quotes: Cant deleteReply! " + interaction.commandName);
                logger.error(JSON.stringify(e));
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
        let embed = embedBuildFields(UserQuote.Quote, UserQuote.Quote.messageLink, interaction.user.displayAvatarURL({ size: 64 }));
        UserQuote.Interaction.editReply({ embeds: [embed] })
            .catch(e => {
                logger.error("Quotes: Cant editReply! " + interaction.commandName);
                logger.error(JSON.stringify(e));
            });
    } else {
        // if quote fields size is 1 
        let components = buildInteractionComponents(interaction, UserQuote);
        let embed = embedBuildFields(UserQuote.Quote, UserQuote.Quote.messageLink, interaction.user.displayAvatarURL({ size: 64 }));

        UserQuote.Interaction.reply({ embeds: [embed], components: [components], ephemeral: true })
            .catch(e => {
                logger.error("Quotes: Cant reply! " + interaction.commandName);
                logger.error(JSON.stringify(e));
            });
    }
}

//* dodawanie quota prawym klikiem z menu Aplikacje (łączenie kilku wiadomości w ten sposób)
//* sprawdzanie czy wiadomość jest pusta, zakaz (embedów, wiadomości botów?, obrazków)
//! przy wyświetlaniu quote przycisk na dole skocz do pierwszej wiadomości (message url)

function DeleteQuoteTemplate(Interaction: ButtonInteraction, message: string) {
    try {
        DeleteQuoteTemplateData(Interaction.guildId, Interaction.user.id, message);
    } catch (e) {
        logger.error("Quotes: Cant Delete TemplateData");
        logger.error(JSON.stringify(e));
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

async function SaveQuoteTemplateToDatabase(Interaction: ButtonInteraction) {
    try {
        let GuildQuotes = Store.Quotes.get(Interaction.guildId);
        let UserQuote = GuildQuotes.get(Interaction.user.id);

        let quotePos = await AddQuoteToDatabase(Interaction.guildId, Interaction.user.id, UserQuote.Quote);
        DeleteQuoteTemplateData(Interaction.guildId, Interaction.user.id, `Quote No. ${quotePos} Saved!`);
    } catch (e) {
        logger.error("Quotes: Error While saving quote");
        logger.error(JSON.stringify(e));
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
            name: "Quote Modal"
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
        UserData.Interaction.editReply({ embeds: [embedBuildFields(UserData.Quote, UserData.Quote.messageLink, interaction.user.displayAvatarURL({ size: 64 }))] });

        interaction.reply({ content: "Title Changed to " + title, ephemeral: true });
    }, "Once", Timeout), Interaction.guildId);
    Interaction.showModal(Modal);
}

async function AddQuoteToDatabase(guild_id: guildId, user_id: string, Data: QuoteTemplate) {
    let quotePosition = await GetQuoteLastPosition(guild_id) + 1;
    let timestamp = new Date().getTime();
    Database()
        .table("quotes")
        .insert({ guild_id: guild_id, quote_guild_position: quotePosition, user_id: user_id, data: JSON.stringify(Data), created_timestamp: timestamp })
        .catch(e => {
            logger.error(JSON.stringify(e));
            logger.error("Quotes: Cant add quote to Database");
        });
    return quotePosition;
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
            logger.error(JSON.stringify(e));
            logger.error("Quotes: Cant gather quote position");
            return 0;
        });
}

function createQuoteDataTimeout(guildId: string, userId: string) {
    return new Timer(() => {
        try {
            DeleteQuoteTemplateData(guildId, userId, "TimeOut! 5 minute inactivity, quote template removed");
        } catch (e) {
            logger.error("Quotes: Quote Data Timeout error " + e);
            logger.error(JSON.stringify(e));
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
    return { Interaction: interaction, ButtonsId: [], Timeout: timer, Quote: { title: "Untitled quote", messageLink: interaction.targetMessage.url, fields: fields } };
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
    resetButtons(UserQuote.ButtonsId, interaction.guildId);
    if (UserQuote.Quote.fields.length < 2) {
        interaction.reply({ content: "Cant remove First line", ephemeral: true })
            .catch(e => {
                logger.error(JSON.stringify(e));
                logger.error("Quotes: cant reply, removeLastLine");
                return 0;
            });
        return;
    }
    interaction.reply({ content: "Removed last Line", ephemeral: true })
        .catch(e => {
            logger.error(JSON.stringify(e));
            logger.error("Quotes: cant reply, removeLastLine");
            return 0;
        });
    UserQuote.Quote.fields.pop();
    let embed = embedBuildFields(UserQuote.Quote, UserQuote.Quote.messageLink, interaction.user.displayAvatarURL({ size: 64 }));
    UserQuote.Interaction.editReply({ embeds: [embed] })
        .catch(e => {
            logger.error(JSON.stringify(e));
            logger.error("Quotes: cant editReply, removeLastLine");
            return 0;
        });
}

function randomQuote(guildId): Promise<Quote> {
    return Database().select("*").from("quotes").where({ guild_id: guildId, hidden: 0 }).orderByRaw("RAND()").first();
}

function getQuote(guildId, quotePosition?): Promise<Quote> {
    if (quotePosition) {
        return Database().select("*").from("quotes").where({ guild_id: guildId, hidden: 0, quote_guild_position: quotePosition }).first();
    } else {
        return randomQuote(guildId);
    }
}

const SlashCommand = new InteractionBuilder("quote").SlashCommand(SlashCommandExecute, "infinite");
const ContextMenu = new InteractionBuilder("quote-create").MessageContextMenuCommand(ContextMenuExecute, "infinite");

InteractionManager.addGlobalInteraction(SlashCommand);
InteractionManager.addGlobalInteraction(ContextMenu);

export default Store;