var method = avek.prototype;
function avek(message, trigger) {
    message.channel.send(message.author.avatarURL);
}

module.exports = avek;
