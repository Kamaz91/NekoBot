import { ModuleBuilder } from "@src/utils";
import cfg from "./config"
import logger from "@includes/logger";
import ModuleManager from "@core/ModuleManager";

const module = new ModuleBuilder();

module.setConfig(cfg.sql, cfg.template, cfg.prepareData);
module.setExecute(() => {
    logger.info("Quotes");
});

ModuleManager.addModule("Quotes", module.cfg, module.execute);

export default module;