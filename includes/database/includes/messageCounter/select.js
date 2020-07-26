const moment = require('moment');

module.exports = (Connection) => {
    return {
        memberDay: (guild_id, user_id, ymd) => {
            return Connection('message_counter')
                .where({
                    guild_id: guild_id,
                    user_id: user_id,
                    ymd: ymd
                })
                .select('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23')
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows[0] };
                    } else {
                        return { status: 0, request: "Member not found" }
                    }
                })
                .catch(err => console.log);
        },
        memberMonth: (guild_id, user_id, ym) => {
            return Connection('message_counter')
                .where({
                    guild_id: guild_id,
                    user_id: user_id,
                })
                .whereBetween('ymd', [ym * 100, (ym + 1) * 100])
                .select('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', 'ymd')
                .then((rows) => {
                    if (rows.length > 0) {
                        var json = {};
                        for (let element of rows) {
                            let ymd = element.ymd;
                            delete element.ymd;
                            json[ymd] = element;
                        }
                        return { status: 1, request: json };
                    } else {
                        return { status: 0, request: "Member not found" }
                    }
                })
                .catch(err => console.log);
        },
        guildByDate: (guild_id, ymd) => {
            return Connection('message_counter')
                .where({
                    guild_id: guild_id,
                    ymd: ymd
                })
                .select('*')
                .then((rows) => {
                    if (rows.length > 0) {
                        var json = {};
                        for (var user of rows) {
                            let userid = user.user_id;
                            delete user.user_id;
                            delete user.guild_id;
                            delete user.ymd;
                            json[userid] = user;
                        }
                        return { status: 1, request: json };
                    } else {
                        return { status: 0, request: "Guild not found" }
                    }
                })
                .catch(err => console.log);
        },
        membersWithJoinedStats: (guild_id) => {
            return Connection('message_counter_user_stats')
                .select('*')
                .rightJoin('members', function () {
                    this
                        .on('members.user_id', '=', 'message_counter_user_stats.user_id')
                        .andOn('members.guild_id', '=', 'message_counter_user_stats.guild_id')
                })
                .where({
                    'members.guild_id': guild_id,
                })
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows };
                    } else {
                        return { status: 0, request: "Members not found" }
                    }
                })
                .catch(err => console.log);
        }
    }
}