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
    /*  */
    this.trigger['splitText'] = this.message.content.split(this.trigger.splitTigger[0]);
    /* Trigger */
    this.trigger['trigger'] = this.trigger.splitTigger[0];
    /* Tekst wiadomości bez triggera*/
    this.trigger['text'] = this.trigger.splitText[1].trim();
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