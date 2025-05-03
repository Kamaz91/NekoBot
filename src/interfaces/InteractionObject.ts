import { ChatInputCommandInteraction, Snowflake } from "discord.js";
import { ManagerInteractionTypes } from "../types/core.js";

export interface InteractionObjectInterface<T extends ManagerInteractionTypes> {
    name: string;
    subOptions: Map<string, (interaction?: Extract<T, ChatInputCommandInteraction>, id?: string) => Promise<void>>;
    checkEnabled: boolean;
    settingsTable?: string;
    mainExecutable: InteractionObjectExecutable<T>;

    addSubOption(name: string, executable: () => Promise<void>): this;
    setExecutable(executable: (interaction: T) => Promise<void>): this;
    setCheckIfEnabled(table: string): this;
    process(interaction: ManagerInteractionTypes, id?: string): Promise<void>;
}

export type InteractionObjectExecutable<T> = (interaction: T, snowflake?: Snowflake) => void;