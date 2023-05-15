import axios from "axios";
import { CommandInteraction, AttachmentBuilder } from "discord.js";
import InteractionManager from "@core/InteractionManager";
import { InteractionBuilder } from "@src/utils";

async function execute(interaction: CommandInteraction) {
    const User = interaction.options.get("username");

    if (!User?.value) {
        interaction.reply({ content: "User not specified" });
        return;
    }

    var image = await axios.get('https://tapmusic.net/lastfm/collage.php', {
        responseType: 'arraybuffer',
        params: {
            user: encodeURIComponent(User.value),
            type: "7day",
            size: "3x3",
            caption: "true",
            playcount: "true"
        }
    }).then(response => Buffer.from(response.data, 'binary'));

    var imgAttachment = new AttachmentBuilder(image, { name: "3x3.jpg" });
    interaction.reply({ files: [imgAttachment] });
}

const Command = new InteractionBuilder("tapmusic").SlashCommand(execute, "infinite");
InteractionManager.addGlobalInteraction(Command);