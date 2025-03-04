import { ButtonStyle, ChatInputCommandInteraction, MessageContextMenuCommandInteraction, Snowflake } from "discord.js";
import { Timer } from "../utils/";

type guildId = Snowflake;

interface QuoteData {
    Id: Snowflake;
    Interaction: MessageContextMenuCommandInteraction | ChatInputCommandInteraction;
    userId: Snowflake;
    guildId: guildId;
    Quote: QuoteContent;
}

interface DataStore {
    Quotes: Map<guildId, Map<string, QuoteData>>;
}

interface ButtonTemplate {
    id: Snowflake;
    name: string;
    style: ButtonStyle;
}

interface QuoteContent {
    fields: Array<{
        name: string,
        content: string
    }>;
    messageLink: string;
    title: string;
}