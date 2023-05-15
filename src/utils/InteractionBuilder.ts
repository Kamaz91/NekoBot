import { CommandType, InteractionsType, ManagerInteraction, ManagerInteractionTemplate } from "@/@types/core";
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
    execute: (interaction: CommandInteraction) => void;
    type: CommandType;

    constructor(name: string) {
        this.name = name;
    }

    ButtonInteraction(execute: (Interaction: ButtonInteraction) => void, type: CommandType, timeout?: number): { name: string, type: InteractionsType, data: ManagerInteractionTemplate } {
        return {
            name: this.name,
            type: "Button",
            data: { execute, type, timeout }
        }
    }
    SlashCommand(execute: (Interaction: CommandInteraction) => void, type: CommandType, timeout?: number): { name: string, type: InteractionsType, data: ManagerInteractionTemplate } {
        return {
            name: this.name,
            type: "Command",
            data: { execute, type, timeout }
        }
    }
    ContextMenuCommand(execute: (Interaction: ContextMenuCommandInteraction) => void, type: CommandType, timeout?: number): { name: string, type: InteractionsType, data: ManagerInteractionTemplate } {
        return {
            name: this.name,
            type: "ContextMenuCommand",
            data: { execute, type, timeout }
        }
    }
    MessageContextMenuCommand(execute: (Interaction: MessageContextMenuCommandInteraction) => void, type: CommandType, timeout?: number): { name: string, type: InteractionsType, data: ManagerInteractionTemplate } {
        return {
            name: this.name,
            type: "MessageContextMenuCommand",
            data: { execute, type, timeout }
        }
    }
    ModalSubmit(execute: (Interaction: ModalSubmitInteraction) => void, type: CommandType, timeout?: number): { name: string, type: InteractionsType, data: ManagerInteractionTemplate } {
        return {
            name: this.name,
            type: "ModalSubmit",
            data: { execute, type, timeout }
        }
    }
}