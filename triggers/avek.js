var method = avek.prototype;
function avek(message, trigger) {
    message.channel.sendMessage(message.author.avatarURL);
}

module.exports = avek;
