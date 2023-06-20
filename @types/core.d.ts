import { Timer } from "@/src/utils";

export type ManagerInteraction = {
    type: CommandType;
    execute: (Interaction) => void;
    timeout?: Timer;
}

export type ManagerInteractionTemplate = {
    type: CommandType;
    execute: (Interaction) => void;
    timeout?: number;
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