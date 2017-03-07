/* global ADMIN_ID, WOT_APP_ID */

var method = Trigger.prototype;
function Trigger(message, triggers) {
    /* Objekt wiadomości */
    this.message = message;
    /* Obiekt trigger */
    this.trigger = {};
    /* Cała wiadomość */
    this.trigger['raw'] = this.message.content;
    /* Rozdzielenie wiadomości po spacjach */
    this.trigger['splitTigger'] = this.message.content.split(' ');
    /* Trigger */
    this.trigger['trigger'] = this.trigger.splitTigger[0];
    /* Tekst wiadomości bez triggera */
    this.trigger['text'] = this.message.content.slice(this.trigger.splitTigger[0].length).trim();
    /* Lista triggerów */
    /* [name, path]    */
    this.triggers = triggers;
    /*  */
    this.process();
}

method.process = function () {
    if (this.triggers[this.trigger.trigger]) {
        try {
            this.triggers[this.trigger.trigger](this.message, this.trigger);
        } catch (exception) {
            console.log(exception);
        }
    }
};
module.exports = Trigger;