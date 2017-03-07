
console.log('Startowanie...');
console.log('*************************************');
console.log('*        NekoBot alpha v.0004       *');
console.log('* Ostatnie zmiany z dnia 07.03.2017 *');
console.log('*************************************');

/* Ładowanie modułów*/
Discord = require('discord.js');
Trigger = require('./includes/Trigger.js');
LoadTriggers = require('./includes/LoadTriggers.js');
FS = require('fs');
//ReloadModule = require('./includes/ReloadModule.js');

/* Załadowanie konfiguracji */
CONFIG = JSON.parse(FS.readFileSync('./config/config.json', 'utf8'));
/* Załadowanie tokenów */
TOKENS = JSON.parse(FS.readFileSync('./config/tokens.json', 'utf8'));


triggers = new LoadTriggers().loadTriggers();

client = new Discord.Client();
client.login(TOKENS.DiscordBot);

client.on('ready', () => {
    /* Obecny czas */
    var date = new Date();
    /* Czas wiadomości hh:mm:ss */
    var messageTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
    console.log(messageTime + ' Połączono!');
    client.user.setGame('NekoBot alpha v.0004');
});

client.on('disconnect', closeEvent => {
    /* Obecny czas */
    var date = new Date();
    /* Czas wiadomości hh:mm:ss */
    var messageTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
    console.log(messageTime + ' ************');
    console.log(messageTime + ' Koniec Sesji');
});

client.on('reconnecting', function () {
    /* Obecny czas */
    var date = new Date();
    /* Czas wiadomości hh:mm:ss */
    var messageTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
    console.log(messageTime + ' reconnecting');
});

// event listeners
client.on('voiceStateUpdate', (oldMember, newMember) => {

    var date = new Date(); // Obecny czas
    var messageTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);

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
    /* Obecny czas */
    var date = new Date();
    /* Czas wiadomości hh:mm:ss */
    var messageTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);

    console.log('[' + messageTime + '] <' + message.author.username + '> ' + message.content);

    /* Przeładowanie modułu Triggerów */
    /*if (message.content.startsWith('reload') && message.author.id === ADMIN_ID) {
     ReloadModule.purgeCache('./includes/Trigger.js');
     Trigger = require('./includes/Trigger.js');
     }*/

    // Triggery
    new Trigger(message, triggers);
});