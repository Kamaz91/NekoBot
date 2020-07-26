const CronJob = require('cron').CronJob;
const client = require('../Discord/connection.js');
const events = require('events');
const Discord = require('discord.js');
const db = require('../database/index.js');

var Emitter = new events.EventEmitter();

var config = {
    // Discord.js extended Map Collection
    guilds: new Discord.Collection()
};

const configJob = new CronJob('0 */10 * * * *', function () {
    console.log('Synchronization with database');
    Emitter.emit('config-updated');
});

client.once('ready', async () => {
    configJob.start();
    await loadConfig();
    Emitter.emit('config-ready');
});

async function loadConfig() {
    var TemplateGuilds = new Object;
    // GET ids of all connected guilds
    var guildsKeys = client.guilds.keyArray();
    for (const guild_id of guildsKeys) {
        TemplateGuilds[guild_id] = settingsTemplate(guild_id);
    }

    var modules = await db.guildManagment.settings.modules.getBulkByid(guildsKeys);
    if (modules.status)
        for (const el of modules.request) {
            TemplateGuilds[el.guild_id].modules[el.module_name].enabled = el.enabled ? true : false
        }

    var autoPurge = await db.guildManagment.settings.autoPurge.getBulkByid(guildsKeys);

    if (autoPurge.status)
        for (const el of autoPurge.request) {
            TemplateGuilds[el.guild_id].modules.autoPurge.channels.set(el.channel_id, { id: el.channel_id, time: el.older_than });
        }

    for (const [key, template] of Object.entries(TemplateGuilds)) {
        config.guilds.set(key.toString(), template);
    }
}

function updateConfig() {

}

function settingsTemplate(guild_id) {
    return {
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
            }
        }
    };
}

module.exports = { config: config, events: Emitter };