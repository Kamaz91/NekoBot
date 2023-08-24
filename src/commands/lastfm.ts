import { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js";
import InteractionManager from "@core/InteractionManager";
import { Database } from "@includes/database";
import logger from "@includes/logger";
import InteractionBuilder from "@utils/InteractionBuilder";
import LastfmApi from "@utils/lastfmApi";
import { errorLog } from "@src/utils";
import axios from "axios";
import Jimp from "jimp";
import arrayBufferToBuffer from "arraybuffer-to-buffer"

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

async function processImage(url: string, artistName: string, albumName: string, playcount: string) {
    const fontBlack = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    const fontWhite = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
    const padding = 3;
    if (url) {
        let imageBuffer: Buffer = arrayBufferToBuffer(await downloadImage(url));
        var image = await Jimp.read(imageBuffer);
    } else {
        var image = await new Jimp(300, 300, "black");
    }

    image.print(fontBlack, 3, 2 + 1, artistName);
    image.print(fontBlack, 3, 16 + padding + 1, albumName);
    image.print(fontBlack, 3, 32 + padding + 1, "Plays: " + playcount);

    image.print(fontWhite, 2, 2, artistName);
    image.print(fontWhite, 2, 16 + padding, albumName);
    image.print(fontWhite, 2, 32 + padding, "Plays: " + playcount);

    image.quality(100);
    return new Promise((resolve, reject) => {
        image.getBuffer(Jimp.MIME_PNG, (err, Buffer) => {
            err == null ? resolve(Buffer) : reject(err);
        });
    });
}

async function downloadImage(url: string) {
    return axios.get(url, { responseType: 'arraybuffer' }).then(res => res.data);
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