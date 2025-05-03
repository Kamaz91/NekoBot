import { ApplicationCommandType, ContextMenuCommandBuilder, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import dotenv from "@dotenvx/dotenvx";
dotenv.config();

const commandsDefs = {
    Ping: new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Ping Pong!')
        .toJSON(),
    Quotes: [
        new ContextMenuCommandBuilder()
            .setName("quote-create")
            .setContexts(0)
            .setType(ApplicationCommandType.Message)
            .toJSON(),
        new SlashCommandBuilder()
            .setName("quote")
            .setDescription("Quotes")
            .setContexts(0)
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
        .setContexts(0)
        .addStringOption((option) => {
            return option
                .setName('users')
                .setDescription('The users you want to see avatars, max 10. Use mentions with @')
                // Ensure the text will fit in an embed description, if the user chooses that option
                .setMaxLength(2000)
        })
        .toJSON(),
    Reminder: new SlashCommandBuilder()
        .setName("reminder")
        .setDescription('Set Remider')
        .setContexts(0)
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
        .setContexts(0)
        .addSubcommand((Option) =>
            Option
                .setName("3x3")
                .setDescription("Showing 3x3 Albums Grid")
                .addStringOption((Option) =>
                    Option
                        .setName('username')
                        .setDescription('The lastFM username you want albums')
                        .setRequired(true)
                )
        )
        .toJSON(),
    MessageManagment: new SlashCommandBuilder()
        .setName("purge")
        .setDescription('Delete messages from channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(0)
        .addSubcommand((Option) =>
            Option
                .setName("cache-check")
                .setDescription("Check messages cache size")
        )
        .addSubcommand((Option) =>
            Option
                .setName("any")
                .setDescription("Delete messages with filters")
                .addNumberOption((Option) =>
                    Option
                        .setName("limit")
                        .setDescription("Limit messages to delete")
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true)
                )
        )
        .addSubcommand((Option) =>
            Option
                .setName("filter")
                .setDescription("Delete messages with filter")
                .addStringOption((Option) =>
                    Option
                        .setName("filter")
                        .setDescription("Filter messages")
                        .setRequired(true)
                        .addChoices(
                            { name: "images", value: "images" },
                            { name: "audio", value: "audio" },
                            { name: "video", value: "video" },
                            { name: "text", value: "text" },
                            { name: "mentions-users", value: "mentions-users" },
                            { name: "mentions-roles", value: "mentions-roles" },
                            { name: "attachments", value: "attachments" },
                            { name: "files", value: "files" },
                            { name: "embeds", value: "embeds" }
                        )
                )
                .addNumberOption((Option) =>
                    Option
                        .setName("limit")
                        .setDescription("Limit messages to delete")
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true)
                )
                .addUserOption((Option) =>
                    Option
                        .setName("user")
                        .setDescription("User to filter messages")
                        .setRequired(false)
                )
        )
        .toJSON()
};
(async () => {

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_KEY);
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
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

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