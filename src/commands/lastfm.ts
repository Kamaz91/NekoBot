import { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js";
import { loadImage, createCanvas } from 'canvas';
import InteractionManager from "@core/InteractionManager";
import { Database } from "@includes/database";
import logger from "@includes/logger";
import InteractionBuilder from "@utils/InteractionBuilder";
import LastfmApi from "@utils/lastfmApi";
import { errorLog } from "@src/utils";

var lastfmapi = null;

async function run() {
    let token = await GetApiKey();
    lastfmapi = new LastfmApi(token);
}
run();

async function SlashCommandExecute(interaction: ChatInputCommandInteraction) {
    const SubCommand = interaction.options.getSubcommand();
    switch (SubCommand) {
        case "3x3": print3x3Grid(interaction); break;
        default: InteractionManager.sendInteractionNotExecutable(interaction);
    }
}

async function print3x3Grid(interaction: ChatInputCommandInteraction) {
    var OptionUsername = interaction.options.get("username");
    var attachments = new Array();

    if (!OptionUsername) {
        interaction.reply({ ephemeral: true, content: "No Username defined" }).catch(e => errorLog(logger, "LastFM: Reply Error", e));
        return;
    }
    let response = await lastfmapi.getWeeklyAlbumChart(OptionUsername.value.toString());

    if (lastfmapi.isError(response)) {
        logger.error(`Error:${response.error} ${response.message}`);
        interaction.reply({ content: response.message, ephemeral: true }).catch();
        return;
    }
    interaction.deferReply().catch();
    const filteredAlbumCharts = response.weeklyalbumchart.album.filter((_el, index, _arr) => index < 9);
    let imageArray = new Array();
    for (const albumChart of filteredAlbumCharts) {
        let albumInfo = await lastfmapi.getAlbumInfo(albumChart.artist["#text"], albumChart.name);
        if (lastfmapi.isError(albumInfo)) {
            // Blank image
            logger.error(`Error:${albumInfo.error} ${albumInfo.message}`);
            break;
        }
        let albumImage = albumInfo.album.image.find((el => el.size == "extralarge"));
        imageArray.push(processImage(albumImage["#text"], albumChart.artist["#text"], albumInfo.album.name, albumChart.playcount).catch(err => errorLog(logger, "LastFM: getBuffer error", err)));
    }
    let images = await Promise.all(imageArray).catch(err => errorLog(logger, "LastFM: getBuffer error", err));
    if (images) {
        for (const image of images) {
            let builder = new AttachmentBuilder(image, { name: "3x3.jpg" });
            attachments.push(builder);
        }
        interaction.editReply({ files: attachments }).catch(e => errorLog(logger, "LastFM: Reply Error", e));
    } else {
        interaction.editReply({ content: "Something Went Wrong" }).catch(e => errorLog(logger, "LastFM: Reply Error", e));
    }

}

async function processImage(url: string, artistName: string, albumName: string, playcount: string): Promise<Buffer> {
    // Capitalize first letter
    albumName = albumName.split("").map((val, index) => index == 0 ? val.toUpperCase() : val).join("");
    const width = 300;
    const height = 300;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    const imgText = `${artistName}\n${albumName}\nPlays:${playcount}`;

    context.quality = "best";

    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);

    if (url) {
        let imgdata = await loadImage(url);
        context.drawImage(imgdata, 0, 0);
    }

    context.font = 'bold 13pt Courier';
    context.shadowColor = "#000";
    context.shadowBlur = 1;
    context.fillStyle = '#FAFAFA';
    context.fillText(imgText, 10, 20);

    return canvas.toBuffer('image/png');
}

async function GetApiKey() {
    var query = await Database()
        .from("api_tokens")
        .select("*")
        .where({ token_type: "lastfm_api" })
        .first();

    if (!query) {
        logger.error("Lastfm: Cant get token");
        logger.error("Lastfm: token is empty");
        throw new Error("Lastfm: Database Query Error");
    }
    return query.token;
}

const Command = new InteractionBuilder("lastfm")
    .setExecute(SlashCommandExecute)
    .SlashCommand();
InteractionManager.addInteraction(Command);