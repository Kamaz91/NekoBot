const CLI = require('readline');

class cmd {
    constructor(DiscordClient, TriggerManager, ModuleLoader) {
        this.client = DiscordClient;
        this.TriggerManager = TriggerManager;
        this.ModuleLoader = ModuleLoader;

        this.debugLock = false;

        const rl = CLI.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        console.log("Command Line initialized");

        rl.on('line', (line) => {
            let date = new Date();
            let t = [
                `0${date.getHours()}`.slice(-2),   // Godziny
                `0${date.getMinutes()}`.slice(-2), // Minuty
                `0${date.getSeconds()}`.slice(-2)  // Sekundy
            ];
            var messageTime = t.join(':');

            if (line === 'debug on') {
                this.debug = true;
                console.log(messageTime + ' Debug mode on');
            }
            if (line === 'debug off') {
                this.debug = false;
                console.log(messageTime + ' Debug mode off');
            }
            if (line === 'reload triggers') {
                this.ModuleLoader.reloadModules();
            }
            if (line === 'rt') {
                this.ModuleLoader.reloadModules();
            }
        });
        this.client.on('debug', info => {
            if (this.debug === true) {
                /* Czas wiadomości hh:mm:ss */
                let date = new Date();
                let t = [
                    `0${date.getHours()}`.slice(-2),   // Godziny
                    `0${date.getMinutes()}`.slice(-2), // Minuty
                    `0${date.getSeconds()}`.slice(-2)  // Sekundy
                ];
                var messageTime = t.join(':');
                console.log(messageTime + ' debug {' + info + '}');
            }
        });
    }
}
module.exports = cmd;