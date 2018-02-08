/* global ADMIN_ID, CONFIG */
const Cfg = require('../includes//Config.js');

var method = setgame.prototype;
function setgame(message, trigger, client) {
    if (message.author.id === new Cfg().adminId) {
        if (trigger.text.length > 1) {
            client.user.setActivity(trigger.text);
        } else {
            client.user.setActivity();
        }
    }
}

module.exports = setgame;
