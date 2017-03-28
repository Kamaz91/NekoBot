var method = Peopes.prototype;
function Peopes() {
    this.Peoples = {guilds: []};
}

method.scanGuildUsers = function (guilds) {
    for (var i in guilds) {
        if (guilds[i].length > -1) {
            this.addUsers(guilds[i].id, guilds[i].members);
        }
    }
};

method.addUsers = function (guildId, members) {
    if (!this.Peoples.guilds.guildId) {
        this.Peoples.guilds.push({[guildId]: {}});
    }
    this.Peoples.guilds[guildId] = members;
};

module.exports = Peopes;