import { Knex } from "knex";
import logger from "./logger";
import Config from "./config";

type ModuleSQL = Array<(guildsArray: string[]) => Knex.QueryBuilder>;
type ModuleTemplate = Record<string, any>;
type ModuleProcessData = (GuildsIds: string[], data: any[]) => Map<string, any>;

interface ModuleData {
    SQL: ModuleSQL;
    Template: ModuleTemplate;
    PrepareData: ModuleProcessData;
}

interface RegisteredModule {
    Data: ModuleData;
    Execute: Function;
}

export default class ModuleManager {
    public RegisteredModules: Map<string, RegisteredModule>;

    constructor() {
        this.RegisteredModules = new Map();
    }

    addModule(Name: string, Data: ModuleData, Execute: Function) {
        this.RegisteredModules.set(Name, { Data, Execute });
        logger.info("ModuleManager: Registered Module " + Name)
    }

    setConfigReadyListener(config: Config) {
        logger.info("ModuleManager: Config state " + config.state.state);
        config.whenReady(() => { this.ExecuteModules() });
    }

    ExecuteModules() {
        if (this.RegisteredModules.size <= 0) {
            logger.info("ModuleManager: No Registered Modules to start");
            return;
        }

        logger.info("ModuleManager: Starting Modules");
        for (const [Name, Module] of this.RegisteredModules) {
            logger.info("ModuleManager: Starting Module " + Name)
            Module.Execute();
        }
    }
}