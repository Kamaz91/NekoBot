import { BaseImageURLOptions, ChatInputCommandInteraction } from "discord.js";
import { getUsersFromMention } from "./utils.js";

export async function mainCommand(interaction: ChatInputCommandInteraction) {
    const MaxAvatars = 10;
    const Options: BaseImageURLOptions = {
        size: 4096
    }
    const Users = interaction.options.get("users");

    if (Users) {
        let avatars = "";
        let i = 0;

        for (const user of getUsersFromMention(Users)) {
            i++;
            avatars += user.avatarURL(Options) + "\n";

            if (i >= MaxAvatars)
                break;
        }
        interaction.reply({ content: avatars, ephemeral: true }).catch(console.error);
        return;
    }
    interaction.reply({ content: interaction.user.avatarURL(Options)?.toString(), ephemeral: true }).catch(console.error);
}
