const CronJob = require('cron').CronJob;
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const _ = require('lodash');

class Supervision {
    constructor(DiscordClient, TriggerManager, ModuleLoader) {
        this.DiscordClient = DiscordClient;
        this.ModuleLoader = ModuleLoader;
        this.TriggerManager = TriggerManager;
        this.Settings = null;
        this.EventJobs = {};

        this.startCron();
        this.loadSettings();
        this.loadEventJobs();
        this.initEvents();
        // TODO podzielić na mniejsze pliki 
    }
    initEvents() {
        for (var event of this.Settings.events) {
            if (event.enabled) {
                this.initListener(event.name);
            }
        }
    }
    initListener(eventName) {
        this.DiscordClient.on(eventName, (...args) => {
            for (var [jobName, job] of Object.entries(this.EventJobs[eventName])) {
                let x = new job(args);
            }
        });
    }
    loadEventJobs() {
        console.log('Loading event jobs');
        for (var event of this.Settings.events) {
            if (event.enabled) {
                // Path to events dir
                var eventsPath = path.resolve(__dirname, this.Settings.eventsPath + event.name);
                fs.readdirSync(eventsPath).forEach(eventJob => {
                    var job = path.resolve(eventsPath, eventJob);
                    if (fs.existsSync(job)) {
                        _.merge(this.EventJobs, {
                            [event.name]: {
                                [eventJob]: require(job)
                            }
                        });
                    } else {
                        console.log('WARNING job file does not exists:', job)
                    }
                });
            }
        }
        console.log('Jobs Loaded:');
        console.log(this.EventJobs);
    }
    loadSettings() {
        this.Settings = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'settings.json'), 'utf8'));
    }
    startCron() {
        const DC = this.DiscordClient;
        const UserPresenceJob = new CronJob('0 */10 * * * *', function () {
            const guilds = DC.guilds.array();
            const d = new Date();
            console.log('User presence status update:', d);
            for (var guild of guilds) {
                var members = guild.members.array();
                for (var member of members) {
                    if (!member.user.bot) {
                        knex('members_presence').insert({
                            user_id: member.id,
                            guild_id: member.guild.id,
                            status: member.presence.status,
                            microtime_timestamp: moment().valueOf()
                        })
                            .then()
                            .catch(console.error);
                    }
                }
            }
        });
        UserPresenceJob.start();
    }
    statusToInt(params) {
        switch (params) {
            case 'undefined':
                return 0;
                break;
            case 'offline':
                return 1;
                break;
            case 'online':
                return 2;
                break;
            case 'idle':
                return 3;
                break;
            case 'dnd':
                return 4;
                break;
        }
    };
    statusToString(params) {
        switch (params) {
            case 0:
                return 'undefined';
                break;
            case 1:
                return 'offline';
                break;
            case 2:
                return 'online';
                break;
            case 3:
                return 'idle';
                break;
            case 4:
                return 'dnd';
                break;
        }
    };
}

module.exports = Supervision;