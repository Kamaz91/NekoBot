const db = require("../../../../includes/database/index.js");

class userUpdate {
    constructor(args) {
        var oldUser = args[0];
        var newUser = args[1];

        if (oldUser.username !== newUser.username ||
            oldUser.avatar !== newUser.avatar ||
            oldUser.discriminator !== newUser.discriminator
        ) {
            var data = {
                username: newUser.username,
                avatar_id: newUser.avatar,
                discriminator: newUser.discriminator
            };
            db.guilds.members.update.userPersonalData(newUser.id, data);
        }
    }
}

module.exports = userUpdate;