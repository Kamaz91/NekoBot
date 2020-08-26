const db = require("../../../../includes/database/index.js");
class guildUpdate {
    constructor(args) {
        oldGuild = args[0];
        newGuild = args[1];

        if (oldGuild.name !== newGuild.name) {
            db.guilds.data.update.name(newGuild.name, newGuild.id);
            db.guilds.actions.insert.changeName(newGuild.name, oldGuild.name, newGuild.id);
        }

        if (oldGuild.iconURL !== newGuild.iconURL) {
            db.guilds.data.update.avatar(newGuild.iconURL, newGuild.id);
            db.guilds.actions.insert.changeAvatar(newGuild.iconURL, oldGuild.iconURL, newGuild.id);
        }

        if (oldGuild.ownerID !== newGuild.ownerID) {
            db.guilds.data.update.newOwner(newGuild.ownerID, newGuild.id);
            db.guilds.actions.insert.changeOwner(newGuild.ownerID, oldGuild.ownerID, newGuild.id);
        }
    }
}

module.exports = guildUpdate;