import { CommandInteraction, SlashCommandBuilder } from "discord.js";
const name = "pong";
var def = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Ping Pong!');

async function execute(interaction: CommandInteraction) {
    interaction.reply("Pong!");
}

export default {
    def, execute, name
}