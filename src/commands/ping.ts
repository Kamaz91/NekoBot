import { ChatInputCommandInteraction } from "discord.js";
import InteractionManager from "@core/InteractionManager";
import { InteractionBuilder } from "@utils/index";

const name = "ping";

async function execute(interaction: ChatInputCommandInteraction) {
    interaction.reply("Pong!");
}

let Command = new InteractionBuilder(name)
    .setExecute(execute)
    .SlashCommand();

InteractionManager.addInteraction(Command);