/* global ADMIN_ID, WOT_APP_ID */

var method = Trigger.prototype;
function Trigger(message, triggers) {
    /* Objekt wiadomości */
    this.message = message;
    /* Obiekt trigger */
    this.params = {};
    /* Rozdzielenie wiadomości po spacjach */
    this.params['splitTigger'] = this.message.content.split(' ');
    /* Trigger */
    this.params['trigger'] = this.params.splitTigger[0];
    /* Tekst wiadomości bez triggera */
    this.params['text'] = this.message.content.slice(this.params.splitTigger[0].length).trim();
    /* Lista triggerów */
    /* [name, path]    */
    this.params['triggers'] = triggers;
    /*  */
    this.process();
}

method.process = function () {
    if (this.params.triggers[this.params.trigger]) {
        try {
            this.params.triggers[this.params.trigger](this.message, this.params);
        } catch (exception) {
            console.log(exception);
        }
    }
};
module.exports = Trigger;