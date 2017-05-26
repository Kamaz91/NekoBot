/* global ADMIN_ID, WOT_APP_ID, FS, CONFIG */
const fs = require('fs');
const Cfg = require('./Config.js');

class Trigger {
    constructor(client) {
        this.client = client;
        this.prefix = '!';
        this.triggersList = {};
        /* Lista triggerów */
        /* [name, path]    */
        this.triggers = [];
    }

    process() {
        this.checkTrigger();
    }

    loadTriggers() {
        var date = new Date();
        /* Lista triggerów */
        /* [name, alias, path] */

        this.triggersList = JSON.parse(fs.readFileSync('./config/triggersList.json', 'utf8'));
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
    }

    reloadTriggers() {
        for (var trigger of this.triggersList) {
            this.removeTrigger(trigger.path);
        }
        this.loadTriggers();
    }

    removeTrigger(moduleName) {
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
    }

    checkTrigger(message) {

        if (!message.author.bot) {
            var params = {};
            /* Trigger */
            params['trigger'] = message.content.substring(0, message.content.indexOf(' ')) || message.content;
            if (params['trigger'] === '!reload' && message.author.id === new Cfg().adminId) {
                this.reloadTriggers();
            } else
            if (this.triggers[params.trigger]) {
                /* Rozdzielenie wiadomości po spacjach */
                params['splitTigger'] = message.content.split(' ');
                /* Tekst wiadomości bez triggera */
                params['text'] = message.content.slice(params.splitTigger[0].length).trim();
                try {
                    new this.triggers[params.trigger](message, params, this.client);
                } catch (exception) {
                    console.log(exception);
                }
            }
        }
    }
}

module.exports = Trigger;