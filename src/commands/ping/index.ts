import { ChatInputCommandInteraction } from "discord.js";
import { mainCommand } from "./ping.js";
import { InteractionObject } from "../../includes/InteractionObject.class.js";

export default new InteractionObject<ChatInputCommandInteraction>("ping").setExecutable(mainCommand);
