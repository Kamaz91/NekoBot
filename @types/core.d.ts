export type ManagerInteraction = {
    isGuild: boolean;
    guildId?: string;
    execute: (Interaction, id: string | null) => void;
}

export type CommandType = 'Once' | 'infinite';

export type InteractionsType = "Any" | "AnySelectMenu" | "Autocomplete" | "Button" | "ChannelSelectMenu" | "ChatInputCommand" | "Command" | "ContextMenuCommand" | "MentionableSelectMenu" | "MessageComponent" | "MessageContextMenuCommand" | "ModalSubmit" | "UserContextMenuCommand" | "UserSelectMenu" | "RoleSelectMenu" | "StringSelectMenu";

export interface QuoteTemplate {
    fields: Array<{
        name: string,
        content: string
    }>;
    messageLink: string;
    title: string;
}