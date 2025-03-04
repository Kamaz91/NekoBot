import { ModuleBuilder } from "../../utils/index.js";
import cfg from "./config.js"
import logger from "../../services/logger/index.js";
import ModuleManager from "../../core/ModuleManager.js";

const module = new ModuleBuilder();

module.setConfig(cfg.sql, cfg.template, cfg.prepareData);
module.setExecute(() => {
    logger.info("Quotes");
});

ModuleManager.addModule("Quotes", module.cfg, module.execute);

export default module;