/* global WOT_APP_ID, ADMIN_ID, TOKENS */
const request = require("request");
const Wargamer = require('wargamer');
var method = wot.prototype;

function wot(message, trigger) {
    switch (trigger.splitTigger[1]) {
        case 'drwal':
            this.drwal(message, trigger);
            break;
        default:
            this.getProfile(message, trigger);
            break;
    }
}

method.drwal = function (message, trigger) {

    WorldOfTanks = new Wargamer.WorldOfTanks({realm: 'eu', applicationId: TOKENS.WotAppId});

    delete trigger.splitTigger[0];
    delete trigger.splitTigger[1];

    for (var lp in trigger.splitTigger) {
        this.dd(message, trigger, lp);
    }

};
method.dd = function (message, trigger, lp) {
    WorldOfTanks.get('account/list', {search: trigger.splitTigger[lp]}).then((response) => {
        for (var x in response.data) {
            if (response.data[x].nickname.toString().toLowerCase() === trigger.splitTigger[lp].toLowerCase()) {
                var profile = response.data[x];
                WorldOfTanks.get('account/info', {account_id: profile.account_id}).then((response) => {
                    treeratio = response.data[profile.account_id].statistics.trees_cut / response.data[profile.account_id].statistics.all.battles;
                    message.channel.send("**" + profile.nickname + "**: " + response.data[profile.account_id].statistics.trees_cut + ` (${treeratio.toString().slice(0, 4)})`);
                });
            }
        }
    }).catch((error) => {
        console.log(error.message);
    });
};

method.getProfile = function (message, trigger) {
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
                        var treeratio = data.statistics.trees_cut / data.statistics.all.battles;
                        const embed = new Discord.RichEmbed()
                                .setAuthor(profile.nickname, 'https://www.spreadshirt.pl/image-server/v1/designs/16507080,width=178,height=178/world-of-tanks-logo.png')
                                .setColor(0xEF017C)
                                .setFooter('Wersja Językowa Klienta: ' + data.client_language.toString().toUpperCase(), `http://flags.fmcdn.net/data/flags/h80/${data.client_language}.png`)
                                .setURL('http://worldoftanks.eu/pl/community/accounts/' + profile.account_id)

                                .addField('Basic',
                                        `Id: **${profile.account_id}** \n` +
                                        `Nick: **${profile.nickname}** \n` +
                                        `Exp: **${all.xp}**`)
                                .addField('Rating',
                                        `Global: **${data.global_rating}**\n`)
                                .addField('Battles',
                                        `All: **${all.battles}**\n` +
                                        `Win: **${all.wins}**\n` +
                                        `Losses: **${all.losses}**\n` +
                                        `Draws: **${all.draws}**\n` +
                                        `Survived: **${all.survived_battles}**\n` +
                                        `Win ratio: **${((all.wins / all.battles) * 100).toString().slice(0, 5)}%** \n` +
                                        `Surv ratio: **${((all.survived_battles / all.battles) * 100).toString().slice(0, 5)}%** `)
                                .addField('Damage',
                                        `Frags: **${all.frags}**\n` +
                                        `Max damage: **${all.max_damage}**`)
                                .addField('Misc',
                                        `Trees cut: **${data.statistics.trees_cut}** (${treeratio.toString().slice(0, 4)})\n`)
                                .addField('Last',
                                        `Last online: **${('0' + ll.getDate()).slice(-2)}/${('0' + (ll.getMonth() + 1)).slice(-2)}/${ll.getFullYear()} ` +
                                        `${ll.toLocaleTimeString()}**\n` +
                                        `Last battle: **${('0' + lb.getDate()).slice(-2)}/${('0' + (lb.getMonth() + 1)).slice(-2)}/${lb.getFullYear()} ` +
                                        `${lb.toLocaleTimeString()}**`);
                        if (data.clan_id !== null) {
                            embed.setThumbnail(`http://eu.wargaming.net/clans/media/clans/emblems/cl_${(data.clan_id).toString().slice(-3)}/${data.clan_id}/emblem_195x195.png`);
                        }
                        message.channel.sendEmbed(embed);
                    }
                });
            } else {
                string = 'Nie znaleziono użytkownika';
                if (nicks.length > 0) {
                    string += ' spróbuj: ' + nicks.toString();
                }
                message.channel.sendMessage(string);
            }
        }
    }
    );
};

module.exports = wot;