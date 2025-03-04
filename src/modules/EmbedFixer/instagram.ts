import { EmbedFixerReply } from "../../types/embedFixer.js";

function getddinstagramdata(pathName: string): string {
    return `https://ddinstagram.com${pathName}`;
}
export async function processInstagram(data: URL): Promise<EmbedFixerReply | undefined> {
    let reply: EmbedFixerReply = {
        content: getddinstagramdata(data.pathname),
        supressEmbeds: true
    }

    return reply;
}