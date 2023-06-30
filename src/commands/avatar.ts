import { BaseImageURLOptions, CommandInteraction, SlashCommandBuilder, User } from "discord.js";
import InteractionManager from "@core/InteractionManager";
import { Client } from "@core/Bot"
import { InteractionBuilder } from "@utils/index";

function getUsersFromMention(mention) {
    // The id is the first and only match found by the RegEx.
    const matches: string[] = mention.match(/<@?(\d+)>/g);

    // If supplied variable was not a mention, matches will be null instead of an array.
    if (!matches) return [];

    var Users: User[] = new Array;
    for (const id of matches) {
        let userId = id.substring(2).slice(0, -1).trim();

        if (Client.users.cache.has(userId)) {
            let user = Client.users.cache.get(userId)
            Users.push(user);
        }
    }

    return Users;
}

const name = "avatar";

async function execute(interaction: CommandInteraction) {
    const MaxAvatars = 10;
    const Options: BaseImageURLOptions = {
        size: 4096
    }
    const Users = interaction.options.get("users");

    if (Users) {
        let avatars = "";
        let i = 0;

        for (const user of getUsersFromMention(Users.value)) {
            i++;
            avatars += user.avatarURL(Options) + "\n";

            if (i >= MaxAvatars)
                break;
        }
        interaction.reply({ content: avatars, ephemeral: true }).catch(console.error);
        return;
    }
    interaction.reply({ content: interaction.user.avatarURL(Options), ephemeral: true }).catch(console.error);
}

let Command = new InteractionBuilder(name)
    .setExecute(execute)
    .SlashCommand();

InteractionManager.addInteraction(Command);