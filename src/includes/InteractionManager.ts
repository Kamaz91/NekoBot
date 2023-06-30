import { AutocompleteInteraction, ButtonInteraction, ChannelSelectMenuInteraction, ChatInputCommandInteraction, Client, CommandInteraction, ContextMenuCommandInteraction, Events, MentionableSelectMenuInteraction, MessageComponentInteraction, MessageContextMenuCommandInteraction, RoleSelectMenuInteraction, SelectMenuInteraction, Snowflake, StringSelectMenuInteraction, UserContextMenuCommandInteraction, UserSelectMenuInteraction } from "discord.js";
import logger from "@includes/logger";
import EventEmitter from "events";
import { Interaction } from "discord.js";
import { AnySelectMenuInteraction } from "discord.js";
import { ModalSubmitInteraction } from "discord.js";
import { InteractionsType, ManagerInteraction } from "@/@types/core";

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
    public Interactions: ManagerInteractions;

    constructor(Client: Client) {
        super();
        this.Client = Client;
        this.Interactions = this.createEmptyInteractions();

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

    private SetInteractionListeners() {
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

    private ProcessInteraction(Interaction: Interaction | MessageComponentInteraction | CommandInteraction, InteractionsByType: Map<string, ManagerInteraction>, Command: { name: string, id: string }) {
        if (InteractionsByType.has(Command.name)) {
            let commandData = InteractionsByType.get(Command.name);
            commandData.execute(Interaction, Command.id);
        }
    }

    splitCommand(command: string): { id: string | null, name: string } {
        const pattern = /^(.*):<(\d+)>$/;
        const match = command.match(pattern);

        if (match) {
            const [, name, id] = match;
            return {
                id: id ? id.trim() : null,
                name: name.trim()
            };
        }

        return {
            id: null,
            name: command.trim()
        };
    }

    private setInteractionListener(InteractionType: InteractionsType, trigger: "commandName" | "customId") {
        this.on(InteractionType, (Interaction: Interaction) => {
            const interactionsByType = this.Interactions[InteractionType];
            const command = this.splitCommand(Interaction[trigger]);

            this.ProcessInteraction(Interaction, interactionsByType, command);
        });
    }

    public sendInteractionNotExecutable(Interaction: Interaction | CommandInteraction | MessageComponentInteraction | ButtonInteraction | SelectMenuInteraction | AnySelectMenuInteraction | ModalSubmitInteraction) {
        if (Interaction.isRepliable()) {
            Interaction.reply({ content: "Sorry This Interaction is not avaible or outdated", ephemeral: true })
                .catch((e) => {
                    logger.error("InteractionManager: Cant send Not Executable reply");
                    logger.error(JSON.stringify(e));
                })
        } else {
            Interaction.user.send({ content: "Sorry This Interaction is not avaible or outdated" })
                .catch((e) => {
                    logger.error("InteractionManager: Cant send Not Executable DM message");
                    logger.error(JSON.stringify(e));
                })
        }
    }

    private InteractionEmitType(interaction: Interaction) {
        this.emit(InteractionType.Any, interaction);

        if (interaction.isButton()) {
            logger.info("interaction isButton", interaction.customId);
            this.emit(InteractionType.Button, interaction);
        }
        if (interaction.isAutocomplete()) {
            logger.info("interaction Autocomplete", interaction.commandName);
            this.emit(InteractionType.Autocomplete, interaction);
        }
        if (interaction.isAnySelectMenu()) {
            logger.info("interaction AnySelectMenu", interaction.customId);
            this.emit(InteractionType.AnySelectMenu, interaction);
        }
        if (interaction.isChannelSelectMenu()) {
            logger.info("interaction ChannelSelectMenu", interaction.customId);
            this.emit(InteractionType.ChannelSelectMenu, interaction);
        }
        if (interaction.isCommand()) {
            logger.info("interaction Command", interaction.commandName);
            this.emit(InteractionType.Command, interaction);
        }
        if (interaction.isContextMenuCommand()) {
            logger.info("interaction ContextMenuCommand", interaction.commandName);
            this.emit(InteractionType.ContextMenuCommand, interaction);
        }
        if (interaction.isMentionableSelectMenu()) {
            logger.info("interaction MentionableSelectMenu", interaction.customId);
            this.emit(InteractionType.MentionableSelectMenu, interaction);
        }
        if (interaction.isMessageComponent()) {
            logger.info("interaction MessageComponent", interaction.customId);
            this.emit(InteractionType.MessageComponent, interaction);
        }
        if (interaction.isMessageContextMenuCommand()) {
            logger.info("interaction MessageContextMenuCommand", interaction.commandName);
            this.emit(InteractionType.MessageContextMenuCommand, interaction);
        }
        if (interaction.isModalSubmit()) {
            logger.info("interaction ModalSubmit", interaction.customId);
            this.emit(InteractionType.ModalSubmit, interaction);
        }
        if (interaction.isRoleSelectMenu()) {
            logger.info("interaction RoleSelectMenu", interaction.customId);
            this.emit(InteractionType.RoleSelectMenu, interaction);
        }
        if (interaction.isStringSelectMenu()) {
            logger.info("interaction StringSelectMenu", interaction.customId);
            this.emit(InteractionType.StringSelectMenu, interaction);
        }
        if (interaction.isUserSelectMenu()) {
            logger.info("interaction UserSelectMenu", interaction.customId);
            this.emit(InteractionType.UserSelectMenu, interaction);
        }
        if (interaction.isUserContextMenuCommand()) {
            logger.info("interaction UserContextMenuCommand", interaction.commandName);
            this.emit(InteractionType.UserContextMenuCommand, interaction);
        }
    }

    addInteraction(Data: { name: string, type: InteractionsType, data: ManagerInteraction }) {
        let InteractionTemplate: ManagerInteraction = Data.data;
        this.Interactions[Data.type].set(Data.name, InteractionTemplate);
        logger.info(`InteractionManager: Global Interaction added. Name:${Data.name} Type:${Data.type}`);
    }
}