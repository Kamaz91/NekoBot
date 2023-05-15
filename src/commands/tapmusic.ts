import axios from "axios";
import { CommandInteraction, AttachmentBuilder } from "discord.js";
import InteractionManager from "@core/InteractionManager";
import { InteractionBuilder } from "@src/utils";
import logger from "@includes/logger";

async function execute(interaction: CommandInteraction) {
    const User = interaction.options.get("username");

    if (!User?.value) {
        interaction.reply({ content: "User not specified", ephemeral: true });
        return;
    }
    await axios.get('https://tapmusic.net/lastfm/collage.php', {
        responseType: 'arraybuffer',
        params: {
            user: encodeURIComponent(User.value),
            type: "7day",
            size: "3x3",
            caption: "true",
            playcount: "true"
        }
    })
        .then(response => {
            if (response.headers["content-type"] == "image/jpeg") {
                var imgAttachment = new AttachmentBuilder(Buffer.from(response.data, 'binary'), { name: "3x3.jpg" });
                interaction.reply({ files: [imgAttachment] })
                    .catch(e => {
                        logger.error(`TapMusic: Image success, cant reply`);
                        console.log(e);
                    });
            } else {
                interaction.reply({ content: `User:${User.value} not found`, ephemeral: true })
                    .catch(e => {
                        logger.error(`TapMusic: User:${User.value} not found, cant reply`);
                        console.log(e);
                    });
            }
        })
        .catch(e => {
            interaction.reply({ content: "Something went wrong", ephemeral: true })
                .catch(e => {
                    logger.error("TapMusic: axios error, cant reply");
                    console.log(e);
                });
            logger.error("Tapmusic: axios error");
            console.log(e);
        });
}

const Command = new InteractionBuilder("tapmusic").SlashCommand(execute, "infinite");
InteractionManager.addGlobalInteraction(Command);