import { AnySelectMenuInteraction, AutocompleteInteraction, ButtonInteraction, ChannelSelectMenuInteraction, ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandInteraction, MentionableSelectMenuInteraction, MessageComponentInteraction, MessageContextMenuCommandInteraction, ModalSubmitInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserContextMenuCommandInteraction, UserSelectMenuInteraction } from "discord.js";

export type ManagerInteraction<T> = {
    isGuild: boolean;
    guildId?: string;
    execute: (Interaction: T, id: string | null) => void;
}

export type ManagerInteractionTypes =
    AnySelectMenuInteraction |
    AutocompleteInteraction |
    ButtonInteraction |
    ChatInputCommandInteraction |
    ChannelSelectMenuInteraction |
    CommandInteraction |
    ContextMenuCommandInteraction |
    MentionableSelectMenuInteraction |
    MessageComponentInteraction |
    MessageContextMenuCommandInteraction |
    ModalSubmitInteraction |
    RoleSelectMenuInteraction |
    StringSelectMenuInteraction |
    UserSelectMenuInteraction |
    UserContextMenuCommandInteraction;