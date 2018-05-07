class userWatch {

    constructor(client) {
        this.client = client;
        this.guilds = {};
        this.members = {};

        client.on('ready', () => {
            console.log("Processing users");
            this.getUsersFromGuilds();
        });
        client.on('guildMemberAdd', (member) => {
            console.log("Joined " + member.displayName + " to " + member.guild.name);
            this.members[member.id] = member;
            this.guilds[member.guild.id] += member;
        });
    }

    getUsersFromGuilds() {
        this.client.guilds.array().forEach((guild) => {
            this.guilds[guild.id] = guild;
            guild.members.array().forEach((member) => {
                this.members[member.id] = member;
            });
        });
    }

    addUsers(guildId, members) {
        if (!this.client.guilds.guildId) {
            this.client.guilds.push({[guildId]: {}});
        }
        this.guilds[guildId] = members;
    }

    updateUserStatus(member) {

    }

    getUserStatus(member) {

    }
}

module.exports = userWatch;
// Kanał testowy
//437709305899122689