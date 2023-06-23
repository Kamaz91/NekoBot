import axios from "axios";
import { CommandInteraction, AttachmentBuilder, CommandInteractionOption } from "discord.js";
import InteractionManager from "@core/InteractionManager";
import { InteractionBuilder, wait } from "@src/utils";
import logger from "@includes/logger";

async function execute(interaction: CommandInteraction) {
    const User = interaction.options.get("username");

    if (!User?.value) {
        interaction.reply({ content: "User not specified", ephemeral: true });
        return;
    }
    await getImage(User.value.toString())
        .then(async response => {
            await interaction.deferReply();
            await wait(2000);
            if (response.headers["content-type"] == "image/jpeg") {
                let content = "";
                var imgAttachment = new AttachmentBuilder(Buffer.from(response.data, 'binary'), { name: "3x3.jpg" });
                if (!imgAttachment) content = ".";
                interaction.editReply({ content: content, files: [imgAttachment] })
                    .catch(e => {
                        interaction.user.send({ content: "Something went wrong, try again" });
                        logger.error(`TapMusic: Image success, cant reply`);
                        logger.error(JSON.stringify(e));
                    });
            } else {
                interaction.editReply({ content: `User:${User.value} not found` })
                    .catch(e => {
                        logger.error(`TapMusic: User:${User.value} not found, cant reply`);
                        logger.error(JSON.stringify(e));
                    });
            }
        })
        .catch(e => {
            interaction.editReply({ content: "Something went wrong, try again" })
                .catch(e => {
                    interaction.user.send({ content: "Something went wrong, try again" });
                    logger.error("TapMusic: axios error, cant reply");
                    logger.error(JSON.stringify(e));
                });
            logger.error("Tapmusic: axios error");
            logger.error(JSON.stringify(e));
        });
}

async function getImage(User: string) {
    return axios.get('https://tapmusic.net/lastfm/collage.php', {
        responseType: 'arraybuffer',
        params: {
            user: encodeURIComponent(User),
            type: "7day",
            size: "3x3",
            caption: "true",
            playcount: "true"
        }
    })
}

const Command = new InteractionBuilder("tapmusic")
    .setExecute(execute)
    .SlashCommand("infinite");
InteractionManager.addGlobalInteraction(Command);