const fs = require('fs');

class Config {
    constructor() {
        /* Załadowanie konfiguracji */
        this.cfg = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
        this.adminId = this.cfg.AdminId;
        this.logsChannelId = this.cfg.LogsChannelId;
        this.logsChannels = this.cfg.logsChannels;
        /* Załadowanie tokenów */
        this.tokens = JSON.parse(fs.readFileSync('./config/tokens.json', 'utf8'));
    }

    getToken(searchToken) {
        return this.tokens[searchToken];
    }
}

module.exports = Config;