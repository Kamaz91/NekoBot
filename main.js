const Discord = require('discord.js');
const Cfg = new require('./includes/Config.js');

const TriggerManager = require('./includes/TriggerManager.js');
const ModulesLoader = require('./includes/ModulesLoader.js');

knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: new Cfg().getToken('dbhost'),
        user: new Cfg().getToken('dbuser'),
        password: new Cfg().getToken('dbpass'),
        database: new Cfg().getToken('dbdata')
    }
});

function time() {
    let date = new Date();
    let t = [
        `0${date.getHours()}`.slice(-2), // Godziny
        `0${date.getMinutes()}`.slice(-2), // Minuty
        `0${date.getSeconds()}`.slice(-2) // Sekundy
    ];
    return t.join(':');
}

class Main {

    constructor() {
        console.log('Starting...');
        console.log('************************************');
        console.log('*        NekoBot alpha v0010       *');
        console.log('************************************');

        this.client = new Discord.Client();
        this.client.login(new Cfg().getToken('DiscordBot'));
        this.TriggerManager = new TriggerManager(this.client);
        this.ModulesLoader = new ModulesLoader(this.client, this.TriggerManager);

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
            /* Czas wiadomości hh:mm:ss */
            var messageTime = time();
            console.log(messageTime + ' ************');
            console.log(messageTime + ' End of Session');
        });
        this.client.on('reconnecting', function() {
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
    }
}

new Main();