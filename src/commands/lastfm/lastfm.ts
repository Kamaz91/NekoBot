import { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js";
import InteractionManager from "../../core/InteractionManager.js";
import logger from "../../services/logger/index.js";
import LastfmApi from "../../utils/lastfmApi.js";
import { errorLog } from "../../utils/index.js";
import { processImage } from "./utils.js";
import { GetApiKey } from "./database.js";

var lastfmapi: LastfmApi;

async function run() {
    let token = await GetApiKey();
    lastfmapi = new LastfmApi(token);
}
run();

export async function mainCommand(interaction: ChatInputCommandInteraction) {
    InteractionManager.sendInteractionNotExecutable(interaction);
}

export async function print3x3Grid(interaction?: ChatInputCommandInteraction, id?) {
    var OptionUsername = interaction?.options.get("username");
    var attachments = new Array();

    if (!OptionUsername?.value) {
        interaction?.reply({ ephemeral: true, content: "No Username defined" }).catch(e => errorLog(logger, "LastFM: Reply Error", e));
        return;
    }
    let response = await lastfmapi.getWeeklyAlbumChart(OptionUsername.value.toString());

    if (lastfmapi.isError(response)) {
        logger?.error(`Error:${response.error} ${response.message}`);
        interaction?.reply({ content: response.message, ephemeral: true }).catch();
        return;
    }
    interaction?.deferReply().catch();
    const filteredAlbumCharts = response.weeklyalbumchart.album.filter((_el, index, _arr) => index < 9);
    let imageArray = new Array();
    for (const albumChart of filteredAlbumCharts) {
        let albumInfo = await lastfmapi.getAlbumInfo(albumChart.artist["#text"], albumChart.name);
        if (lastfmapi.isError(albumInfo)) {
            // Blank image
            logger?.error(`Error:${albumInfo.error} ${albumInfo.message}`);
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
        interaction?.editReply({ files: attachments }).catch(e => errorLog(logger, "LastFM: Reply Error", e));
    } else {
        interaction?.editReply({ content: "Something Went Wrong" }).catch(e => errorLog(logger, "LastFM: Reply Error", e));
    }
}