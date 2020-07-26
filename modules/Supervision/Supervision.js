const CronJob = require('cron').CronJob;
const fs = require('fs');
const DiscordClient = require('../../includes/Discord/connection.js');
const moment = require('moment');
const path = require('path');
const _ = require('lodash');

const ap = require('./includes/autoPurge.js');

class Supervision {
    constructor(DiscordClient, TriggerManager, ModuleLoader) {
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
        DiscordClient.on(eventName, (...args) => {
            for (var [jobName, job] of Object.entries(this.EventJobs[eventName])) {
                let x = new job(args);
            }
        });
    }
    loadEventJobs() {
        console.info('Loading event jobs');
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
                        console.warn('WARNING job file does not exists:', job)
                    }
                });
            }
        }
        console.info("Jobs Loaded:\n", this.EventJobs);
    }
    loadSettings() {
        this.Settings = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'settings.json'), 'utf8'));
    }
    startCron() {
        const UserPresenceJob = new CronJob('0 */10 * * * *', function () {
            const guilds = DiscordClient.guilds.array();
            console.info('User presence status update!');
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
        console.info("User Presence job started");
        UserPresenceJob.start();
    }
    statusToInt(params) {
        switch (params) {
            case 'undefined':
                return 0;
            case 'offline':
                return 1;
            case 'online':
                return 2;
            case 'idle':
                return 3;
            case 'dnd':
                return 4;
        }
    };
    statusToString(params) {
        switch (params) {
            case 0:
                return 'undefined';
            case 1:
                return 'offline';
            case 2:
                return 'online';
            case 3:
                return 'idle';
            case 4:
                return 'dnd';
        }
    };
}

module.exports = Supervision;