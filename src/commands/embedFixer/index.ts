import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { InteractionObject } from "../../includes/InteractionObject.class.js";
import { ConfirmToExtract } from "./buttons/confirm.js";

export default new InteractionObject<ButtonInteraction>("avatar").setExecutable(ConfirmToExtract);
