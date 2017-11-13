var method = avek.prototype;
function avek(message, trigger) {
    if (trigger.splitTigger[1] === null || trigger.splitTigger[1] === undefined) {
        message.channel.send(message.author.avatarURL);
    } else {
        message.channel.send(
                message.guild.members.find(
                        'id',
                        trigger.splitTigger[1].replace(/<|!|>|@/gi, '')
                        )
                .user.avatarURL
                );
    }
}

module.exports = avek;
