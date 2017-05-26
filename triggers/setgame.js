/* global ADMIN_ID, CONFIG */
const Cfg = require('../includes//Config.js');

var method = setgame.prototype;
function setgame(message, trigger, client) {
    if (message.author.id === new Cfg().adminId) {
        if (trigger.text.length > 1) {
            client.user.setGame(trigger.text);
        } else {
            client.user.setGame();
        }
    }
}

module.exports = setgame;
