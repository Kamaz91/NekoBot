const Cfg = require('../../includes/Config.js');
const Discord = require('discord.js'); // for embed builder
const moment = require('moment');
const CronJob = require('cron').CronJob;
const _ = require('lodash');

var config = new Cfg();

class Supervision {
    constructor(DiscordClient) {
        const job = new CronJob('0 */10 * * * *', function () {
            const guilds = DiscordClient.guilds.array();
            const d = new Date();
            console.log('User presence status update:', d);
            for (var guild of guilds) {
                var members = guild.members.array();
                for (var member of members) {
                    if (!member.user.bot) {
                        knex('user_presence').insert({
                            user_id: member.id,
                            guild_id: member.guild.id,
                            status: member.presence.status,
                            microtime_timestamp: moment().valueOf()
                        })
                            .then()
                            .catch(console.error);
                    }
                }
            }
        });
        job.start();

        // TODO podzielić na mniejsze pliki 

        DiscordClient.on('guildMemberAdd', member => {
            if (!member.user.bot) {

                // TODO sprawdzanie czy dana osoba istnieje już w bazie aby nie dublować rekordu

                knex('users')
                    .where({
                        user_id: member.id,
                        guild_id: member.guild.id,
                    })
                    .update({
                        nickname: member.nickname,
                        username: member.user.username,
                        avatar: member.user.displayAvatarURL,
                        discriminator: member.user.discriminator,
                        left: 0
                    })
                    .then(i => {
                        // if 0 db cant find row to update so create one
                        if (i === 0) {
                            knex('users')
                                .insert({
                                    user_id: member.id,
                                    guild_id: member.guild.id,
                                    username: member.user.username,
                                    nickname: member.nickname,
                                    joined_timestamp: member.joinedTimestamp,
                                    avatar: member.user.displayAvatarURL,
                                    account_created_timestamp: member.user.createdTimestamp,
                                    discriminator: member.user.discriminator
                                })
                                .then(console.log('User joined ', member.displayName, " to ", member.guild.name))
                                .catch(console.error);
                        }
                    });


                knex('users_actions').insert({
                    user_id: member.id,
                    guild_id: member.guild.id,
                    type: 'join',
                    create_timestamp: moment().valueOf()
                })
                    .then()
                    .catch(console.error);
            }
        });

        DiscordClient.on('guildMemberUpdate', (oldMember, newMember) => {
            if (!newMember.user.bot) {
                var diff = {};
                oldMember.nickname !== newMember.nickname ? diff.nickname = newMember.nickname : false;

                knex('users').update(diff).where({ user_id: newMember.id, guild_id: newMember.guild.id })
                    .then()
                    .catch(console.error);

                knex('users_actions').insert({
                    user_id: oldMember.id,
                    guild_id: oldMember.guild.id,
                    type: 'nickname',
                    new_value: newMember.nickname,
                    old_value: oldMember.nickname,
                    create_timestamp: moment().valueOf()
                })
                    .then()
                    .catch(console.error);
            }
        });

        DiscordClient.on('guildMemberRemove', (member) => {
            try {
                if (config.guildLeftAdminPM.hasOwnProperty(member.guild.id)) {
                    var guild = member.guild;
                    var admins = config.guildLeftAdminPM[guild.id];

                    // User Spent time
                    var leftTime = moment(new Date());
                    var joined = moment(member.joinedAt);
                    var duration = moment.duration(leftTime.diff(joined));
                    //

                    var timestring =
                        `Joined: ${joined.format("DD/MM/YYYY, HH:mm:ss")}\n` +
                        `Spent: ` +
                        `${duration.years()} Years, ` +
                        `${duration.months()} Months, ` +
                        `${duration.days()} Days, ` +
                        `${duration.hours()} Hours, ` +
                        `${duration.minutes()} Minutes, ` +
                        `${duration.seconds()} Seconds`;

                    const embed = new Discord.RichEmbed().setTimestamp(new Date());
                    embed.setAuthor(member.displayName + "#" + member.user.discriminator, member.user.displayAvatarURL);
                    embed.setThumbnail(guild.iconURL);
                    embed.setDescription('**Left** ' + guild.name);
                    embed.addField('Time', timestring);
                    embed.setFooter('User Id: ' + member.id)
                    embed.setColor([214, 44, 38]);

                    for (var id in admins) {
                        guild.members.get(admins[id]).send(embed);
                    }
                }
            } catch (exception) {
                console.log(exception);
            }

            if (!member.user.bot) {
                // Update user data
                knex('users').update({
                    leave_timestamp: moment().valueOf(),
                    left: 1
                })
                    .then()
                    .catch(console.error);

                knex('users_actions').insert({
                    user_id: member.id,
                    guild_id: member.guild.id,
                    type: "leave",
                    create_timestamp: moment().valueOf()
                })
                    .then()
                    .catch(console.error);
            }
            console.log('User ', member.displayName, " left ", member.guild.name);
        });

        DiscordClient.on('userUpdate', (oldUser, newUser) => {
            if (!newUser.bot) {
                var diff = {};
                oldUser.username !== newUser.username ? diff.username = newUser.username : false;
                oldUser.displayAvatarURL !== newUser.displayAvatarURL ? diff.avatar = newUser.displayAvatarURL : false;
                oldUser.discriminator !== newUser.discriminator ? diff.discriminator = newUser.discriminator : false;

                knex('users').update(diff).where({ user_id: newUser.id })
                    .then()
                    .catch(console.error);
            }
        });

        DiscordClient.on('guildUpdate', (oldGuild, newGuild) => {
            var diff = {};
            oldGuild.name !== newGuild.name ? diff.name = newGuild.name : false;
            oldGuild.iconURL !== newGuild.iconURL ? diff.iconURL = newGuild.iconURL : false;
            oldGuild.ownerID !== newGuild.ownerID ? diff.owner_Id = newGuild.ownerID : false;

            knex('guilds').update(diff).where({ guild_id: newGuild.id })
                .then()
                .catch(console.error);
        });

        DiscordClient.on('message', message => {
            try {
                if (!message.author.bot && message.guild) {
                    var userid = message.author.id;
                    var guildid = message.guild.id;
                    var ymd = moment().format("YYYYMMDD");
                    var hour = moment().format("H");

                    var words = message.content.split(' ').length;
                    var chars = message.content.length;
                    var attachments = 0;

                    // attachments counter 
                    if (message.attachments.array().length > 0) {
                        attachments = message.attachments.array().length;
                    }

                    knex('message_counter_user_stats')
                        .where({
                            user_id: userid,
                            guild_id: guildid
                        })
                        .increment({
                            total_messages: 1,
                            total_words: words,
                            total_chars: chars,
                            total_attachments: attachments
                        })
                        .update({ last_message_timestamp: moment().valueOf() })
                        .then(i => {
                            // if 0 db cant find row to update so create one
                            if (i === 0) {
                                let timestamp = moment().valueOf();
                                knex('message_counter_user_stats').insert({
                                    user_id: userid,
                                    guild_id: guildid,
                                    random_quote_last_update: timestamp,
                                    created_timestamp: timestamp,
                                    last_message_timestamp: timestamp,
                                    total_messages: 1,
                                    total_words: words,
                                    total_chars: chars,
                                    total_attachments: attachments
                                })
                                    .then()
                                    .catch(console.error);
                            }
                        })
                        .catch(console.error);

                    knex('message_counter')
                        .where({ user_id: userid, guild_id: guildid, ymd: ymd })
                        .increment(hour, 1)
                        .then(i => {
                            // if 0 db cant find row to update so create one
                            if (i === 0) {
                                knex('message_counter').insert({
                                    user_id: userid,
                                    guild_id: guildid,
                                    ymd: ymd,
                                    [hour]: 1
                                })
                                    .then()
                                    .catch(console.error);
                            }
                        })
                        .catch(console.error);

                    knex('message_counter_guilds')
                        .where({ guild_id: guildid, ymd: ymd })
                        .increment(hour, 1)
                        .then(i => {
                            // if 0 db cant find row to update so create one
                            if (i === 0) {
                                knex('message_counter_guilds').insert({
                                    guild_id: guildid,
                                    ymd: ymd,
                                    [hour]: 1
                                })
                                    .then()
                                    .catch(console.error);
                            }
                        })
                        .catch(console.error);
                }
            } catch (e) {
                console.log(e);
            }
        });
        DiscordClient.on('presenceUpdate', (om, nm) => {
            // om = oldMember
            // nm = newMember
            try {
                if (!nm.user.bot || !om.user.bot) {
                    var nmp = nm.presence;
                    var omp = om.presence;
                    var data = {};

                    data.userId = nm.id;
                    data.guildId = nm.guild.id;
                    data.nmom = 1;
                    data.timestamp = Date.now();
                    data.status = nmp.status;
                    data.ostatus = omp.status;

                    if (nmp.game) {
                        data.gameName = nmp.game.name;
                        data.gameState = nmp.game.state;
                        data.gameDetails = nmp.game.details;

                        if (nmp.game.applicationID) {
                            data.gameId = nmp.game.applicationID;
                        }
                        if (nmp.game.timestamps) {
                            if (nmp.game.timestamps.start) {
                                data.gameStart = new Date(nmp.game.timestamps.start).getTime();
                            }
                            if (nmp.game.timestamps.end) {
                                data.gameEnd = new Date(nmp.game.timestamps.end).getTime();
                            }
                        }
                        //console.log(data);
                        knex('presenceupdate').insert(data).then();
                    }
                }
            } catch (ex) {
                console.log('Presense status log error!');
                console.log(ex);
            }
        });
        DiscordClient.on('voiceStateUpdate', (oldMember, newMember) => {

            if (newMember.voiceChannelID === null || newMember.voiceChannelID === undefined) {
                var guild = newMember.guild;
            } else {
                var guild = oldMember.guild;
            }

            if (config.logsChannels.hasOwnProperty(guild.id)) {
                // Jeśli istnieje przypisany kanał do logów
                var logsChannelId = config.logsChannels[guild.id];

                try {
                    const embed = new Discord.RichEmbed().setTimestamp(new Date());
                    if (newMember.voiceChannelID !== oldMember.voiceChannelID && logsChannelId !== null) {
                        var logsChannel = guild.channels.get(logsChannelId);

                        if (oldMember.voiceChannelID === null || oldMember.voiceChannelID === undefined) {
                            embed.setAuthor(newMember.displayName + "#" + newMember.user.discriminator, newMember.user.displayAvatarURL);
                            embed.setDescription('Joined to **' + newMember.voiceChannel + '**');
                            embed.setColor([79, 214, 38]);
                        } else if (newMember.voiceChannelID && oldMember.voiceChannelID) {
                            embed.setAuthor(newMember.displayName + "#" + newMember.user.discriminator, newMember.user.displayAvatarURL);
                            embed.setDescription('Switched from **' + oldMember.voiceChannel + '** to **' + newMember.voiceChannel + '**');
                            embed.setColor([33, 108, 198]);
                        } else {
                            embed.setAuthor(oldMember.displayName + "#" + oldMember.user.discriminator, oldMember.user.displayAvatarURL);
                            embed.setDescription('Left **' + oldMember.voiceChannel + '**');
                            embed.setColor([214, 44, 38]);
                        }
                        logsChannel.send(embed);

                        //serverDeaf serverMute
                    }
                    if (newMember.guild.id !== oldMember.guild.id) {
                        const oembed = new Discord.RichEmbed().setTimestamp(new Date());
                        var ologsChannel = oldMember.guild.channels.get(config.logsChannels[oldMember.guild.id]);
                        oembed.setAuthor(oldMember.displayName + "#" + oldMember.user.discriminator, oldMember.user.displayAvatarURL);
                        oembed.setDescription('Left **' + oldMember.voiceChannel + '**');
                        oembed.setColor([214, 44, 38]);
                        ologsChannel.send(oembed);

                        const nembed = new Discord.RichEmbed().setTimestamp(new Date());
                        var nlogsChannel = newMember.guild.channels.get(config.logsChannels[newMember.guild.id]);
                        nembed.setAuthor(newMember.displayName + "#" + newMember.user.discriminator, newMember.user.displayAvatarURL);
                        nembed.setDescription('Joined to **' + newMember.voiceChannel + '**');
                        nembed.setColor([79, 214, 38]);
                        nlogsChannel.send(nembed);
                    }
                } catch (exception) {
                    console.log(exception);
                }
            }
        });

        DiscordClient.on('messageDelete', (message) => {
            /* 
             * ************ ! UWAGA ! ************
             *
             *  Niestety wykrywane są usunięcia 
             *  tylko tych wiadomości które były 
             *  zamieszczone podczas działania bota,
             *  wszystkie inne są niezauważone
             *
             * ***********************************
             */

            try {
                var guild = message.guild;

                // FIXME FIX!!!! check if message is not pm
                // BUG: crash after delete user pm
                if (message.guild) {

                    if (config.activityLogChannels.hasOwnProperty(guild.id) && message.author.bot === false) {
                        // Jeśli istnieje przypisany kanał do logów i autor nie jest botem
                        let logsChannel = guild.channels.get(config.activityLogChannels[guild.id]);
                        // 
                        var attachments = message.attachments.array();
                        // Get all attachments in message
                        var urls = "";
                        // All attachments url in string
                        const embed = new Discord.RichEmbed()
                            .setDescription("**Deleted in **<#" + message.channel.id + ">")
                            .setFooter("Message id: " + message.id)
                            .setColor([214, 44, 38])

                            .setTimestamp(message.createdAt);

                        if (message.member.id.length > 0) {
                            embed.setAuthor(message.member.displayName + " [" + message.author.username + " #" + message.author.discriminator + "]", message.author.displayAvatarURL);
                        } else {
                            embed.setAuthor("[" + message.author.username + " #" + message.author.discriminator + "]", message.author.displayAvatarURL);
                        }

                        if (message.content.length > 0) {
                            embed.addField('Message', message.content);
                        }

                        if (attachments.length > 0) {
                            for (var i in attachments) {
                                urls += attachments[i].proxyURL + "\n";
                            }
                            embed.addField('Attachments', urls);
                        }
                        logsChannel.send(embed);

                        console.log("*******************************");
                        console.log("Message Deletation Detected!");
                        console.log("Message id:" + message.id);
                        console.log("Author:" + message.author.username + " id:" + message.author.id);
                        console.log("Guild:" + message.guild.name);
                        console.log("Channel:" + message.channel.name);
                        console.log("*******************************");
                        console.log(message.cleanContent);
                        console.log(urls);
                        console.log("*******************************");
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
    }
    statusToInt(params) {
        switch (params) {
            case 'undefined':
                return 0;
                break;
            case 'offline':
                return 1;
                break;
            case 'online':
                return 2;
                break;
            case 'idle':
                return 3;
                break;
            case 'dnd':
                return 4;
                break;
        }
    };
    statusToString(params) {
        switch (params) {
            case 0:
                return 'undefined';
                break;
            case 1:
                return 'offline';
                break;
            case 2:
                return 'online';
                break;
            case 3:
                return 'idle';
                break;
            case 4:
                return 'dnd';
                break;
        }
    };
}

module.exports = Supervision;