import { ApplicationCommandType, ContextMenuCommandBuilder, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { Database, Disconnect } from '@includes/database';

const commandsDefs = {
    Ping: new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Ping Pong!')
        .toJSON(),
    Quotes: [
        new ContextMenuCommandBuilder()
            .setName("quote-create")
            .setDMPermission(false)
            .setType(ApplicationCommandType.Message)
            .toJSON(),
        new SlashCommandBuilder()
            .setName("quote")
            .setDescription("Quotes")
            .setDMPermission(false)
            .toJSON()],
    Avatar: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription('Show user avatar image')
        .setDMPermission(false)
        .addStringOption((option) => {
            return option
                .setName('users')
                .setDescription('The users you want to see avatars, max 10. Use mentions with @')
                // Ensure the text will fit in an embed description, if the user chooses that option
                .setMaxLength(2000)
        })
        .toJSON(),
    Rock: new SlashCommandBuilder()
        .setName("rock")
        .setDescription('Rock Paper Scisors')
        .setDMPermission(false)
        .addUserOption((Option) => {
            return Option
                .setName('user')
                .setDescription('The user you want to battle!')
                .setRequired(true);
        })
        .toJSON(),
    Tapmusic: new SlashCommandBuilder()
        .setName("tapmusic")
        .setDescription('TapMusic image')
        .setDMPermission(true)
        .addStringOption((Option) =>
            Option
                .setName('username')
                .setDescription('The lastFM username you want image')
                .setRequired(true)
        )
        .toJSON(),
    Test: new SlashCommandBuilder()
        .setName("test")
        .setDescription('Test Test!')
        .toJSON(),
};
(async () => {
    const Tokens = await GetTokens();

    const rest = new REST({ version: '10' }).setToken(Tokens.discord.token);
    var commands = new Array();

    for (const [, command] of Object.entries(commandsDefs)) {
        if (Array.isArray(command)) {
            for (const key of command) {
                console.log("Registering interaction:");
                console.log(key);
                commands.push(key);
            }
        } else {
            console.log("Registering interaction:");
            console.log(command);
            commands.push(command);
        }
    }
    try {
        console.log('Started refreshing application (/) commands.');
        // Register Global
        await rest.put(Routes.applicationCommands(Tokens.clientId.token), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
    Disconnect();
})();

async function GetTokens() {
    return {
        discord: await Database().from("api_tokens").select("*").where({ token_type: "discord" }).first(),
        clientId: await Database().from("api_tokens").select("*").where({ token_type: "DiscordClientId" }).first()
    }
}


/**
// Register Guild Command
const PFAcommands = [
    {
        name: 'nusit',
        description: 'Nushit! null00',
    },
];
await rest.put(Routes.applicationGuildCommands(CLIENT_ID, "166913928746500097"), { body: PFAcommands });
 */