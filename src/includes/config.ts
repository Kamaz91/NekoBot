import logger from "@includes/logger";
import { CronJob } from "cron";
import client from "@core/Connection";
import EventEmitter from "events";
import { ConfigModules } from "@/@types/config";
import ModuleManager from "@core/ModuleManager";

interface State {
    state: "initial" | "loading" | "loaded" | "updating";
    isLoaded: boolean;
}

export default class Config extends EventEmitter {
    public state: State
    public configJob;
    public guilds: Map<string, ConfigModules>;
    Templates: Map<string, Record<any, any>>

    private readyQueue: Function[];

    constructor() {
        super();
        this.readyQueue = new Array;
        this.setState("initial", false);
        this.guilds = new Map();

        this.on("config-updated", () => {
            if (this.readyQueue.length) {
                logger.info("Config: Executing tasks queue size:" + this.readyQueue.length);
                while (this.readyQueue.length) this.readyQueue.shift()();
            }
        });

        this.setCronjob();

        client.once('ready', async () => {
            this.setState("loading", false);
            logger.info("Config: Loading Settings");

            // GET ids of all connected guilds

            let Guilds = await client.guilds.fetch();
            let GuildsKeys = Array.from(Guilds.keys());

            await this.loadGuildConfig(GuildsKeys);
            logger.info("Config: Guilds List: " + GuildsKeys);

            this.configJob.start();
            this.emit('config-updated');
            this.emit('config-ready');
            this.setState("loaded", true);
        });
    }

    setCronjob() {
        this.configJob = new CronJob('0 */5 * * * *', async () => {
            this.setState("updating", false);
            logger.info('Config: Synchronization with database');
            let Guilds = await client.guilds.fetch();
            let GuildsKeys = Array.from(Guilds.keys());
            await this.loadGuildConfig(GuildsKeys);
            this.emit('config-updated');
            this.setState("loaded", true);
        });
    }

    setState(state, isLoaded) {
        this.state = {
            state: state,
            isLoaded: isLoaded
        }
    }

    async loadGuildConfig(guildsKeys: string[]) {
        logger.info("Config: Loading modules data");
        for (const [moduleName, module] of ModuleManager.RegisteredModules) {
            let data = await this.getModuleSettingsFromDB(guildsKeys, module.Data.SQL);
            this.prepareModuleData(guildsKeys, moduleName, data, module.Data.PrepareData);
        }
    }

    prepareModuleData(guildsKeys: string[], moduleName: string, data: object[], prepareData: Function) {
        let GuildsPreparedData = prepareData(guildsKeys, data);
        for (const [key, GuildPreparedData] of GuildsPreparedData) {
            let guild = this.guilds.get(key);
            let PreparedData = { [moduleName]: GuildPreparedData };
            if (guild == undefined) {
                guild = this.createEmptyGuildModules();
            }
            Object.assign(guild, PreparedData);
            this.guilds.set(key, guild);
        }
    }

    createEmptyGuildModules(): ConfigModules {
        return {
            AutoPurge: {
                enabled: false,
                channels: new Map()
            },
            MessageCounter: {
                enabled: false,
                bots: false,
                is_hidden: false,
                listing: {
                    channels: new Map(),
                    type: "all"
                }
            },
            Quotes: {
                enabled: false
            },
            LogsChannels: {
                enabled: false,
                activity: undefined,
                voice: undefined
            },
            Notifier: {
                guildLeft: {
                    channelId: undefined,
                    usersDM: new Array()
                },
                messageDelete: {
                    channelId: undefined,
                    usersDM: new Array()
                },
                voiceChange: {
                    channelId: undefined,
                    usersDM: new Array()
                },
            }
        }
    }

    async getModuleSettingsFromDB(guildsArray: string[], queryList: Function[]): Promise<object[]> {
        let array: Array<object> = new Array;
        for (const query of queryList) {
            array.push(await query(guildsArray));
        }

        return Promise.all(array).then(values => values);
    }

    getGuildConfig(guild_id: string): ConfigModules {
        return this.guilds.get(guild_id);
    }

    hasGuild(guild_id: string): boolean {
        return this.guilds.has(guild_id);
    }

    whenReady(task: Function) {
        if (this.state.isLoaded) {
            logger.info("Config: Task executed");
            task(this.guilds);
        } else {
            logger.info("Config: Task added to queue");
            this.readyQueue.push(task);
        }
    }
}