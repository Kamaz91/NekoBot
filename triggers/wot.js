const request = require("request-promise");
const Cfg = new require('../includes/Config.js');
const Discord = require('discord.js');

class wot {
    constructor(message, trigger) {
        switch (trigger.splitTigger[1]) {
            case 'drwal':
                this.drwal(message, trigger);
                break;
            case 'assign':
                this.assignProcess(message, trigger.splitTigger[2]);
                break;
            case 'help':
                this.help(message, trigger);
                break;
            case 'search':
                this.searchProfile(message, trigger.splitTigger[2]);
                break;
            default:
                this.searchProfile(message, trigger.text);
                break;
        }
    }

    assignProcess(message, nickname) {
        let process = this.assignProfileToUser(message, nickname);
        process.then((resolve) => {
            message.reply(resolve.status);
        });
    }

    assignProfileToUser(message, nickname) {
        return this.getProfile(nickname).then((resolve) => {
            if (resolve.code === 200) {
                return knex.select().table('wot_assign').where('discordId', message.author.id).then((query) => {
                    if (query.length > 0) {
                        return knex('wot_assign').where('discordId', '=', message.author.id).update({
                            wotId: resolve.data.account_id,
                            wotName: resolve.data.nickname,
                            timestamp: Date.now()
                        }).then(() => {
                            return {code: 200, status: `Updated assign from ${query[0].wotName} to ${resolve.data.nickname}`};
                        }).catch((error) => {
                            console.log(error);
                            return {code: 102, status: "Database error", data: error};
                        });
                    } else {
                        return knex('wot_assign').insert({
                            discordId: message.author.id,
                            discordName: message.author.username,
                            wotId: resolve.data.account_id,
                            wotName: resolve.data.nickname,
                            timestamp: Date.now()
                        }).then(() => {
                            return {code: 200, status: `Assigned ${resolve.data.nickname} to your id`};
                        }).catch((error) => {
                            return {code: 102, status: "Database error", data: error};
                        });
                    }
                });
            } else {
                return resolve;
            }
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
                        return {code: 200, status: "ok", data: response.data[x]};
                    }
                }
                //console.log(response.data);
                return {code: 201, status: "Not found profile", data: response};
            } else {
                return {code: 101, status: "api error", data: response};
            }
        }).catch((error) => {
            return {code: 100, status: "error", data: error};
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
                return {code: 200, status: "ok", data: response.data[account_id]};
            } else {
                return {code: 101, status: "api error", data: response};
            }
        }).catch((error) => {
            return {code: 100, status: "error", data: error};
        });
    }

    drwal(message, trigger) {
        /* Usuwanie dwóch pierwszych zbędnych elementów tablicy (same nicki) */
        trigger.splitTigger.shift();
        trigger.splitTigger.shift();
        var embed = new Discord.RichEmbed();
        // Konfiguracja embed
        embed.setColor(0xEF017C);
        // * Lista zadan
        var promiseArray = [];
        // * Lista kont
        var accountArray = [];
        // * Lista bledow
        var errorArray = [];
        for (var x in trigger.splitTigger) {
            promiseArray[x] = this.getProfile(trigger.splitTigger[x]);
        }

        /*
         * Kolektor zadań
         */
        Promise.all(promiseArray).then((response) => {
            for (var i in response) {
                switch (response[i].code) {
                    case 100:
                        /* STATUS Error */
                        errorArray.push({name: response.name, reason: "error"});
                        break;
                    case 101:
                        /* STATUS API error */
                        errorArray.push({name: response.name, reason: "api error"});
                        break;
                    case 200:
                        /* STATUS OK */
                        accountArray.push(this.getAccountData(response[i].data.account_id));
                        break;
                    case 201:
                        /* STATUS Not Found */
                        errorArray.push({name: response.name, reason: "not found"});
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
                    const embed = new Discord.RichEmbed()
                            .setAuthor(data.nickname, 'https://www.spreadshirt.pl/image-server/v1/designs/16507080,width=178,height=178/world-of-tanks-logo.png')
                            .setColor(0xEF017C)
                            .setFooter('Wersja Językowa Klienta: ' + data.client_language.toString().toUpperCase(), `http://flags.fmcdn.net/data/flags/h80/${data.client_language}.png`)
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
            } else {
                message.channel.send("Nie znaleziono podanego gracza");
                if (resolve.data.meta.count > 0) {
                    message.channel.send("Podobne: " + resolve.data.data.map(function (element) {
                        return element.nickname;
                    }).join(", "));
                }
            }
        });
    }

    help(message) {
        const embed = new Discord.RichEmbed();
        embed.addField('!wot', "!wot **nick**");
        embed.addField('!wot search', "!wot search **nick**");
        embed.addField('!wot drwal', "!wot drwal **nick nick.. itd**");
        message.channel.send(embed);
    }
}
module.exports = wot;