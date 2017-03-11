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

                        var ll = new Date(body.data[profile.account_id].logout_at * 1000);
                        var lb = new Date(body.data[profile.account_id].last_battle_time * 1000);
                        console.log(body.data[profile.account_id].last_battle_time);
                        all = body.data[profile.account_id].statistics.all;
                        string = '```' +
                                `Id          : ${profile.account_id} \n` +
                                `Nick        : ${profile.nickname} \n` +
                                `Exp         : ${all.xp}\n` +
                                `--------------------------------\n` +
                                `Battles     : ${all.battles}\n` +
                                `Win         : ${all.wins}\n` +
                                `Losses      : ${all.losses}\n` +
                                `Draws       : ${all.draws}\n` +
                                `Win ratio   : ${((all.wins / all.battles) * 100).toString().slice(0, 5)}% \n` +
                                `Survived    : ${all.survived_battles}\n` +
                                `--------------------------------\n` +
                                `Frags       : ${all.frags}\n` +
                                `Max damage  : ${all.max_damage}\n` +
                                `Last online : ${('0' + ll.getDate()).slice(-2)} / ${('0' + (ll.getMonth() + 1)).slice(-2)} / ${ll.getFullYear()} ` +
                                `${ll.toLocaleTimeString()}\n` +
                                `Last battle : ${('0' + lb.getDate()).slice(-2)} / ${('0' + (lb.getMonth() + 1)).slice(-2)} / ${lb.getFullYear()} ` +
                                `${lb.toLocaleTimeString()}\n` +
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
    }
    );

}

module.exports = wot;