import cfg from "./config";
import EventsManager from "@core/EventsManager";
import { Events } from "discord.js";
import { processMessage } from "./counter";
import { ModuleBuilder } from "@utils/index"
import logger from "@includes/logger";
import ModuleManager from "@core/ModuleManager";

const module = new ModuleBuilder();

module.setConfig(cfg.sql, cfg.template, cfg.prepareData);
module.setExecute(() => {
    logger.info("Message Counter");
    EventsManager.addEventTask(Events.MessageCreate, processMessage);
});

ModuleManager.addModule("MessageCounter", module.cfg, module.execute);

export default module;