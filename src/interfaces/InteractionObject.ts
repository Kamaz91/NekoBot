import { ChatInputCommandInteraction, Snowflake } from "discord.js";
import { ManagerInteractionTypes } from "../types/core.js";

export interface InteractionObjectInterface<T extends ManagerInteractionTypes> {
    name: string;
    subOptions: Map<string, (interaction?: Extract<T, ChatInputCommandInteraction>, id?: string) => void>;
    checkEnabled: boolean;
    settingsTable?: string;
    mainExecutable: InteractionObjectExecutable<T>;

    addSubOption(name: string, executable: () => void): this;
    setExecutable(executable: (interaction: T) => void): this;
    setCheckIfEnabled(table: string): this;
    process(interaction: ManagerInteractionTypes, id?: string);
}

export type InteractionObjectExecutable<T> = (interaction: T, snowflake?: Snowflake) => void;