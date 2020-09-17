console.log('Starting...');
console.log('****************************');
console.log('*        NekoBot v11       *');
console.log('****************************');

require('console-stamp')(console, 'dd/mm/yyyy HH:MM:ss');

const client = require('./includes/Discord/connection.js');
const { events } = require('./includes/config/config.js');
const TriggerManager = require('./includes/TriggerManager.js');
const ModulesLoader = require('./includes/ModulesLoader.js');

console.info("Loading config");
events.once('config-ready', function () {
    console.info("Config Loaded");
    var TM = new TriggerManager(client);
    var ML = new ModulesLoader(client, TM);
});