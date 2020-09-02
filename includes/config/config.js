const CronJob = require('cron').CronJob;
const client = require('../Discord/connection.js');
const events = require('events');
const Discord = require('discord.js');
const db = require('../database/index.js');

var Emitter = new events.EventEmitter();

class Config {
    constructor() {
        this.guilds = null;
        this.TemplateGuilds = null;
        this.configJob = new CronJob('0 */5 * * * *', async () => {
            console.info('Synchronization with database');
            await this.loadGuildConfig();
            Emitter.emit('config-updated');
        });

        client.once('ready', async () => {
            this.configJob.start();
            await this.loadGuildConfig();
            Emitter.emit('config-ready');
        });
    }

    async loadGuildConfig() {
        // GET ids of all connected guilds
        var guildsKeys = client.guilds.cache.keyArray();
        this.TemplateGuilds = await this.loadModulesSettings(guildsKeys);
        await this.loadAutoPurge(guildsKeys);
        await this.loadNotifier(guildsKeys);

        this.saveGuildsSettings();
    }

    saveGuildsSettings() {
        var guildsCollection = new Discord.Collection();
        for (const [key, template] of Object.entries(this.TemplateGuilds)) {
            guildsCollection.set(key.toString(), template);
        }
        this.TemplateGuilds = null;
        this.guilds = guildsCollection;
    }

    settingsTemplate(guildsKeys) {
        var template = new Object;
        for (const guild_id of guildsKeys) {
            template[guild_id] = {
                id: guild_id,
                prefix: "!",
                modules: {
                    autoPurge: {
                        enabled: false,
                        channels: new Discord.Collection()
                    },
                    messageCounter: {
                        enabled: false,
                        data: null
                    },
                    quotes: {
                        enabled: false
                    },
                    logsChannels: {
                        enabled: false,
                        action: null,
                        voice: null
                    },
                    notifier: {
                        enabled: false,
                        memberleft: {
                            users: new Discord.Collection()
                        }
                    }
                }
            };
        }
        return template;
    }

    async loadModulesSettings(guildsKeys) {
        var template = this.settingsTemplate(guildsKeys);
        var modules = await db.guildManagment.settings.modules.getBulk(guildsKeys);
        if (modules.status)
            for (const el of modules.request) {
                template[el.guild_id].modules[el.module_name].enabled = el.enabled ? true : false
            }
        return template;
    }

    async loadAutoPurge(guildsKeys) {
        var autoPurge = await db.guildManagment.settings.autoPurge.getBulk(guildsKeys);

        if (autoPurge.status)
            for (const el of autoPurge.request) {
                this.TemplateGuilds[el.guild_id].modules.autoPurge.channels.set(el.channel_id, { id: el.channel_id, time: el.older_than });
            }
    }

    async loadNotifier(guildsKeys) {
        var notifier = await db.guildManagment.settings.notifier.getBulk(guildsKeys);

        if (notifier.status)
            for (const el of notifier.request) {
                this.TemplateGuilds[el.guild_id].modules.notifier[el.type].users.set(el.user_id, { id: el.user_id });
            }
    }
}

var config = new Config();

module.exports = { config: config, events: Emitter };