import { ChatInputCommandInteraction } from "discord.js";
import { mainCommand, print3x3Grid } from "./lastfm.js";
import { InteractionObject } from "../../includes/InteractionObject.class.js";

export default
    new InteractionObject<ChatInputCommandInteraction>("lastfm")
        .setExecutable(mainCommand)
        .addSubOption("3x3", print3x3Grid);
