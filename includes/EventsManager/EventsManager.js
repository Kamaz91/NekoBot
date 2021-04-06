var elements = new Object;
var settings = loadSettings();

function loadEvents() {

}

function initEvents() {
    for (var event of settings.events) {
        if (event.enabled) {
            this.initListener(event.name);
        }
    }
}
function initListener(eventName) {
    DiscordClient.on(eventName, (...args) => {
        for (var [jobName, job] of Object.entries(this.EventJobs[eventName])) {
            try {
                let x = new job(args);
            } catch (error) {
                console.log("Job:", jobName);
                console.error(error);
            }
        }
    });
}
function loadEventJobs() {
    console.info('Loading event jobs');
    for (var event of settings.events) {

        if (event.enabled) {
            // Path to events dir
            var eventsPath = path.resolve(__dirname, settings.eventsPath + event.name);
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
function loadSettings() {
    return require('../../config/settings.json');
}