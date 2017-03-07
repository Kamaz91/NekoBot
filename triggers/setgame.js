/* global ADMIN_ID, CONFIG */

var method = setgame.prototype;
function setgame(message, trigger) {
    if (message.author.id === CONFIG.AdminId) {
        if (trigger.text.length > 1) {
            client.user.setGame(trigger.text);
        } else {
            client.user.setGame();
        }
    }
}

module.exports = setgame;