
console.log('Startowanie...');
console.log('*************************************');
console.log('*        NekoBot alpha v.0003       *');
console.log('* Ostatnie zmiany z dnia 07.03.2017 *');
console.log('*************************************');

Discord = require('discord.js');
Trigger = require('./includes/Trigger.js');
LoadTriggers = require('./includes/LoadTriggers.js');
//ReloadModule = require('./includes/ReloadModule.js');

const TOKEN = 'Token';

LOG_CHANNEL_ID = '286927326565105665';
ADMIN_ID = '166956114154356736';
ADMIN_ROLE_ID = ''; // DO ZROBIENIA !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
WOT_APP_ID = 'ID';

triggers = new LoadTriggers().loadTriggers();

client = new Discord.Client();
client.login(TOKEN);

client.on('ready', () => {
    /* Obecny czas */
    var date = new Date();
    /* Czas wiadomości hh:mm:ss */
    var messageTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
    console.log(messageTime + ' Połączono!');
    client.user.setGame('NekoBot alpha v.0002');
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
            client.channels.get(LOG_CHANNEL_ID)
                    .sendMessage('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' joined to **' + newMember.voiceChannel + '**');
        } else if (newMember.voiceChannelID && oldMember.voiceChannelID) {
            client.channels.get(LOG_CHANNEL_ID)
                    .sendMessage('[' + messageTime + '] **' + newMember.displayName + '** (' + newMember.user.username + ')' + ' switched from **' + oldMember.voiceChannel + '** to **' + newMember.voiceChannel + '**');
        } else {
            client.channels.get(LOG_CHANNEL_ID)
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