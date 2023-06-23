import { CommandType, InteractionsType, ManagerInteractionTemplate } from "@/@types/core";
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
    execute: (interaction: CommandInteraction | ButtonInteraction | ContextMenuCommandInteraction | ModalSubmitInteraction | MessageContextMenuCommandInteraction) => void;
    timeout: number;

    constructor(name: string) {
        this.name = name;
        this.timeout = null;
    }

    setTimeout(timeout: number) {
        this.timeout = timeout;
        return this;
    }

    setExecute(execute: (interaction: CommandInteraction | ButtonInteraction | ContextMenuCommandInteraction | ModalSubmitInteraction | MessageContextMenuCommandInteraction) => void) {
        this.execute = execute;
        return this;
    }

    ButtonInteraction(type: CommandType): { name: string, type: InteractionsType, data: ManagerInteractionTemplate } {
        return {
            name: this.name,
            type: "Button",
            data: { execute: this.execute, type: type, timeout: this.timeout }
        }
    }
    SlashCommand(type: CommandType): { name: string, type: InteractionsType, data: ManagerInteractionTemplate } {
        return {
            name: this.name,
            type: "Command",
            data: { execute: this.execute, type: type, timeout: this.timeout }
        }
    }
    ContextMenuCommand(type: CommandType): { name: string, type: InteractionsType, data: ManagerInteractionTemplate } {
        return {
            name: this.name,
            type: "ContextMenuCommand",
            data: { execute: this.execute, type: type, timeout: this.timeout }
        }
    }
    MessageContextMenuCommand(type: CommandType): { name: string, type: InteractionsType, data: ManagerInteractionTemplate } {
        return {
            name: this.name,
            type: "MessageContextMenuCommand",
            data: { execute: this.execute, type: type, timeout: this.timeout }
        }
    }
    ModalSubmit(type: CommandType): { name: string, type: InteractionsType, data: ManagerInteractionTemplate } {
        return {
            name: this.name,
            type: "ModalSubmit",
            data: { execute: this.execute, type: type, timeout: this.timeout }
        }
    }
}