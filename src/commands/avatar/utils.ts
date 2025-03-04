import { User } from "discord.js";
import { Client } from "../../core/Bot.js";

export function getUsersFromMention(mention) {
    // The id is the first and only match found by the RegEx.
    const matches: string[] = mention.match(/<@?(\d+)>/g);

    // If supplied variable was not a mention, matches will be null instead of an array.
    if (!matches) return [];

    var Users: User[] = new Array;
    for (const id of matches) {
        let userId = id.substring(2).slice(0, -1).trim();

        if (Client.users.cache.has(userId)) {
            let user = Client.users.cache.get(userId)
            Users.push(user);
        }
    }

    return Users;
}