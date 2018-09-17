const fs = require('fs');
const path = require('path');

const modulesDir = `${path.sep}modules${path.sep}`;

class ModulesLoader {

    constructor(DiscordClient, TriggerManager) {
        this.DiscordClient = DiscordClient;
        this.TriggerManager = TriggerManager;
        this.ModulesList = {};
        this.loadModules();
    }
    loadModules() {
        console.log("Module Loader:");
        fs.readdirSync(`.${modulesDir}`).forEach(moduleName => {
            // Przeszukiwanie folderu modułów
            var jsonPath = `.${modulesDir}${moduleName}${path.sep}config.json`;
            if (fs.existsSync(jsonPath)) {
                console.log("Moduł: " + moduleName);
                let jsonConfig = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                // Ładowanie konfiguracji modułu
                let date = new Date();
                let t = [
                    `0${date.getHours()}`.slice(-2),   // Godziny
                    `0${date.getMinutes()}`.slice(-2), // Minuty
                    `0${date.getSeconds()}`.slice(-2)  // Sekundy
                ];
                var messageTime = t.join(':');
                // Czas systemu hh:mm:ss
                var ModuleObj = {
                    name: moduleName,
                    path: `..${modulesDir}${moduleName}${path.sep}`,
                    module: null,
                    enabled: false,
                    status: false,
                    start: null
                };
                // Szablon konfiguracji moodułu
                ModuleObj = Object.assign(ModuleObj, jsonConfig);
                // Dołączenie danych z pliku Json

                if (ModuleObj.enabled) {
                    console.log(messageTime + ' Ładowanie modułu: ' + ModuleObj.name);
                    try {
                        var mod = require(`..${modulesDir}${moduleName}${path.sep}${ModuleObj.start}`);
                    } catch (exception) {
                        console.log('ERROR - Wystąpił błąd Podczas ładowania ');
                        console.log(exception);
                    }
                    try {
                        ModuleObj.module = new mod(this.DiscordClient, this.TriggerManager);
                        // Inicjalizacja
                        ModuleObj.status = true;
                        // Zmiana statusu
                        this.ModulesList[moduleName] = ModuleObj;
                        // Dodawanie do listy

                    } catch (exception) {
                        console.log('ERROR - Wystąpił błąd Podczas inicjalizacji modułu ');
                        console.log(exception);
                    }
                    console.log('------ Załadowano moduł ------');
                } else {
                    console.log(messageTime + ' Pominięto moduł: ' + ModuleObj.name);
                }
            }
        });
    }

    reloadModules() {
        for (let module of this.modulesPath) {
            this.removeModule(module.path);
        }
        this.loadModules();
    }

    removeModule(moduleName) {
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
}

module.exports = ModulesLoader;