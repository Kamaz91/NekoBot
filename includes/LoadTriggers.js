/* global FS */

var method = LoadTriggers.prototype;
function LoadTriggers() {
    /* Domyślny prefix triggera */
    this.prefix = '!';
}

method.setPrefix = function (prefix) {
    this.prefix = prefix;
};

method.loadTriggers = function () {
    /* Obecny czas */
    var date = new Date();
    /* Czas wiadomości hh:mm:ss */
    var messageTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
    /* Lista triggerów */
    /* [name, alias, path] */
    var triggers = [];

    var json = JSON.parse(FS.readFileSync('./config/triggersList.json', 'utf8'));
    for (var trigger of json) {
        try {
            console.log(messageTime + ' Ładowanie modułu: ' + trigger.name);
            var module = require(trigger.path);
            //console.log(new module());
            triggers[this.prefix + trigger.name] = module;
            console.log('   - Załadowano moduł');
        } catch (exception) {
            console.log('   - Wystąpił błąd Podczas ładowania ');
            console.log(exception);
        }
        module = null;
    }
    return triggers;
};

method.reloadTriggers = function () {

};

module.exports = LoadTriggers;