import { Quote } from "@/@types/database"
import { QuoteTemplate } from "@/@types/core";
import { ActionRowBuilder, Attachment, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Collection, CommandInteraction, EmbedBuilder, MessageContextMenuCommandInteraction, ModalBuilder, ModalSubmitInteraction, Snowflake, SnowflakeUtil, TextInputBuilder, TextInputStyle, User } from "discord.js";
import { Client } from "@core/Bot";
import Config from "@core/Config";
import InteractionManager from "@core/InteractionManager";
import { Database } from "@includes/database";
import logger from "@includes/logger";
import { InteractionBuilder, Timer, errorLog } from "@src/utils";

interface QuoteTemplateHolder {
    Id: Snowflake;
    Interaction: MessageContextMenuCommandInteraction | ChatInputCommandInteraction;
    Quote: QuoteTemplate;
    Timeout: Timer;
}

type guildId = string | Snowflake;

interface DataStore {
    Quotes: Map<guildId, Map<string, QuoteTemplateHolder>>;
}

interface ButtonTemplate {
    id: Snowflake | string;
    name: string;
    style: ButtonStyle;
}

const Timeout = 60 * 15;

const Store: DataStore = {
    Quotes: new Map()
};

const Buttons: ButtonTemplate[] = [
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

function embedBuildFields(data: QuoteTemplate, messageLink: string, iconURL: string, timestamp?: number | Date) {
    var embed = new EmbedBuilder()
        .setAuthor({ name: data.title, iconURL: iconURL, url: messageLink })
        .setTimestamp(timestamp ? timestamp : new Date());

    for (const field of data.fields) {
        if (field.name && field.content) {
            embed.addFields({ name: field.name, value: field.content });
        } else {
            errorLog(logger, `Quotes: Fields are wrong`, field);
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

async function SlashCommandExecute(interaction: ChatInputCommandInteraction) {
    const SubCommand = interaction.options.getSubcommand();
    const Settings = Config.getGuildConfig(interaction.guildId).Quotes;
    if (!Settings.enabled) {
        interaction.reply({ content: "Quotes not enabled on this server", ephemeral: true })
            .catch(e => errorLog(logger, "Quotes: Cant reply! " + interaction.commandName, e));
        return;
    }
    switch (SubCommand) {
        case "show": SlashCommandShow(interaction); break;
        case "show-embed": SlashCommandShowEmbed(interaction); break;
        case "delete-template": SlashCommandDelete(interaction); break;
        default: InteractionManager.sendInteractionNotExecutable(interaction);
    }
}

async function SlashCommandShow(interaction: ChatInputCommandInteraction) {
    const quotePosition = interaction.options.get("quote-position");
    var quote: Quote;

    if (quotePosition?.value) {
        quote = await getQuote(interaction.guildId, quotePosition.value);
    } else {
        quote = await getQuote(interaction.guildId);
    }
    if (!quote) {
        interaction.reply({ content: "Quote Not exist", ephemeral: true })
            .catch(e => errorLog(logger, "Quotes: Cant reply! " + interaction.commandName, e));
        return;
    }

    let quoteAuthor = await getGuildMember(quote.user_id, interaction.guildId);
    let embed = embedBuildFields(quote.data, quote.data.messageLink, quoteAuthor.avatar, quote.created_timestamp);
    embed.setDescription("Quote by: " + quoteAuthor.nickname);
    embed.setFooter({ text: "Quote No. " + quote.quote_guild_position });
    interaction.reply({ embeds: [embed] })
        .catch(e => errorLog(logger, "Quotes: Cant reply! " + interaction.commandName, e));
}

async function SlashCommandShowEmbed(interaction: ChatInputCommandInteraction) {
    try {
        var UserQuote = getGuildData(interaction.guildId, interaction.user.id);
        let embed = embedBuildFields(UserQuote.Quote, UserQuote.Quote.messageLink, interaction.user.displayAvatarURL({ size: 64 }));
        let components = buildInteractionComponents(UserQuote);

        interaction.reply({ embeds: [embed], components: [components], ephemeral: true })
            .then(reply => {
                UserQuote.Interaction = interaction;
                Store.Quotes.get(interaction.guildId).set(interaction.user.id, UserQuote);
            })
            .catch(e => errorLog(logger, "Quotes: Cant reply! " + interaction.commandName, e));

    } catch (error) {
        interaction.reply({ content: "No templates found", ephemeral: true });
        errorLog(logger, "Quotes: No templates found! " + interaction.commandName, error);
    }
}

async function SlashCommandDelete(interaction: ChatInputCommandInteraction) {
    try {
        const UserQuote = getGuildData(interaction.guildId, interaction.user.id);
        if (DeleteQuoteTemplate(interaction, UserQuote.Id, "Quote Aborted")) {
            interaction.reply({ content: "Template deleted", ephemeral: true });
        }
    } catch (error) {
        interaction.reply({ content: "No templates found", ephemeral: true });
        errorLog(logger, "Quotes: No templates found! " + interaction.commandName, error);
    }
}

async function ContextMenuExecute(interaction: MessageContextMenuCommandInteraction) {
    const Settings = Config.getGuildConfig(interaction.guildId).Quotes;
    var UserQuote: QuoteTemplateHolder;

    if (!Settings.enabled) {
        interaction.reply({ content: "Quotes not enabled on this server", ephemeral: true })
            .catch(e => errorLog(logger, "Quotes: Cant reply! " + interaction.commandName, e));
        return;
    }

    if (interaction.targetMessage.content.length == 0 && interaction.targetMessage.attachments.size == 0) {
        interaction.reply({ content: "Message is somehow empty", ephemeral: true })
            .catch(e => errorLog(logger, "Quotes: Cant reply! " + interaction.commandName, e));
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

        interaction.reply({ content: "Added!", ephemeral: true })
            .catch(e => errorLog(logger, "Quotes: Cant reply! " + interaction.commandName, e));
        interaction.deleteReply()
            .catch(e => errorLog(logger, "Quotes: Cant deleteReply! " + interaction.commandName, e));
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
            .catch(e => errorLog(logger, "Quotes: Cant editReply! " + interaction.commandName, e));
    } else {
        // if quote fields size is 1 
        let embed = embedBuildFields(UserQuote.Quote, UserQuote.Quote.messageLink, interaction.user.displayAvatarURL({ size: 64 }));
        let components = buildInteractionComponents(UserQuote);

        UserQuote.Interaction.reply({ embeds: [embed], components: [components], ephemeral: true })
            .catch(e => errorLog(logger, "Quotes: Cant reply! " + interaction.commandName, e));
    }
}

function getGuildData(guildId, userId) {
    let GuildData: Map<guildId, QuoteTemplateHolder>;
    if (!Store.Quotes.has(guildId)) {
        throw new Error("Not found guild in Store Quotes guildId" + guildId);
    }
    GuildData = Store.Quotes.get(guildId);
    if (!GuildData.has(userId)) {
        throw new Error("Not found user in Store Quotes userId:" + userId);
    }

    return GuildData.get(userId);
}

function isInteractionIdValid(interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction, id) {
    try {
        let GuildData = getGuildData(interaction.guildId, interaction.user.id);
        return GuildData.Id == id ? true : false;
    } catch (error) {
        return false;
    }
}

function DeleteQuoteTemplate(Interaction: CommandInteraction | ButtonInteraction, id, message: string): boolean {
    if (!isInteractionIdValid(Interaction, id)) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return false;
    }
    try {
        DeleteQuoteTemplateData(Interaction.guildId, Interaction.user.id, message);
        return true;
    } catch (e) {
        errorLog(logger, "Quotes: Cant Delete TemplateData", e);
        return false;
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

async function SaveQuoteTemplateToDatabase(Interaction: ButtonInteraction, id: string) {
    if (!isInteractionIdValid(Interaction, id)) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }
    try {
        let GuildQuotes = Store.Quotes.get(Interaction.guildId);
        let UserQuote = GuildQuotes.get(Interaction.user.id);

        let quotePos = await AddQuoteToDatabase(Interaction.guildId, Interaction.user.id, UserQuote.Quote);
        DeleteQuoteTemplateData(Interaction.guildId, Interaction.user.id, `Quote No. ${quotePos} Saved!`);
    } catch (e) {
        errorLog(logger, "Quotes: Error While saving quote", e);
    }
}

function buildInteractionComponents(UserStore: QuoteTemplateHolder) {
    let row = new ActionRowBuilder<ButtonBuilder>();
    let rowComponents: ButtonBuilder[] = new Array();

    for (const [, button] of Object.entries(Buttons)) {
        let buttonBuilder = new ButtonBuilder().setCustomId(`${button.id}:<${UserStore.Id}>`).setStyle(button.style).setLabel(button.name);
        rowComponents.push(buttonBuilder);
    }

    return row.addComponents(rowComponents);
}

function SendModal(Interaction: ButtonInteraction, id) {
    if (!isInteractionIdValid(Interaction, id)) {
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

function changeTitle(Interaction: ModalSubmitInteraction, id) {
    if (!isInteractionIdValid(Interaction, id)) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }
    let title = Interaction.fields.getTextInputValue("title")
    let GuildData = Store.Quotes.get(Interaction.guildId);
    let UserData = GuildData.get(Interaction.user.id)

    UserData.Quote.title = title;
    UserData.Interaction.editReply({ embeds: [embedBuildFields(UserData.Quote, UserData.Quote.messageLink, Interaction.user.displayAvatarURL({ size: 64 }))] });

    Interaction.reply({ content: "Title Changed to " + title, ephemeral: true });
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

function GetQuoteLastPosition(guild_id: guildId): Promise<number> {
    return Database()
        .from('quotes')
        .select("quote_guild_position")
        .where("guild_id", guild_id)
        .orderBy("quote_guild_position", "desc")
        .limit(1)
        .then((rows) => { return rows.length > 0 ? rows[0].quote_guild_position : 0 })
        .catch(e => {
            return 0;
            errorLog(logger, "Quotes: Cant gather quote position", e);
        });
}

function createQuoteDataTimeout(guildId: string, userId: string) {
    return new Timer(() => {
        try {
            DeleteQuoteTemplateData(guildId, userId, "TimeOut! 5 minute inactivity, quote template removed");
        } catch (e) {
            errorLog(logger, "Quotes: Quote Data Timeout error", e);
        }
    }, Timeout * 1000);
}

function createQuoteTemplateHolder(interaction: MessageContextMenuCommandInteraction, timer: Timer, text: string, userId: string, username: string): QuoteTemplateHolder {
    let id = SnowflakeUtil.generate().toString();
    let fields: {
        name: string,
        content: string
    }[] = new Array();

    let field = createFieldTemplate(username, userId, text);
    if (field) {
        fields.push(field);
    }
    return { Interaction: interaction, Id: id, Timeout: timer, Quote: { title: "Untitled quote", messageLink: interaction.targetMessage.url, fields: fields } };
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

function removeLastLine(Interaction: ButtonInteraction, id: string) {
    if (!isInteractionIdValid(Interaction, id)) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }
    let UserQuote = Store.Quotes.get(Interaction.guildId).get(Interaction.user.id);
    if (UserQuote.Quote.fields.length < 2) {
        Interaction.reply({ content: "Cant remove First line", ephemeral: true })
            .catch(e => {
                errorLog(logger, "Quotes: cant reply, removeLastLine", e);
                return 0;
            });
        return;
    }
    Interaction.reply({ content: "Removed last Line", ephemeral: true })
        .catch(e => {
            errorLog(logger, "Quotes: cant reply, removeLastLine", e);
            return 0;
        });
    UserQuote.Quote.fields.pop();
    let embed = embedBuildFields(UserQuote.Quote, UserQuote.Quote.messageLink, Interaction.user.displayAvatarURL({ size: 64 }));
    UserQuote.Interaction.editReply({ embeds: [embed] })
        .catch(e => {
            errorLog(logger, "Quotes: cant editReply, removeLastLine", e);
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

const SlashCommand = new InteractionBuilder("quote")
    .setExecute(SlashCommandExecute)
    .SlashCommand();
const ContextMenu = new InteractionBuilder("quote-create")
    .setExecute(ContextMenuExecute)
    .MessageContextMenuCommand();
const ButtonDelete = new InteractionBuilder("quote:delete-button")
    .setExecute((interaction: ButtonInteraction, id) => { DeleteQuoteTemplate(interaction, id, "Quote Aborted") })
    .ButtonInteraction();
const ButtonSave = new InteractionBuilder("quote:save-button")
    .setExecute(SaveQuoteTemplateToDatabase)
    .ButtonInteraction();
const ButtonRemove = new InteractionBuilder("quote:remove-button")
    .setExecute(removeLastLine)
    .ButtonInteraction();
const ButtonTitle = new InteractionBuilder("quote:title-button")
    .setExecute(SendModal)
    .ButtonInteraction();
var ModalInteraction = new InteractionBuilder("quote:modal-submit")
    .setExecute(changeTitle)
    .ModalSubmit();

InteractionManager.addInteraction(ModalInteraction);
InteractionManager.addInteraction(SlashCommand);
InteractionManager.addInteraction(ContextMenu);
InteractionManager.addInteraction(ButtonDelete);
InteractionManager.addInteraction(ButtonSave);
InteractionManager.addInteraction(ButtonRemove);
InteractionManager.addInteraction(ButtonTitle);

export default Store;