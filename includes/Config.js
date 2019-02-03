const fs = require('fs');

class Config {
    constructor() {
        /* Ładowanie konfiguracji */
        this.cfg = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
        this.adminId = this.cfg.AdminId;
        this.logsChannels = this.cfg.logsChannels;
        this.activityLogChannels = this.cfg.activityLogChannels;
        this.guildLeftAdminPM = this.cfg.guildLeftAdminPM;
        /* Ładowanie tokenów */
        this.tokens = JSON.parse(fs.readFileSync('./config/tokens.json', 'utf8'));
    }

    getToken(searchToken) {
        return this.tokens[searchToken];
    }
}

module.exports = Config;