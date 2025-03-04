import { ModuleBuilder } from "../..//utils/index.js";
import ModuleManager from "../../core/ModuleManager.js";
import { StartCron } from "../../modules/Reminder/cronJob.js"
import logger from "../../services/logger/index.js";

const module = new ModuleBuilder();
module.setExecute(() => {
    logger.info("Reminder: Started");
    StartCron();
});

ModuleManager.addModule("Reminder", module.cfg, module.execute);