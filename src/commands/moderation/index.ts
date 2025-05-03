import { ChatInputCommandInteraction } from "discord.js";
import { InteractionObject } from "../../includes/InteractionObject.class.js";

import Message from "./commands/purge.js";

export default [
    new InteractionObject<ChatInputCommandInteraction>("purge")
        .setExecutable(Message.mainCommand)
        .addSubOption("cache-check", Message.cacheSizeCommand)
        .addSubOption("any", Message.deleteAnyMessages)
        .addSubOption("filter", Message.deleteMessagesWithFilters)
];