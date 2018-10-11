
const Discord = require('discord.js');
const Cfg = new require('./includes/Config.js');

const TriggerManager = require('./includes/TriggerManager.js');
const ModulesLoader = require('./includes/ModulesLoader.js');
const CLI = require('readline');

knex = require('knex')({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: "data/database.sqlite"
    }
});

function time() {
    let date = new Date();
    let t = [
        `0${date.getHours()}`.slice(-2),   // Godziny
        `0${date.getMinutes()}`.slice(-2), // Minuty
        `0${date.getSeconds()}`.slice(-2)  // Sekundy
    ];
    return t.join(':');
}

class Main {

    constructor() {
        console.log('Starting...');
        console.log('************************************');
        console.log('*        NekoBot alpha v.0010      *');
        console.log('* Last changes from day 19.09.2018 *');
        console.log('************************************');

        this.client = new Discord.Client();
        this.client.login(new Cfg().getToken('DiscordBot'));
        this.TriggerManager = new TriggerManager(this.client);
        this.ModulesLoader = new ModulesLoader(this.client, this.TriggerManager);

        this.debugLock = true;

        /* Listeners */
        this.initCLI();
        this.initListeners(this.trig);
    }

    initCLI() {
        const rl = CLI.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.on('line', (line) => {
            var messageTime = time();
            if (line === 'debug on') {
                this.debugLock = false;
                console.log(messageTime + ' Debug mode on');
            }
            if (line === 'debug off') {
                this.debugLock = true;
                console.log(messageTime + ' Debug mode off');
            }
            if (line === 'reload triggers') {
                this.trig.reloadTriggers();
            }
            if (line === 'rt') {
                this.trig.reloadTriggers();
            }
        });
    }

    initListeners() {

        this.client.on('message', message => {
            /* Czas wiadomości hh:mm:ss */
            var messageTime = time();
            var guildchan = '';
            if (message.guild && message.channel) {
                guildchan = ' @ ' + message.guild.name + '->#' + message.channel.name;
            }

            console.log('[' + messageTime + '] <' + message.author.username + guildchan + '> ' + message.content);
        });
        this.client.on('ready', () => {
            /* Czas wiadomości hh:mm:ss */
            var messageTime = time();
            console.log(messageTime + ' Connected!');
        });
        this.client.on('disconnect', closeEvent => {
            //client.destroy();
            //client.login(TOKENS.DiscordBot);
            /* Czas wiadomości hh:mm:ss */
            var messageTime = time();
            //client.login(TOKENS.DiscordBot);
            console.log(messageTime + ' ************');
            console.log(messageTime + ' End of Session');
        });
        this.client.on('reconnecting', function () {
            /* Czas wiadomości hh:mm:ss */
            var messageTime = time();
            console.log(messageTime + ' reconnecting');
        });
        this.client.on('error', error => {
            /* Czas wiadomości hh:mm:ss */
            var messageTime = time();
            console.log(messageTime + ' error');
            console.log(error);
        });
        this.client.on('debug', info => {
            if (this.debugLock === false) {
                /* Czas wiadomości hh:mm:ss */
                var messageTime = time();
                console.log(messageTime + ' debug {' + info + '}');
            }
        });
    }
}

new Main();