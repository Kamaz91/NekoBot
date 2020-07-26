const moment = require('moment');

module.exports = (Connection) => {
    return {
        allSortetByTimestamp: () => {
            return Connection('guilds')
                .select('*')
                .orderBy("createdTimestamp", "ASC")
                .then((rows) => {
                    if (rows.length > 0) {
                        return { status: 1, request: rows };
                    } else {
                        return { status: 0, request: "Guilds not found" }
                    }
                })
                .catch(err => console.log);
        }
    }
}

