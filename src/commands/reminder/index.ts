import { ChatInputCommandInteraction } from "discord.js";
import { mainCommand } from "./reminder.js";
import { InteractionObject } from "../../includes/InteractionObject.class.js";

export default new InteractionObject<ChatInputCommandInteraction>("reminder").setExecutable(mainCommand);
