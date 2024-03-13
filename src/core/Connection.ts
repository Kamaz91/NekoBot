import { Client, GatewayIntentBits } from "discord.js";

export default new Client({
    intents: [
        GatewayIntentBits.Guilds,
        "DirectMessages",
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "GuildMessageReactions",
        "GuildMessageTyping",
        "MessageContent",
        "GuildEmojisAndStickers",
        "GuildVoiceStates"
    ]
});