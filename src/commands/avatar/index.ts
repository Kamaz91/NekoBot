import { ChatInputCommandInteraction } from "discord.js";
import { mainCommand } from "./avatar.js";
import { InteractionObject } from "../../includes/InteractionObject.class.js";

export default new InteractionObject<ChatInputCommandInteraction>("avatar").setExecutable(mainCommand);
