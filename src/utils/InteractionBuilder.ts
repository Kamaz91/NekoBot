import { CommandType, InteractionsType, ManagerInteraction } from "@/@types/core";
import { ButtonInteraction, CommandInteraction, ContextMenuCommandInteraction, MessageContextMenuCommandInteraction, ModalSubmitInteraction } from "discord.js";

// Interaction Events type
/*
    ! AnySelectMenu
    ! Autocomplete
    * Button
    ! ChannelSelectMenu
    ! ChatInputCommand
    * Command
    * ContextMenuCommand
    ! MentionableSelectMenu
    ! MessageComponent
    * MessageContextMenuCommand
    * ModalSubmit
    ! UserContextMenuCommand
*/

export default class InteractionBuilder {
    name: string;
    execute: (interaction: CommandInteraction | ButtonInteraction | ContextMenuCommandInteraction | ModalSubmitInteraction | MessageContextMenuCommandInteraction, id?: string) => void;
    guildId: string;
    isGuild: boolean;

    constructor(name: string) {
        this.name = name;
        this.guildId = null;
        this.isGuild = false;
    }
    setGuildOnly(guildId: string) {
        this.guildId = guildId;
        this.isGuild = true;
    }

    setExecute(execute: (interaction: CommandInteraction | ButtonInteraction | ContextMenuCommandInteraction | ModalSubmitInteraction | MessageContextMenuCommandInteraction, id?: string) => void) {
        this.execute = execute;
        return this;
    }

    ButtonInteraction(): { name: string, type: InteractionsType, data: ManagerInteraction } {
        return {
            name: this.name,
            type: "Button",
            data: { guildId: this.guildId, isGuild: this.isGuild, execute: this.execute }
        }
    }
    SlashCommand(): { name: string, type: InteractionsType, data: ManagerInteraction } {
        return {
            name: this.name,
            type: "Command",
            data: { guildId: this.guildId, isGuild: this.isGuild, execute: this.execute }
        }
    }
    ContextMenuCommand(): { name: string, type: InteractionsType, data: ManagerInteraction } {
        return {
            name: this.name,
            type: "ContextMenuCommand",
            data: { guildId: this.guildId, isGuild: this.isGuild, execute: this.execute }
        }
    }
    MessageContextMenuCommand(): { name: string, type: InteractionsType, data: ManagerInteraction } {
        return {
            name: this.name,
            type: "MessageContextMenuCommand",
            data: { guildId: this.guildId, isGuild: this.isGuild, execute: this.execute }
        }
    }
    ModalSubmit(): { name: string, type: InteractionsType, data: ManagerInteraction } {
        return {
            name: this.name,
            type: "ModalSubmit",
            data: { guildId: this.guildId, isGuild: this.isGuild, execute: this.execute }
        }
    }
}