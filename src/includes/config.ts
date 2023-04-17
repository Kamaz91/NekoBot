import logger from "@includes/logger";
import { CronJob } from "cron";
import client from "@core/Connection";
import events from "events";
import EnabledModules from "@src/EnabledModules"
import { ConfigModules } from "@/@types/config";

export const Emitter = new events.EventEmitter();

interface State {
    state: string;
    isLoaded: boolean;
}

class Config {
    public state: State
    public configJob;
    public guilds: Map<string, ConfigModules>;

    private readyQueue: Function[];

    constructor() {
        this.readyQueue = new Array;
        this.setState("innitial", false);
        this.guilds = new Map();

        Emitter.on("config-updated", () => { while (this.readyQueue.length) this.readyQueue.shift()() });
        Emitter.on("config-ready", this.loadModules);

        this.configJob = new CronJob('0 */5 * * * *', async () => {
            this.setState("updating", false);
            logger.info('Synchronization with database');
            let guildsKeys = Array.from((await client.guilds.fetch()).keys());
            await this.loadGuildConfig(guildsKeys);
            Emitter.emit('config-updated');
            this.setState("loaded", true);
        });

        client.once('ready', async () => {
            this.setState("loading", false);
            logger.info("Loading Settings");

            // GET ids of all connected guilds
            let guildsKeys = Array.from((await client.guilds.fetch()).keys());
            await this.setTemplates(guildsKeys);
            await this.loadGuildConfig(guildsKeys);

            this.configJob.start();
            Emitter.emit('config-updated');
            Emitter.emit('config-ready');
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
        for (const [moduleName, module] of Object.entries(EnabledModules)) {
            if ("cfg" in module) {
                let data = await this.getModuleSettingsFromDB(guildsKeys, module.cfg.sql);
                this.prepareModuleData(guildsKeys, moduleName, data, module.cfg.prepareData);
            }
        }
    }

    prepareModuleData(guildsKeys: string[], moduleName: string, data: object[], prepareData: Function) {
        let GuildsPreparedData = prepareData(guildsKeys, data);
        for (const [key, GuildPreparedData] of GuildsPreparedData) {
            let guild = this.guilds.get(key);
            Object.assign(guild, { [moduleName]: GuildPreparedData });
            this.guilds.set(key, guild);
        }
    }

    async setTemplates(guildsKeys: string[]) {
        for (const GuildId of guildsKeys) {
            let template: any = new Object();
            for (const [moduleName, module] of Object.entries(EnabledModules)) {
                if ("cfg" in module)
                    Object.assign(template, { [moduleName]: module.cfg.template });
            }
            this.guilds.set(GuildId, template);
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
            task(this.guilds);
        } else {
            this.readyQueue.push(task);
        }
    }

    loadModules() {
        logger.info("Loading Modules");
        for (const [, module] of Object.entries(EnabledModules)) {
            module.execute();
        }
    }

    /* settingsTemplate(guildsKeys: string[]) {
         var template: Map<string, ConfigModules> = new Map;
         for (const guild_id of guildsKeys) {
             template.set(guild_id, {
                 id: guild_id,
                 modules: {
                     AutoPurge: {
                         enabled: false,
                         channels: new Map
                     },
                     MessageCounter: {
                         enabled: false,
                         bots: 0,
                         is_hidden: 0,
                         listing: {
                             type: "all", // whitelist, blacklist, all
                             channels: new Discord.Collection()
                         }
                     },
                     Quotes: {
                         enabled: false
                     },
                     LogsChannels: {
                         enabled: false,
                         activity: null,
                         voice: null
                     },
                     Notifier: {
                         enabled: false,
                         memberleft: {
                             users: new Discord.Collection()
                         }
                     }
                 }
             });
         }
         return template;
     }*/

    /*


    async loadNotifier(guildsKeys) {
        var notifier = await db.guildManagment.settings.notifier.getBulk(guildsKeys);

        if (notifier.status)
            for (const el of notifier.request) {
                this.TemplateGuilds[el.guild_id].modules.notifier[el.type].users.set(el.user_id, { id: el.user_id });
            }
    }

    async loadLogsChannels(guildsKeys) {
        var logsChannels = await db.guildManagment.settings.logsChannels.getBulk(guildsKeys);

        if (logsChannels.status)
            for (const el of logsChannels.request) {
                this.TemplateGuilds[el.guild_id].modules.logsChannels[el.type] = el.channel_id;
            }
    }*/
}
var config = new Config()

export default config;