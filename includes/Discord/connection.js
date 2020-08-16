const Discord = require('discord.js');
const db = require('../database/index.js');

var client = new Discord.Client();

init();

client.on('message', message => {
    var guildchan = '';
    if (message.guild && message.channel) {
        guildchan = ` @ ${message.guild.name} -> #${message.channel.name}`;
    }

    console.log(`${message.author.username + guildchan}: ${message.content}`);
});
client.on('ready', () => {
    console.log('Connected!');
});
client.on('disconnect', closeEvent => {
    console.log('************');
    console.log('End of Session');
});
client.on('reconnecting', function () {
    console.log('reconnecting');
});
client.on('error', error => {
    console.error('Discord js error');
    console.error(error.message);
    console.error(error);
});

async function init() {
    var token = await db.bot.token.get.discord();
    if (!token.status) {
        console.error("Cant login to discord");
        console.error(token.request);
        return;
    }
    client.login(token.request);
}

module.exports = client;