import { AnySelectMenuInteraction, AutocompleteInteraction, ButtonInteraction, ChannelSelectMenuInteraction, ChatInputCommandInteraction, CommandInteraction, ContextMenuCommandInteraction, MentionableSelectMenuInteraction, MessageComponentInteraction, MessageContextMenuCommandInteraction, ModalSubmitInteraction, RoleSelectMenuInteraction, Snowflake, StringSelectMenuInteraction, UserContextMenuCommandInteraction, UserSelectMenuInteraction } from "discord.js";

export type guildId = Snowflake;

export type ManagerInteraction<T> = {
    isGuild: boolean;
    guildId?: string;
    execute: (Interaction: T, id: string | null) => Promise<void>;
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