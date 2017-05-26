
const Discord = require('discord.js');
const Cfg = new require('./includes/Config.js');

const Peoples = require('./includes/Peoples.js');
const Trigger = require('./includes/Trigger.js');
const VoiceManager = require('./includes/VoiceManager.js');
const CLI = require('readline');

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
        console.log('*        NekoBot alpha v.0006       *');
        console.log('* Ostatnie zmiany z dnia 26.05.2017 *');
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
            this.client.user.setGame('NekoBot alpha v.0006');
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
            var logsChannel = this.client.channels.get(new Cfg().logsChannelId);
            var messageTime = time();
            if (newMember.voiceChannelID !== oldMember.voiceChannelID) {
                if (oldMember.voiceChannelID === null || oldMember.voiceChannelID === undefined) {
                    logsChannel.send('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' joined to **' + newMember.voiceChannel + '**');
                } else if (newMember.voiceChannelID && oldMember.voiceChannelID) {
                    logsChannel.send('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' switched from **' + oldMember.voiceChannel + '** to **' + newMember.voiceChannel + '**');
                } else {
                    logsChannel.send('[' + messageTime + '] **' + oldMember.displayName + '** (' + oldMember.user.username + ')' + ' left **' + oldMember.voiceChannel + '**');
                }

                //serverDeaf serverMute
            }
        });
    }
}

new Main();