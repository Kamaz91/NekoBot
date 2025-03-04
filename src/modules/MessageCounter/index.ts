import cfg from "./config.js";
import EventsManager from "../../core/EventsManager.js";
import { Events } from "discord.js";
import { processMessage } from "./counter.js";
import { ModuleBuilder } from "../../utils/index.js"
import logger from "../../services/logger/index.js";
import ModuleManager from "../../core/ModuleManager.js";

const module = new ModuleBuilder();

module.setConfig(cfg.sql, cfg.template, cfg.prepareData);
module.setExecute(() => {
    logger.info("Message Counter");
    EventsManager.addEventTask(Events.MessageCreate, processMessage);
});

ModuleManager.addModule("MessageCounter", module.cfg, module.execute);

export default module;