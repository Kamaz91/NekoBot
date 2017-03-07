/* global ADMIN_ID */

var method = setgame.prototype;
function setgame(message, trigger) {
    if (message.author.id === ADMIN_ID) {
        if (trigger.text.length > 1) {
            client.user.setGame(trigger.text);
        } else {
            client.user.setGame();
        }
    }
}

module.exports = setgame;