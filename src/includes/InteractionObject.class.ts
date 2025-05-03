import { Snowflake } from "discord.js";
import { InteractionObjectInterface } from "../interfaces/InteractionObject.js";
import { ManagerInteractionTypes } from "../types/core.js";
import logger from "../services/logger/index.js";

type InteractionType = ManagerInteractionTypes;

export class InteractionObject<T extends InteractionType> implements InteractionObjectInterface<T> {
    name: string;
    subOptions: Map<string, (interaction?: T, id?: string) => Promise<void>> = new Map();
    checkEnabled = false;
    settingsTable?: string = undefined;

    mainExecutable: (interaction: T, id?: Snowflake) => Promise<void>;

    constructor(name: string) {
        this.name = name;
    }

    async process(interaction: T, id?: string) {
        logger?.debug(`[InteractionObject:${this.name}] -> [process] id:${id}`);
        logger?.debug(`[InteractionObject:${this.name}] -> [process] subOptions size:${this.subOptions.size} isChatInputCommand:${interaction.isChatInputCommand()}`);
        if (this.subOptions.size > 0 && interaction.isChatInputCommand()) {
            logger?.debug(`[InteractionObject:${this.name}] -> [process] subcommand:true`);
            let subCommand = interaction.options.getSubcommand();
            let option = this.subOptions.get(subCommand);
            logger?.debug(`[InteractionObject:${this.name}] -> [process] subCommand:${subCommand}`);
            if (option) {
                await option(interaction, id);
            }
            return;
        }
        logger?.debug(`[InteractionObject:${this.name}] -> [process] subcommand:false`);
        logger?.debug(`[InteractionObject:${this.name}] -> [process] executing:mainExecutable`);
        await this.mainExecutable(interaction, id);
    }

    addSubOption(name: string, executable: (interaction?: T, id?: Snowflake) => Promise<void>) {
        this.subOptions.set(name, executable);
        return this;
    }

    setExecutable(execute: (interaction: T) => Promise<void>) {
        this.mainExecutable = execute;
        return this;
    }

    setCheckIfEnabled(table: string): this {
        this.checkEnabled = true;
        this.settingsTable = table;
        return this;
    }
}