const fs = require('fs');

var config = JSON.parse(fs.readFileSync('./config/db.json'));

var dbConnection = require('knex')({
    client: config.client,
    connection: {
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
    }
});

module.exports = {
    connection: dbConnection,
    /**
     * Disconnect from database
     */
    disconnect: () => {
        console.log(`Database successfully disconnected from the: ${config.database}@${config.host}`);
        dbConnection.destroy();
    },
    bot: {
        token: {
            get: require('./includes/bot/token/select.js')(dbConnection),
        },
        settings: {
            // TODO
        }
    },
    users: {
        account: {
            get: require('./includes/users/account/select.js')(dbConnection),
            insert: require('./includes/users/account/insert.js')(dbConnection),
            update: require('./includes/users/account/update.js')(dbConnection)
        }
    },
    guilds: {
        channels: {
            get: require('./includes/guilds/channels/select.js')(dbConnection),
            insert: require('./includes/guilds/channels/select.js')(dbConnection), // TODO
            update: require('./includes/guilds/channels/select.js')(dbConnection)  // TODO
        },
        members: {
            get: require('./includes/guilds/members/select.js')(dbConnection),
            insert: require('./includes/guilds/members/insert.js')(dbConnection),
            update: require('./includes/guilds/members/update.js')(dbConnection)
        },
        data: {
            get: require('./includes/guilds/data/select.js')(dbConnection)
        }
    },
    guildManagment: {
        settings: {
            logsChannels: require('./includes/guildManagment/settings/logschannels.js')(dbConnection),
            autoPurge: require('./includes/guildManagment/settings/autoPurge.js')(dbConnection),
            modules: require('./includes/guildManagment/settings/modules.js')(dbConnection),
        },
        modules: {
            autoPurge: require('./includes/guildManagment/modules/autoPurge.js')(dbConnection),
        }
    },
    messageCounter: {
        get: require('./includes/messageCounter/select.js')(dbConnection),
        insert: null, //TODO
        update: null  //TODO
    }
}