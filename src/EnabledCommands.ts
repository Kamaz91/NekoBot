import InteractionManager from "./core/InteractionManager.js";

import pingCommand from "./commands/ping/index.js";
import avatarCommand from "./commands/avatar/index.js";

import reminderCommand from "./commands/reminder/index.js";
import lastFM from "./commands/lastfm/index.js";
import quoteCommands from "./commands/quotes/index.js";

let Array = [...quoteCommands, avatarCommand, lastFM, reminderCommand, pingCommand];

for (const Command of Array) {
    InteractionManager.addInteraction(Command);
}