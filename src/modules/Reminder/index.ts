import { ModuleBuilder } from "@src/utils";
import ModuleManager from "@core/ModuleManager";
import { StartCron } from "@modules/Reminder/cronJob"
import logger from "@src/includes/logger";

const module = new ModuleBuilder();
module.setExecute(() => {
    logger.info("Reminder: Started");
    StartCron();
});

ModuleManager.addModule("Reminder", module.cfg, module.execute);