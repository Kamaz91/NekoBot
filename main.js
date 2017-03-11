function time() {
    date = new Date();
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2) + '.' + ('00' + date.getMilliseconds()).slice(-3);
}

console.log('Startowanie...');
console.log('*************************************');
console.log('*        NekoBot alpha v.0005       *');
console.log('* Ostatnie zmiany z dnia 07.03.2017 *');
console.log('*************************************');

/* Ładowanie modułów*/
Discord = require('discord.js');
FS = require('fs');
Trigger = require('./includes/Trigger.js');
Readline = require('readline');

//ReloadModule = require('./includes/ReloadModule.js');

/* Załadowanie konfiguracji */
CONFIG = JSON.parse(FS.readFileSync('./config/config.json', 'utf8'));
/* Załadowanie tokenów */
TOKENS = JSON.parse(FS.readFileSync('./config/tokens.json', 'utf8'));

trig = new Trigger();
trig.loadTriggers();

client = new Discord.Client();
client.login(TOKENS.DiscordBot);

rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    var messageTime = time();

    if (line === 'x1') {
        console.log(`${messageTime} x1: ${line}`);
    }

});

client.on('ready', () => {
    /* Czas wiadomości hh:mm:ss */
    var messageTime = time();
    console.log(messageTime + ' Połączono!');
    client.user.setGame('NekoBot alpha v.0005');
});

client.on('disconnect', closeEvent => {
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
    var messageTime = time(date);
    var guildchan = '';

    if (message.guild && message.channel) {
        guildchan = ' @ ' + message.guild.name + '->#' + message.channel.name;
    }

    console.log('[' + messageTime + '] <' + message.author.username + guildchan + '> ' +
            message.content);

    /* Przeładowanie modułu Triggerów */
    /*if (message.content.startsWith('reload') && message.author.id === ADMIN_ID) {
     ReloadModule.purgeCache('./includes/Trigger.js');
     Trigger = require('./includes/Trigger.js');
     }*/

    // Triggery
    trig.checkTrigger(message);
});
