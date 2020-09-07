const request = require("request-promise");
const Cfg = new require('../../includes/Config.js');
const Discord = require('discord.js'); // for embed builder

class wot {
    constructor(DiscordClient, TriggerManager) {
        TriggerManager.RegisterTrigger({
            moduleName: "WoT",
            desc: "x",
            content: (message, trigger) => { this.searchProfile(message, trigger.arguments[0]) },
            key: "wot",
            subTrigger: [{
                    activator: "drwal",
                    desc: "x",
                    content: (message, trigger) => { this.drwal(message, trigger.arguments); }
                },
                {
                    activator: "d",
                    desc: "drwal alias",
                    content: (message, trigger) => { this.drwal(message, trigger.arguments); }
                },
                {
                    activator: "search",
                    desc: "x",
                    content: (message, trigger) => { this.searchProfile(message, trigger.arguments[0]); }
                },
                {
                    activator: "s",
                    desc: "search alias",
                    content: (message, trigger) => { this.searchProfile(message, trigger.arguments[0]); }
                },
                {
                    activator: "help",
                    desc: "help",
                    content: (message, trigger) => { this.help(message); }
                }
            ],
            prefix: "!" //optional. if not defined using default prefix
        });
    }

    getProfile(nickName) {
        var options = {
            method: 'POST',
            url: 'https://api.worldoftanks.eu/wot/account/list/',
            qs: {
                application_id: new Cfg().getToken('WotAppId'),
                search: nickName
            },
            json: true
        };
        return request(options).then((response) => {
            if (response.status === "ok") {
                for (var x in response.data) {
                    if (response.data[x].nickname.toString().toLowerCase() === nickName.toString().toLowerCase()) {
                        return { code: 200, status: "ok", data: response.data[x] };
                    }
                }
                //console.log(response.data);
                return { code: 201, status: "Profile not found", data: response };
            } else {
                return { code: 101, status: "api error", data: response };
            }
        }).catch((error) => {
            return { code: 100, status: "error", data: error };
        });
    }

    getAccountData(account_id) {
        var options = {
            method: 'POST',
            url: 'https://api.worldoftanks.eu/wot/account/info/',
            qs: {
                application_id: new Cfg().getToken('WotAppId'),
                account_id: account_id
            },
            json: true
        };
        return request(options).then((response) => {
            if (response.status === "ok") {
                return { code: 200, status: "ok", data: response.data[account_id] };
            } else {
                return { code: 101, status: "api error", data: response };
            }
        }).catch((error) => {
            return { code: 100, status: "error", data: error };
        });
    }

    drwal(message, profiles) {
        /* Usuwanie dwóch pierwszych zbędnych elementów tablicy (same nicki) */
        var embed = new Discord.RichEmbed();
        // Konfiguracja embed
        embed.setColor(0xEF017C);
        // * Lista zadan
        var promiseArray = [];
        // * Lista kont
        var accountArray = [];
        // * Lista bledow
        var errorArray = [];
        for (var x in profiles) {
            promiseArray[x] = this.getProfile(profiles[x]);
        }

        /*
         * Kolektor zadań
         */
        Promise.all(promiseArray).then((response) => {
            for (var i in response) {
                switch (response[i].code) {
                    case 100:
                        /* STATUS Error */
                        errorArray.push({ name: response.name, reason: "error" });
                        break;
                    case 101:
                        /* STATUS API error */
                        errorArray.push({ name: response.name, reason: "api error" });
                        break;
                    case 200:
                        /* STATUS OK */
                        accountArray.push(this.getAccountData(response[i].data.account_id));
                        break;
                    case 201:
                        /* STATUS Profile not Found */
                        errorArray.push({ name: response.name, reason: "Profile not found" });
                        break;
                }
            }

        }).then(() => {
            var errorEmbed;
            if (accountArray.length > 0) {
                Promise.all(accountArray).then((account) => {
                    for (var i in account) {
                        var treeratio = account[i].data.statistics.trees_cut / account[i].data.statistics.all.battles;
                        embed.addField(account[i].data.nickname, `Trees cut: **${account[i].data.statistics.trees_cut}** (${treeratio.toString().slice(0, 4)})\n`);
                    }
                    message.channel.send(embed);
                }).then(() => {
                    if (errorArray.length > 0) {
                        for (var i in errorArray) {
                            errorEmbed += errorArray[i].name;
                        }
                    }
                });
            }
        });
    }

    searchProfile(message, trigger) {
        this.getProfile(trigger).then((resolve) => {
            if (resolve.code === 200) {
                this.getAccountData(resolve.data.account_id).then((account) => {
                    var data = account.data;
                    var all = account.data.statistics.all;
                    var ll = new Date(data.logout_at * 1000);
                    var lb = new Date(data.last_battle_time * 1000);
                    var treeratio = data.statistics.trees_cut / data.statistics.all.battles;

                    switch (data.client_language.toString().toLowerCase()) {
                        case "en":
                            var flag = "gb";
                            break;
                        default:
                            var flag = data.client_language.toString().toLowerCase();
                            break;
                    }

                    const embed = new Discord.RichEmbed()
                        .setAuthor(data.nickname, 'https://www.spreadshirt.pl/image-server/v1/designs/16507080,width=178,height=178/world-of-tanks-logo.png')
                        .setColor(0xEF017C)
                        .setFooter('Wersja Językowa Klienta: ' + data.client_language.toString().toUpperCase(), `http://flags.fmcdn.net/data/flags/h80/${flag}.png`)
                        .setURL('http://worldoftanks.eu/pl/community/accounts/' + data.account_id)

                    .addField('Basic',
                            `Id: **${data.account_id}** \n` +
                            `Nick: **${data.nickname}** \n` +
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

                    message.channel.send(embed);
                });
            } else if (resolve.code === 101) {
                message.channel.send(resolve.data.error.value);
            } else if (resolve.code === 100) {
                message.channel.send("Trigger Error");
            } else {
                message.channel.send("Nie znaleziono podanego gracza");
                if (resolve.data.meta.count > 0) {
                    message.channel.send("Podobne: " + resolve.data.data.map(function(element) {
                        return element.nickname;
                    }).join(", "));
                }
            }
        });
    }

    help(message) {
        const embed = new Discord.RichEmbed();
        //embed.addField('!wot assign', "!wot assign **nick**");
        embed.addField('!wot nick', "!wot **nick**");
        embed.addField('!wot search, s', "!wot search **nick**");
        embed.addField('!wot drwal, d', "!wot drwal **nick nick.. itd**");
        message.channel.send(embed);
    }
}
module.exports = wot;