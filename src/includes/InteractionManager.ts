import { AutocompleteInteraction, ButtonInteraction, ChannelSelectMenuInteraction, ChatInputCommandInteraction, Client, CommandInteraction, ContextMenuCommandInteraction, Events, MentionableSelectMenuInteraction, MessageComponentInteraction, MessageContextMenuCommandInteraction, RoleSelectMenuInteraction, SelectMenuInteraction, Snowflake, StringSelectMenuInteraction, UserContextMenuCommandInteraction, UserSelectMenuInteraction } from "discord.js";
import logger from "@includes/logger";
import EventEmitter from "events";
import { Interaction } from "discord.js";
import { AnySelectMenuInteraction } from "discord.js";
import { ModalSubmitInteraction } from "discord.js";
import { CommandType, InteractionsType, ManagerInteraction, ManagerInteractionTemplate } from "@/@types/core";
import { Timer } from "@src/utils";

const InteractionType = {
    Any: "Any",
    AnySelectMenu: "AnySelectMenu",
    Autocomplete: "Autocomplete",
    Button: "Button",
    ChannelSelectMenu: "ChannelSelectMenu",
    ChatInputCommand: "ChatInputCommand",
    Command: "Command",
    ContextMenuCommand: "ContextMenuCommand",
    MentionableSelectMenu: "MentionableSelectMenu",
    MessageComponent: "MessageComponent",
    MessageContextMenuCommand: "MessageContextMenuCommand",
    ModalSubmit: "ModalSubmit",
    RoleSelectMenu: "UserContextMenuCommand",
    StringSelectMenu: "StringSelectMenu",
    UserContextMenuCommand: "UserContextMenuCommand",
    UserSelectMenu: "UserSelectMenu",
}


type ManagerInteractions = {
    Any: Map<string, ManagerInteraction>;
    AnySelectMenu: Map<string, ManagerInteraction>;
    Autocomplete: Map<string, ManagerInteraction>;
    Button: Map<string, ManagerInteraction>;
    ChatInputCommand: Map<string, ManagerInteraction>;
    ChannelSelectMenu: Map<string, ManagerInteraction>;
    Command: Map<string, ManagerInteraction>;
    ContextMenuCommand: Map<string, ManagerInteraction>;
    MentionableSelectMenu: Map<string, ManagerInteraction>;
    MessageComponent: Map<string, ManagerInteraction>;
    MessageContextMenuCommand: Map<string, ManagerInteraction>;
    ModalSubmit: Map<string, ManagerInteraction>;
    RoleSelectMenu: Map<string, ManagerInteraction>;
    StringSelectMenu: Map<string, ManagerInteraction>;
    UserSelectMenu: Map<string, ManagerInteraction>;
    UserContextMenuCommand: Map<string, ManagerInteraction>;
}

export default class InteractionManager extends EventEmitter {
    public Client: Client;
    public Interactions: {
        global: ManagerInteractions;
        guild: Map<Snowflake, ManagerInteractions>;
    }

    constructor(Client: Client) {
        super();
        this.Client = Client;
        this.Interactions = {
            global: this.createEmptyInteractions(),
            guild: new Map()
        }

        this.SetClientInteractionListener();
        this.SetInteractionListeners();
    }

    createEmptyInteractions(): ManagerInteractions {
        return {
            Any: new Map(),
            AnySelectMenu: new Map(),
            Autocomplete: new Map(),
            Button: new Map(),
            ChatInputCommand: new Map(),
            ChannelSelectMenu: new Map(),
            Command: new Map(),
            ContextMenuCommand: new Map(),
            MentionableSelectMenu: new Map(),
            MessageComponent: new Map(),
            MessageContextMenuCommand: new Map(),
            ModalSubmit: new Map(),
            RoleSelectMenu: new Map(),
            StringSelectMenu: new Map(),
            UserSelectMenu: new Map(),
            UserContextMenuCommand: new Map(),
        };
    }

    SetClientInteractionListener() {
        this.Client.on(Events.InteractionCreate, (interaction) => { this.InteractionEmitType(interaction) });
    }

    addGuild(guildId) {
        this.Interactions.guild.set(guildId, this.createEmptyInteractions());
    }

    checkAddGuild(guildId) {
        if (!this.Interactions.guild.has(guildId)) {
            this.addGuild(guildId);
        }
    }

