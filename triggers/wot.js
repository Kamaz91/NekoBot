/* global WOT_APP_ID, ADMIN_ID, TOKENS */

function wot(message, trigger) {
    var request = require("request");
    request({
        url: 'https://api.worldoftanks.eu/wot/account/list/?application_id=' + TOKENS.WotAppId + '&search=' + trigger.text,
        json: true
    }, function (error, response, body) {
        var nicks = [];
        if (!error && response.statusCode === 200) {
            for (var x in body.data) {
                if (body.data[x].nickname.toString().toLowerCase() === trigger.text.toString().toLowerCase()) {
                    var profile = body.data[x];
                    break;
                }
                nicks.push(body.data[x].nickname);
            }
            if (profile) {
                request({
                    url: 'https://api.worldoftanks.eu/wot/account/info/?application_id=' + TOKENS.WotAppId + '&account_id=' + profile.account_id,
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
            } else {
                string = 'Nie znaleziono użytkownika jakiego szukano';
                if (nicks.length > 0) {
                    string += ' spróbuj: ' + nicks.toString();
                }
                message.channel.sendMessage(string);
            }
        }
    });

}

module.exports = wot;