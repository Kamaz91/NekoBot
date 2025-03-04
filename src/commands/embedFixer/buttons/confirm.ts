import { ButtonInteraction } from "discord.js";

import logger from "../../../services/logger/index.js";
import InteractionManager from "../../../core/InteractionManager.js";

export function ConfirmToExtract(Interaction: ButtonInteraction, id?: string): void {
    logger?.debug(`[ConfirmToExtract] -> [ConfirmToExtract] id:${id}`);
    Interaction.reply({ content: "Extracting...", flags: ["Ephemeral"] });
    InteractionManager.emit("extract", Interaction, id);
}