import axios from "axios";
import { CommandInteraction, SlashCommandBuilder, AttachmentBuilder } from "discord.js";

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

const name = "tapmusic";

var def = new SlashCommandBuilder()
    .setName(name)
    .setDescription('TapMusic image')
    .setDMPermission(true)
    .addStringOption((Option) =>
        Option
            .setName('username')
            .setDescription('The lastFM username you want image')
            .setRequired(true)
    );

export default {
    def, execute, name
}