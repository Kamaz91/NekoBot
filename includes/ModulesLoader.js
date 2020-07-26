const fs = require('fs');
const path = require('path');

const modulesDir = path.resolve('modules');
class ModulesLoader {

    constructor(DiscordClient, TriggerManager) {
        this.DiscordClient = DiscordClient;
        this.TriggerManager = TriggerManager;
        this.ModulesList = {};
        this.loadModules();
    }
    loadModules() {
        console.info("Module Loader:");
        console.info('Modules dir: ' + modulesDir);
        console.info('-----------------------------');
        fs.readdirSync(modulesDir).forEach(moduleName => {
            // Przeszukiwanie folderu modułów
            var jsonPath = path.resolve(modulesDir, moduleName, 'config.json');
            if (fs.existsSync(jsonPath)) {
                let jsonConfig = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

                // Ładowanie konfiguracji modułu
                var ModuleObj = {
                    name: moduleName,
                    path: path.resolve(modulesDir, moduleName),
                    module: null,
                    enabled: false,
                    status: false,
                    start: null
                };
                // Szablon konfiguracji moodułu
                ModuleObj = Object.assign(ModuleObj, jsonConfig);
                // Dołączenie danych z pliku Json

                if (ModuleObj.enabled) {
                    console.info('Loading module: ' + ModuleObj.name);
                    try {
                        var mod = require(path.resolve(modulesDir, moduleName, ModuleObj.start));
                    } catch (exception) {
                        console.error('ERROR - An error occurred while loading ');
                        console.error(exception);
                    }
                    try {
                        ModuleObj.module = new mod(this.DiscordClient, this.TriggerManager, this);
                        // Inicjalizacja
                        ModuleObj.status = true;
                        // Zmiana statusu
                        this.ModulesList[moduleName] = ModuleObj;
                        // Dodawanie do listy

                    } catch (exception) {
                        console.error('ERROR - An error occurred while loading ');
                        console.error(exception);
                    }
                    console.info('------- Module loaded -------');
                } else {
                    console.info('Module skipped: ' + ModuleObj.name);
                    console.info('-----------------------------');
                }
            }
        });
    }

    reloadModules() {
        this.TriggerManager.RemoveTriggers();
        console.info("Triggers removed");

        Object.keys(this.ModulesList).forEach((key) => {
            console.info("Module removed: " + this.ModulesList[key].name);
            this.removeModule(path.resolve(this.ModulesList[key].path, this.ModulesList[key].start));
        });

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