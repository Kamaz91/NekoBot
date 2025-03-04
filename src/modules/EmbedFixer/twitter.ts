import { EmbedBuilder } from "discord.js";
import logger from "../../services/logger/index.js";
import type { EmbedFixerReply, fxTwitterApiMediaVideo, fxTwitterApiResponse } from "../../types/embedFixer.js";
import axios, { AxiosResponse } from "axios";

async function getFxtwitterdata(pathName: string): Promise<fxTwitterApiResponse | undefined> {
    let request = await axios.get(`https://api.fxtwitter.com${pathName}`, {})
        .then((response: AxiosResponse<fxTwitterApiResponse>) => {
            return response.data;
        }).catch((error) => {
            logger?.error("[Embed Fixer] Error while fetching data from fxtwitter api")
            logger?.error(JSON.stringify(error))
            return undefined;
        }
        );
    return request;
}

function getVideos(videos: fxTwitterApiMediaVideo[]): string[] {
    let videosUrl: string[] = [];
    for (const video of videos) {
        // get the highest bitrate video
        let bestVariant = video.variants.reduce((prev, current) => (prev.bitrate && current.bitrate && prev.bitrate > current.bitrate) ? prev : current);
        videosUrl.push(bestVariant.url);
    }
    return videosUrl;
}

function buildReply(twitterData: fxTwitterApiResponse): EmbedFixerReply {
    let reply: EmbedFixerReply = {
        content: twitterData.tweet.media?.videos ? getVideos(twitterData.tweet.media.videos).join("\n") : "",
        embed: new EmbedBuilder()
            .setTitle(twitterData.tweet.author.name)
            .setDescription(twitterData.tweet.text.length > 0 ? twitterData.tweet.text : "No text")
            .setURL(twitterData.tweet.url)
            .setTimestamp(new Date(twitterData.tweet.created_at))
            .setAuthor({ name: twitterData.tweet.author.name, iconURL: twitterData.tweet.author.avatar_url })
            .setFooter({ text: "Twitter" })
            .setThumbnail(twitterData.tweet.author.avatar_url)
            .setColor("#1DA1F2")
    }
    return reply;
}

export async function processTwitter(data: URL): Promise<EmbedFixerReply | undefined> {
    try {
        let twitterData = await getFxtwitterdata(data.pathname);
        logger?.debug("[Embed Fixer] Twitter Data:");
        console.log(twitterData);
        if (twitterData?.code == 200 && twitterData.tweet.media?.videos) {
            return buildReply(twitterData);
        }
        return undefined;
    } catch (error) {
        logger?.error("[Embed Fixer] Error while processing twitter data");
        logger?.error(JSON.stringify(error));
        return undefined;
    }
}