const Cfg = new require('../../includes/Config.js');

class voiceState {
    constructor(client) {
        client.on('voiceStateUpdate', (oldMember, newMember) => {

            if (newMember.voiceChannelID === null || newMember.voiceChannelID === undefined) {
                var guild = newMember.guild;
            } else {
                var guild = oldMember.guild;
            }

            var channelsArray = new Cfg().logsChannels;
            if (channelsArray.hasOwnProperty(guild.id)) {
                // Czy istnieje w bazie przypisany kanał do logowania statusu
                var logsChannelId = channelsArray[guild.id];

                let date = new Date();
                let t = [
                    `0${date.getHours()}`.slice(-2),   // Godziny
                    `0${date.getMinutes()}`.slice(-2), // Minuty
                    `0${date.getSeconds()}`.slice(-2)  // Sekundy
                ];
                var messageTime = t.join(':');

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
            }
        });
    }
}

module.exports = voiceState;