import { CommandInteraction } from "discord.js";
import InteractionManager from "@core/InteractionManager";
import { InteractionBuilder } from "@utils/index";

const name = "ping";

async function execute(interaction: CommandInteraction) {
    interaction.reply("Pong!");
}

let Command = new InteractionBuilder(name)
    .setExecute(execute)
    .SlashCommand("infinite");

InteractionManager.addGlobalInteraction(Command);