    private SetInteractionListeners() {
        this.setAnyInteractionListener();
        this.setInteractionListener("AnySelectMenu", "customId");
        this.setInteractionListener("Autocomplete", "commandName");
        this.setInteractionListener("Button", "customId");
        this.setInteractionListener("ChannelSelectMenu", "customId");
        this.setInteractionListener("ChatInputCommand", "commandName");
        this.setInteractionListener("Command", "commandName");
        this.setInteractionListener("MentionableSelectMenu", "customId");
        this.setInteractionListener("MessageComponent", "customId");
        this.setInteractionListener("MessageContextMenuCommand", "commandName");
        this.setInteractionListener("ModalSubmit", "customId");
        this.setInteractionListener("StringSelectMenu", "customId");
        this.setInteractionListener("RoleSelectMenu", "customId");
        this.setInteractionListener("UserSelectMenu", "customId");
        this.setInteractionListener("UserContextMenuCommand", "commandName");
    }

    private ProcessInteraction(Interaction: Interaction | MessageComponentInteraction | CommandInteraction, global: Map<string, ManagerInteraction>, guild: Map<string, ManagerInteraction>, trigger: string) {
        if (global.has(trigger)) {
            let Command = global.get(trigger);
            Command.execute(Interaction);
            return;
        }

        if (guild && Interaction.inGuild()) {
            if (guild.has(trigger)) {
                let Command = guild.get(trigger);
                this.checkInteractionType(trigger, Command.type, guild);
                Command.execute(Interaction);
            }
            return;
        }
    }

    private ProcessAnyInteractions(Interaction: Interaction, global: Map<string, ManagerInteraction>, guild: Map<string, ManagerInteraction>) {
        if (global.size > 0) {
            for (const [, command] of global) {
                command.execute(Interaction);
            }
        }

        if (guild && Interaction.inGuild()) {
            for (const [, command] of global) {
                command.execute(Interaction);
            }
        }
    }

    private checkInteractionType(CommandName, type: CommandType, Interactions: Map<string, ManagerInteraction>) {
        if (type == "Once") {
            Interactions.delete(CommandName);
        }
    }

    private setAnyInteractionListener() {
        this.on(InteractionType.Any, (Interaction: Interaction) => {
            const Global = this.Interactions.global.Any;
            let Guild: Map<string, ManagerInteraction> = undefined;
            if (this.Interactions.guild.has(Interaction.guildId)) {
                Guild = this.Interactions.guild.get(Interaction.guildId).Any;
            }
            this.ProcessAnyInteractions(Interaction, Global, Guild);
        });
    }

    private setInteractionListener(InteractionType: InteractionsType, trigger: "commandName" | "customId") {
        this.on(InteractionType, (Interaction: Interaction) => {
            const Global = this.Interactions.global[InteractionType];
            let Guild: Map<string, ManagerInteraction> = undefined;
            if (this.Interactions.guild.has(Interaction.guildId)) {
                Guild = this.Interactions.guild.get(Interaction.guildId)[InteractionType];
            }
            this.ProcessInteraction(Interaction, Global, Guild, Interaction[trigger]);
        });
    }

    private sendInteractionNotExecutable(Interaction: Interaction | CommandInteraction | MessageComponentInteraction | ButtonInteraction | SelectMenuInteraction | AnySelectMenuInteraction | ModalSubmitInteraction) {
        if (Interaction.isRepliable()) {
            Interaction.reply({ content: "Sorry This Interaction is not avaible or outdated", ephemeral: true })
                .catch((e) => {
                    logger.error("InteractionManager: Cant send Not Executable reply");
                    console.log(e);
                })
        } else {
            Interaction.user.send({ content: "Sorry This Interaction is not avaible or outdated" })
                .catch((e) => {
                    logger.error("InteractionManager: Cant send Not Executable DM message");
                    console.log(e);
                })
        }
    }

