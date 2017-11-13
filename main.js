
const Discord = require('discord.js');
const Cfg = new require('./includes/Config.js');

const Peoples = require('./includes/Peoples.js');
const Trigger = require('./includes/Trigger.js');
const VoiceManager = require('./includes/VoiceManager.js');
const CLI = require('readline');

knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: "data/database.sqlite"
    }
});

function time() {
    var date = new Date();
    return ('0' + date.getHours()).slice(-2) + ':' +
            ('0' + date.getMinutes()).slice(-2) + ':' +
            ('0' + date.getSeconds()).slice(-2) + '.' +
            ('00' + date.getMilliseconds()).slice(-3);
}

class Main {

    constructor() {
        console.log('Startowanie...');
        console.log('*************************************');
        console.log('*        NekoBot alpha v.0007       *');
        console.log('* Ostatnie zmiany z dnia 13.11.2017 *');
        console.log('*************************************');

        this.pop = new Peoples();
        this.PlayIt = new VoiceManager();

        this.debugLock = true;

        this.client = new Discord.Client();
        this.client.login(new Cfg().getToken('DiscordBot'));

        /* Ładowanie modułów*/
        this.trig = new Trigger(this.client);
        this.trig.loadTriggers();

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

            console.log('[' + messageTime + '] <' + message.author.username + guildchan + '> ' +
                    message.content);
            // Triggery
            this.trig.checkTrigger(message);
        });
        this.client.on('ready', () => {
            this.pop.scanGuildUsers(this.client.guilds.array());
            /* Czas wiadomości hh:mm:ss */
            var messageTime = time();
            console.log(messageTime + ' Połączono!');
            this.client.user.setGame('NekoBot alpha v.0007');
        });
        this.client.on('disconnect', closeEvent => {
            //client.destroy();
            //client.login(TOKENS.DiscordBot);
            /* Czas wiadomości hh:mm:ss */
            var messageTime = time();
            //client.login(TOKENS.DiscordBot);
            console.log(messageTime + ' ************');
            console.log(messageTime + ' Koniec Sesji');
        });
        this.client.on('reconnecting', function () {
            /* Czas wiadomości hh:mm:ss */
            var messageTime = time();
            console.log(messageTime + ' Próba Połączenia');
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
        // voice listener
        this.client.on('voiceStateUpdate', (oldMember, newMember) => {

            if (newMember.voiceChannelID === null || newMember.voiceChannelID === undefined) {
                var guild = newMember.guild;
            } else {
                var guild = oldMember.guild;
            }

            var channelsArray = new Cfg().logsChannels;
            var logsChannelId = channelsArray[guild.id];
            var messageTime = time();

            //var guild = this.client.guilds.get(new Cfg().logsChannels);

            if (newMember.voiceChannelID !== oldMember.voiceChannelID && logsChannelId !== null) {
                var logsChannel = guild.channels.get(logsChannelId);

                if (oldMember.voiceChannelID === null || oldMember.voiceChannelID === undefined) {
                    logsChannel.send('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' joined to **' + newMember.voiceChannel + '**');
                } else if (newMember.voiceChannelID && oldMember.voiceChannelID) {
                    logsChannel.send('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' switched from **' + oldMember.voiceChannel + '** to **' + newMember.voiceChannel + '**');
                } else {
                    logsChannel.send('[' + messageTime + '] **' + oldMember.displayName + '** (' + oldMember.user.username + ')' + ' left **' + oldMember.voiceChannel + '**');
                }

                //serverDeaf serverMute
            }
            if (newMember.guild.id !== oldMember.guild.id) {
                if (channelsArray[oldMember.guild.id] !== null) {
                    var ologsChannel = oldMember.guild.channels.get(channelsArray[oldMember.guild.id]);
                    ologsChannel.send('[' + messageTime + '] **' + oldMember.displayName + '** (' + oldMember.user.username + ')' + ' left **' + oldMember.voiceChannel + '**');
                }

                if (channelsArray[newMember.guild.id] !== null) {
                    var nlogsChannel = newMember.guild.channels.get(channelsArray[newMember.guild.id]);
                    nlogsChannel.send('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' joined to **' + newMember.voiceChannel + '**');
                }
            }
        });
    }
}

new Main();