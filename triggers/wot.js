/* global WOT_APP_ID, ADMIN_ID */

function wot(message, trigger) {
    var request = require("request");
    request({
        url: 'https://api.worldoftanks.eu/wot/account/list/?application_id=' + WOT_APP_ID + '&search=' + trigger.text,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            for (var x in body.data) {
                if (body.data[x].nickname === trigger.text) {
                    var profile = body.data[x];
                    break;
                }
            }
            if (profile) {
                request({
                    url: 'https://api.worldoftanks.eu/wot/account/info/?application_id=' + WOT_APP_ID + '&account_id=' + profile.account_id,
                    json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        all = body.data[profile.account_id].statistics.all;
                        string = '```' +
                                'Nick       : ' + profile.nickname + '\n' +
                                'Exp        : ' + all.xp + '\n' +
                                'Battles    : ' + all.battles + '\n' +
                                'Frags      : ' + all.frags + '\n' +
                                'Max damage : ' + all.max_damage + '\n' +
                                '```';
                        message.channel.sendMessage(string);
                    }
                });
            }
        }
    });

}

module.exports = wot;