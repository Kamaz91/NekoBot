import cfg from "./config";
import { EventsManager } from "@core/Bot";
import { Events } from "discord.js";
import { processMessage } from "./counter";
import logger from "@includes/logger";

export default { cfg, execute };

function execute() {
    logger.info("Message Counter");
    EventsManager.addEventTask(Events.MessageCreate, processMessage);
}


