const moment = require('moment');

class guildUpdate {
    constructor(args) {
        this.oldGuild = args[0];
        this.newGuild = args[1];

        try {
            var diff = {};

            this.oldGuild.name !== this.newGuild.name ? diff.name = this.newGuild.name : false;
            this.oldGuild.iconURL !== this.newGuild.iconURL ? diff.iconURL = this.newGuild.iconURL : false;
            this.oldGuild.ownerID !== this.newGuild.ownerID ? diff.owner_Id = this.newGuild.ownerID : false;

            for (let [property, change] of Object.entries(diff)) {
                let SQLInsertdata = {
                    guild_id: this.oldGuild.id,
                    create_timestamp: moment().valueOf()
                };

                SQLInsertdata.type = this.actionType(property);
                SQLInsertdata.new_value = this.newGuild[property];
                SQLInsertdata.old_value = this.oldGuild[property];
                this.InsertData(SQLInsertdata);
            }

        } catch (e) {
            console.log(e);
        }

    }

    InsertData(SQLInsertdata) {
        knex('guilds_actions').insert(SQLInsertdata)
            .then()
            .catch(console.error);
    }

    actionType(params) {
        switch (params) {
            case 'name':
                return 'nameChange';
            case 'iconURL':
                return 'imageChange';
            case 'owner_Id':
                return 'ownerChange';
        }
    };

}

module.exports = guildUpdate;