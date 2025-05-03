import { Client, Events } from "discord.js";
import logger from "../services/logger/index.js";
import { InteractionObjectInterface } from "../interfaces/InteractionObject.js";
import EventEmitter from "events";
import { ManagerInteractionTypes } from "../types/core.js";
import { InteractionObject } from "../includes/InteractionObject.class.js";

export default class InteractionManager extends EventEmitter {
    public Client: Client;
    public Interactions: Map<string, InteractionObjectInterface<ManagerInteractionTypes>> = new Map();

    constructor(Client: Client) {
        super();
        this.Client = Client;

        this.SetClientInteractionListener();
    }

    SetClientInteractionListener() {
        this.Client.on(Events.InteractionCreate, (interaction) => { this.HandleClientInteraction(interaction) });
    }

    HandleClientInteraction(interaction: ManagerInteractionTypes) {
        let interactionName = this.getInteractionName(interaction);
        let extracted = this.extractCommandName(interactionName);
        logger.debug(`[InteractionManager] -> [HandleClientInteraction] extracted: {id:${extracted.id}, name:${extracted.name}}`);

        const interactionHandler = this.Interactions.get(extracted.name);

        if (interactionHandler) {
            logger.debug(`[InteractionManager] -> [HandleClientInteraction] interactionHandler: true`);
            this.ProcessInteraction(interaction, interactionHandler, extracted.id);
        } else {
            logger.debug(`[InteractionManager] -> [HandleClientInteraction] interactionHandler: false`);
            this.sendInteractionNotExecutable(interaction);
        }
    }

    splitCommand(command: string): { id: string | null, name: string } {
        const pattern = /^(.*):<(\d+)>$/;
        const match = command.match(pattern);

        if (match) {
            const [, name, id] = match;
            return {
                id: id ? id.trim() : undefined,
                name: name.trim()
            };
        }

        return {
            id: undefined,
            name: command.trim()
        };
    }

    public getInteractionName(interaction: ManagerInteractionTypes) {
        if ("commandName" in interaction) {
            return interaction.commandName;
        }
        return interaction.customId;
    }

    public extractCommandName(InteractionName: string) {
        return this.splitCommand(InteractionName);
    }

    private ProcessInteraction(interaction: ManagerInteractionTypes, interactionHandler: InteractionObjectInterface<ManagerInteractionTypes>, id?: string) {
        interactionHandler.process(interaction, id)
            .catch((e) => {
                logger.error("[InteractionManager] -> [ProcessInteraction] Error!");
                logger.error(e);
            });
    }

    public sendInteractionNotExecutable(Interaction: ManagerInteractionTypes) {
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

    addInteraction(interactionObject: InteractionObject<ManagerInteractionTypes>) {
        logger.debug(`[InteractionManager] adding interaction Name:${interactionObject.name}`);
        this.Interactions.set(interactionObject.name, interactionObject);
        logger.info(`[InteractionManager] Interaction added. Name:${interactionObject.name}`);
    }
}