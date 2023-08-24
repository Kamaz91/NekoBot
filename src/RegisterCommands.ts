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
            .addSubcommand((Option) =>
                Option
                    .setName("show")
                    .setDescription("Show quote")
                    .addNumberOption((Option) =>
                        Option
                            .setName('quote-position')
                            .setDescription('Quote number')))
            .addSubcommand((Option) =>
                Option
                    .setName("show-embed")
                    .setDescription("Showing quote template"))
            .addSubcommand((Option) =>
                Option
                    .setName("delete-template")
                    .setDescription("Deletes actual quote template"))
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
    Reminder: new SlashCommandBuilder()
        .setName("reminder")
        .setDescription('Set Remider')
        .setDMPermission(true)
        .addNumberOption((Option) =>
            Option
                .setName('year')
                .setDescription('4 digits e.g. 2023')
                .setRequired(true)
        )
        .addNumberOption((Option) =>
            Option
                .setName('month')
                .setDescription('Month in range from 1 to 12')
                .setMinValue(1)
                .setMaxValue(12)
                .setRequired(true)
        )
        .addNumberOption((Option) =>
            Option
                .setName('day')
                .setDescription('Day in range from 1 to 31')
                .setMinValue(1)
                .setMaxValue(31)
                .setRequired(true)
        )
        .addNumberOption((Option) =>
            Option
                .setName('hour')
                .setDescription('Hour in range from 0 to 23')
                .setMinValue(0)
                .setMaxValue(23)
                .setRequired(true)
        )
        .addNumberOption((Option) =>
            Option
                .setName('minute')
                .setDescription('Minute in range from 0 to 59')
                .setMinValue(0)
                .setMaxValue(59)
                .setRequired(true)
        )
        .addStringOption((Option) =>
            Option
                .setName('text')
                .setDescription('Text to remind')
                .setRequired(true)
        )
        .toJSON(),
    LastFM: new SlashCommandBuilder()
        .setName("lastfm")
        .setDescription('lastfm api')
        .setDMPermission(true)
        .addSubcommand((Option) =>
            Option
                .setName("3x3")
                .setDescription("Showing 3x3 Albums Grid")
                .addStringOption((Option) =>
                    Option
                        .setName('username')
                        .setDescription('The lastFM username you want albums')
                        .setRequired(true)
                ))
        .toJSON()
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