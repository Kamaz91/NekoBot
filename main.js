
const Discord = require('discord.js');
const Cfg = new require('./includes/Config.js');

const userWatch = require('./includes/userWatch.js');
const Trigger = require('./includes/Trigger.js');
//const VoiceManager = require('./includes/VoiceManager.js');
const CLI = require('readline');

knex = require('knex')({
    client: 'sqlite3',
    useNullAsDefault: true,
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
        console.log('Starting...');
        console.log('************************************');
        console.log('*        NekoBot alpha v.0009      *');
        console.log('* Last changes from day 07.05.2018 *');
        console.log('************************************');

        this.client = new Discord.Client();
        this.client.login(new Cfg().getToken('DiscordBot'));

        this.debugLock = true;
        /* Ładowanie modułów*/
        //this.PlayIt = new VoiceManager();
        this.userWatch = new userWatch(this.client);
        this.trig = new Trigger(this.client);
        this.trig.loadTriggers();
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

            console.log('[' + messageTime + '] <' + message.author.username + guildchan + '> ' +
                    message.content);
            // Triggery
            this.trig.checkTrigger(message);
        });
        this.client.on('ready', () => {
            /* Czas wiadomości hh:mm:ss */
            var messageTime = time();
            console.log(messageTime + ' Connected!');
            this.client.user.setActivity('NekoBot alpha v.0009');
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