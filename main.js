time = function () {
    var date = new Date();
    return ('0' + date.getHours()).slice(-2) + ':' +
            ('0' + date.getMinutes()).slice(-2) + ':' +
            ('0' + date.getSeconds()).slice(-2) + '.' +
            ('00' + date.getMilliseconds()).slice(-3);
};

console.log('Startowanie...');
console.log('*************************************');
console.log('*        NekoBot alpha v.0006       *');
console.log('* Ostatnie zmiany z dnia 28.03.2017 *');
console.log('*************************************');

var debugLock = true;

/* Ładowanie modułów*/
Discord = require('discord.js');
FS = require('fs');
const Peoples = require('./includes/Peoples.js');
const Trigger = require('./includes/Trigger.js');
const VoiceManager = require('./includes/VoiceManager.js');
const Readline = require('readline');

/* Załadowanie konfiguracji */
CONFIG = JSON.parse(FS.readFileSync('./config/config.json', 'utf8'));
/* Załadowanie tokenów */
TOKENS = JSON.parse(FS.readFileSync('./config/tokens.json', 'utf8'));

pop = new Peoples();

const trig = new Trigger();
trig.loadTriggers();

PlayIt = new VoiceManager();

//let opts = {shardId: 1, shardCount: 2};
client = new Discord.Client();
client.login(TOKENS.DiscordBot);

const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    var messageTime = time();

    if (line === 'debug on') {
        debugLock = false;
        console.log(messageTime + ' Debug mode on');
    }
    if (line === 'debug off') {
        debugLock = true;
        console.log(messageTime + ' Debug mode off');
    }
    if (line === 'reload triggers') {
        trig.reloadTriggers();
    }

});

client.on('ready', () => {
    pop.scanGuildUsers(client.guilds.array());
    /* Czas wiadomości hh:mm:ss */
    var messageTime = time();
    console.log(messageTime + ' Połączono!');
    client.user.setGame('NekoBot alpha v.0005');
});

client.on('disconnect', closeEvent => {
    //client.destroy();
    //client.login(TOKENS.DiscordBot);
    /* Czas wiadomości hh:mm:ss */
    var messageTime = time();
    //client.login(TOKENS.DiscordBot);
    console.log(messageTime + ' ************');
    console.log(messageTime + ' Koniec Sesji');
});

client.on('reconnecting', function () {
    /* Czas wiadomości hh:mm:ss */
    var messageTime = time();
    console.log(messageTime + ' reconnecting');
});

client.on('error', error => {
    /* Czas wiadomości hh:mm:ss */
    var messageTime = time();
    console.log(messageTime + ' error');
    console.log(error);
});

client.on('debug', info => {
    if (debugLock === false) {
        /* Czas wiadomości hh:mm:ss */
        var messageTime = time();
        console.log(messageTime + ' debug {' + info + '}');
    }
});

// event listeners
client.on('voiceStateUpdate', (oldMember, newMember) => {

    var messageTime = time();

    if (newMember.voiceChannelID !== oldMember.voiceChannelID) {
        if (oldMember.voiceChannelID === null || oldMember.voiceChannelID === undefined) {
            client.channels.get(CONFIG.LogChannelId)
                    .sendMessage('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' joined to **' + newMember.voiceChannel + '**');
        } else if (newMember.voiceChannelID && oldMember.voiceChannelID) {
            client.channels.get(CONFIG.LogChannelId)
                    .sendMessage('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' switched from **' + oldMember.voiceChannel + '** to **' + newMember.voiceChannel + '**');
        } else {
            client.channels.get(CONFIG.LogChannelId)
                    .sendMessage('[' + messageTime + '] **' + oldMember.displayName + '** (' + oldMember.user.username + ')' + ' left **' + oldMember.voiceChannel + '**');
        }

        //serverDeaf serverMute
    }
});

client.on('message', message => {
    /* Czas wiadomości hh:mm:ss */
    var messageTime = time();
    var guildchan = '';

    if (message.guild && message.channel) {
        guildchan = ' @ ' + message.guild.name + '->#' + message.channel.name;
    }

    console.log('[' + messageTime + '] <' + message.author.username + guildchan + '> ' +
            message.content);

    // Triggery
    trig.checkTrigger(message);
});
