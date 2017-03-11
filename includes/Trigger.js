/* global ADMIN_ID, WOT_APP_ID, FS, CONFIG */

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
    for (var trigger of this.triggersList) {
        this.removeTrigger(trigger.path);
    }
    this.loadTriggers();
};

method.removeTrigger = function (moduleName) {
    var purgeCache = function (moduleName) {
        // Traverse the cache looking for the files
        // loaded by the specified module name
        searchCache(moduleName, function (mod) {
            delete require.cache[mod.id];
        });

        // Remove cached paths to the module.
        // Thanks to @bentael for pointing this out.
        Object.keys(module.constructor._pathCache).forEach(function (cacheKey) {
            if (cacheKey.indexOf(moduleName) > 0) {
                delete module.constructor._pathCache[cacheKey];
            }
        });
    };

    /**
     * Traverses the cache to search for all the cached
     * files of the specified module name
     */
    var searchCache = function (moduleName, callback) {
        // Resolve the module identified by the specified name
        var mod = require.resolve(moduleName);

        // Check if the module has been resolved and found within
        // the cache
        if (mod && ((mod = require.cache[mod]) !== undefined)) {
            // Recursively go over the results
            (function traverse(mod) {
                // Go over each of the module's children and
                // traverse them
                mod.children.forEach(function (child) {
                    traverse(child);
                });

                // Call the specified callback providing the
                // found cached module
                callback(mod);
            }(mod));
        }
    };
    purgeCache(moduleName);
};

method.checkTrigger = function (message) {

    if (!message.author.bot) {
        /* Objekt wiadomości */
        /* Obiekt trigger */
        var params = {};
        /* Rozdzielenie wiadomości po spacjach */
        params['splitTigger'] = message.content.split(' ');
        /* Trigger */
        params['trigger'] = params.splitTigger[0];
        /* Tekst wiadomości bez triggera */
        params['text'] = message.content.slice(params.splitTigger[0].length).trim();

        if (params['trigger'] === '!reload' && message.author.id === CONFIG.AdminId) {
            this.reloadTriggers();
        } else
        if (this.triggers[params.trigger]) {
            try {
                this.triggers[params.trigger](message, params);
            } catch (exception) {
                console.log(exception);
            }
        }
    }
};
module.exports = Trigger;