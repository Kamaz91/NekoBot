/* global ADMIN_ID, WOT_APP_ID, FS */

var method = Trigger.prototype;
function Trigger() {
    this.prefix = '!';
    this.triggersList = {};
    /* Lista triggerów */
    /* [name, path]    */
    this.triggers = [];
}

method.process = function () {
    this.checkTrigger();
};

method.loadTriggers = function () {
    var date = new Date();

    /* Lista triggerów */
    /* [name, alias, path] */

    this.triggersList = JSON.parse(FS.readFileSync('./config/triggersList.json', 'utf8'));

    for (var trigger of this.triggersList) {
        /* Czas wiadomości hh:mm:ss */
        var messageTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
        if (trigger.status) {
            try {
                console.log(messageTime + ' Ładowanie modułu: ' + trigger.name);
                var module = require(trigger.path);
                //console.log(new module());
                this.triggers[this.prefix + trigger.name] = module;
                console.log('   - Załadowano moduł');
            } catch (exception) {
                console.log('   - Wystąpił błąd Podczas ładowania ');
                console.log(exception);
            }
            module = null;
        } else {
            console.log(messageTime + ' Pominięto moduł: ' + trigger.name);
        }
    }
};

method.reloadTriggers = function () {

};

method.checkTrigger = function (message) {
    /* Objekt wiadomości */
    /* Obiekt trigger */
    var params = {};
    /* Rozdzielenie wiadomości po spacjach */
    params['splitTigger'] = message.content.split(' ');
    /* Trigger */
    params['trigger'] = params.splitTigger[0];
    /* Tekst wiadomości bez triggera */
    params['text'] = message.content.slice(params.splitTigger[0].length).trim();

    if (this.triggers[params.trigger]) {
        try {
            this.triggers[params.trigger](message, params);
        } catch (exception) {
            console.log(exception);
        }
    }
};
module.exports = Trigger;