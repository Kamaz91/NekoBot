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
                        var data = body.data[profile.account_id];
                        var all = body.data[profile.account_id].statistics.all;
                        const embed = new Discord.RichEmbed()
                                .setAuthor(profile.nickname, 'https://www.spreadshirt.pl/image-server/v1/designs/16507080,width=178,height=178/world-of-tanks-logo.png')
                                .setColor(0xEF017C)
                                .setFooter('Kraj Pochodzenia: ' + data.client_language.toString().toUpperCase(), `http://flags.fmcdn.net/data/flags/h80/${data.client_language}.png`)
                                .setImage(`http://wotlabs.net/sig_dark/eu/${profile.nickname}/signature.png`)
                                .setURL('http://worldoftanks.eu/pl/community/accounts/' + profile.account_id)

                                .addField('Basic',
                                        `Id          : ${profile.account_id} \n` +
                                        `Nick        : ${profile.nickname} \n` +
                                        `Exp         : ${all.xp}`)
                                .addField('Battles',
                                        `Battles     : ${all.battles}\n` +
                                        `Win         : ${all.wins}\n` +
                                        `Losses      : ${all.losses}\n` +
                                        `Draws       : ${all.draws}\n` +
                                        `Survived    : ${all.survived_battles}\n` +
                                        `Win ratio   : ${((all.wins / all.battles) * 100).toString().slice(0, 5)} % \n` +
                                        `Surv ratio  : ${((all.survived_battles / all.battles) * 100).toString().slice(0, 5)} % `)
                                .addField('Damage',
                                        `Frags       : ${all.frags}\n` +
                                        `Max damage  : ${all.max_damage}`)
                                .addField('Last',
                                        `Last online : ${('0' + ll.getDate()).slice(-2)} / ${('0' + (ll.getMonth() + 1)).slice(-2)} / ${ll.getFullYear()} ` +
                                        `${ll.toLocaleTimeString()}\n` +
                                        `Last battle : ${('0' + lb.getDate()).slice(-2)} / ${('0' + (lb.getMonth() + 1)).slice(-2)} / ${lb.getFullYear()} ` +
                                        `${lb.toLocaleTimeString()}`);
                        if (data.clan_id !== null) {
                            embed.setThumbnail(`http://eu.wargaming.net/clans/media/clans/emblems/cl_${(data.clan_id).toString().slice(-3)}/${data.clan_id}/emblem_195x195.png`);
                        }
                        message.channel.sendEmbed(embed);
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