    private InteractionEmitType(interaction: Interaction) {
        this.emit(InteractionType.Any, interaction);

        if (interaction.isButton()) {
            console.log("interaction isButton", interaction.customId);
            this.emit(InteractionType.Button, interaction);
        }
        if (interaction.isAutocomplete()) {
            console.log("interaction Autocomplete", interaction.commandName);
            this.emit(InteractionType.Autocomplete, interaction);
        }
        if (interaction.isAnySelectMenu()) {
            console.log("interaction AnySelectMenu", interaction.customId);
            this.emit(InteractionType.AnySelectMenu, interaction);
        }
        if (interaction.isChannelSelectMenu()) {
            console.log("interaction ChannelSelectMenu", interaction.customId);
            this.emit(InteractionType.ChannelSelectMenu, interaction);
        }
        if (interaction.isCommand()) {
            console.log("interaction Command", interaction.commandName);
            this.emit(InteractionType.Command, interaction);
        }
        if (interaction.isContextMenuCommand()) {
            console.log("interaction ContextMenuCommand", interaction.commandName);
            this.emit(InteractionType.ContextMenuCommand, interaction);
        }
        if (interaction.isMentionableSelectMenu()) {
            console.log("interaction MentionableSelectMenu", interaction.customId);
            this.emit(InteractionType.MentionableSelectMenu, interaction);
        }
        if (interaction.isMessageComponent()) {
            console.log("interaction MessageComponent", interaction.customId);
            this.emit(InteractionType.MessageComponent, interaction);
        }
        if (interaction.isMessageContextMenuCommand()) {
            console.log("interaction MessageContextMenuCommand", interaction.commandName);
            this.emit(InteractionType.MessageContextMenuCommand, interaction);
        }
        if (interaction.isModalSubmit()) {
            console.log("interaction ModalSubmit", interaction.customId);
            this.emit(InteractionType.ModalSubmit, interaction);
        }
        if (interaction.isRoleSelectMenu()) {
            console.log("interaction RoleSelectMenu", interaction.customId);
            this.emit(InteractionType.RoleSelectMenu, interaction);
        }
        if (interaction.isStringSelectMenu()) {
            console.log("interaction StringSelectMenu", interaction.customId);
            this.emit(InteractionType.StringSelectMenu, interaction);
        }
        if (interaction.isUserSelectMenu()) {
            console.log("interaction UserSelectMenu", interaction.customId);
            this.emit(InteractionType.UserSelectMenu, interaction);
        }
        if (interaction.isUserContextMenuCommand()) {
            console.log("interaction UserContextMenuCommand", interaction.commandName);
            this.emit(InteractionType.UserContextMenuCommand, interaction);
        }
    }

    addGlobalInteraction(Data: { name: string, type: InteractionsType, data: ManagerInteractionTemplate }) {
        logger.info(`InteractionManager: Global Interaction added. Name:${Data.name} Type:${Data.type}`);
        var Timer = null;
        if (Data.data.timeout && Data.data.timeout > 0) {
            logger.info(`InteractionManager: Global Interaction ${Data.name} timeout set ${Data.data.timeout}s`);
            Timer = this.setInteractionTimeout(this.Interactions.global[Data.type], Data.name, Data.data.timeout).start();
        }
        let InteractionTemplate: ManagerInteraction = {
            execute: Data.data.execute,
            type: Data.data.type,
            timeout: Timer
        }
        this.Interactions.global[Data.type].set(Data.name, InteractionTemplate);
    }

    addGuildInteraction(Data: { name: string, type: InteractionsType, data: ManagerInteractionTemplate }, guildId: string) {
        logger.info(`InteractionManager: Guild Interaction added. Name:${Data.name} Type:${Data.type}`);
        this.checkAddGuild(guildId);
        var Timer = null;
        let guild = this.Interactions.guild.get(guildId);
        if (Data.data.timeout && Data.data.timeout > 0) {
            logger.info(`InteractionManager: Guild Interaction ${Data.name} timeout set ${Data.data.timeout}s`);
            Timer = this.setInteractionTimeout(guild[Data.type], Data.name, Data.data.timeout).start();
        }

        let InteractionTemplate: ManagerInteraction = {
            execute: Data.data.execute,
            type: Data.data.type,
            timeout: Timer
        }
        guild[Data.type].set(Data.name, InteractionTemplate);
    }
    resetGuildInteractionTimer(interactionName: string, interactionType: InteractionsType, guildId: string) {
        if (!this.Interactions.guild.has(guildId)) {
            throw new Error("Given guild id not exists:" + guildId);
        }
        let Guild = this.Interactions.guild.get(guildId);
        if (!Guild[interactionType].has(interactionName)) {
            throw new Error("Given Interaction not exists:" + interactionName);
        }
        let GuildInteraction: ManagerInteraction = Guild[interactionType].get(interactionName);
        if (GuildInteraction.timeout) {
            GuildInteraction.timeout.reset();
            logger.info(`InteractionManager: Guild: ${guildId} Interaction: [${interactionName},${interactionType}] Timer reset`);
            return true;
        }
        return false;
    }
    resetGlobalInteractionTimer(interactionName, interactionType) {
        let Global = this.Interactions.global;
        if (!Global[interactionType].has(interactionName)) {
            throw new Error("Given Interaction not exists:" + interactionName);
        }
        let GlobalInteraction: ManagerInteraction = Global[interactionType].get(interactionName);
        if (GlobalInteraction.timeout) {
            GlobalInteraction.timeout.reset();
            logger.info(`InteractionManager: Global Interaction: [${interactionName},${interactionType}] Timer reset`);
            return true;
        }
        return false;
    }
    setInteractionTimeout(Interactions: Map<string, ManagerInteraction>, interactionName: string, seconds: number): Timer {
        return new Timer(() => {
            if (Interactions.has(interactionName)) {
                Interactions.delete(interactionName);
                logger.info(`InteractionManager: Interaction ${interactionName} timeout delete after ${seconds}s`);
            }
        }, seconds * 1000);
    }
}