class guildUpdate {
    constructor(args) {
        this.oldGuild = args[0];
        this.newGuild = args[1];

        try {
            var diff = {};
            this.oldGuild.name !== this.newGuild.name ? diff.name = this.newGuild.name : false;
            this.oldGuild.iconURL !== this.newGuild.iconURL ? diff.iconURL = this.newGuild.iconURL : false;
            this.oldGuild.ownerID !== this.newGuild.ownerID ? diff.owner_Id = this.newGuild.ownerID : false;

            knex('guilds').update(diff).where({ guild_id: this.newGuild.id })
                .then()
                .catch(console.error);
        } catch (e) {
            console.log(e);
        }

    }
}

module.exports = guildUpdate;