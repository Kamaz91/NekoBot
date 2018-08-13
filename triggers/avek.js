var method = avek.prototype;
function avek(message, trigger) {
    if (trigger.splitTigger[1] === null || trigger.splitTigger[1] === undefined) {
        message.reply(message.author.avatarURL);
    } else {
        if (message.channel.type !== "dm") {
            let member = message.guild.members.find('id', trigger.splitTigger[1].replace(/<|!|>|@/gi, ''));
            if (member) {
                message.channel.send(member.avatarURL);
            } else {
                message.reply("User not found");
            }
        } else {
            message.reply("You can not search users by DM");
        }
    }
}

module.exports = avek;