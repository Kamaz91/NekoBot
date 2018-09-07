const modulesDir = './modules/';
const fs = require('fs');

class ModulesLoader {

    constructor(DiscordClient, TriggerManager) {
        this.DiscordClient = DiscordClient;
        this.TriggerManager = TriggerManager;
        this.ModulesList = {};
    }
    loadModules() {
        var ModuleObj = {};
        fs.readdirSync(modulesDir).forEach(moduleName => {
            // Przeszukiwanie folderu modułów
            var jsonPath = modulesDir + moduleName + '/config.json';
            if (fs.existsSync(jsonPath)) {
                var Config = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                // Ładowanie konfiguracji modułu
                var date = new Date();
                var messageTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
                // Czas systemu hh:mm:ss
                ModuleObj = Config
                ModuleObj.path = modulesDir + moduleName;
                this.ModulesList[moduleName] = ModuleObj;

                if (moduleOpts.status) {
                    try {
                        console.log(messageTime + ' Ładowanie modułu: ' + ModuleObj.name);
                        let mod = require(modulesDir + moduleName + "/" + moduleName + ".js");
                        ModuleObj.module = new mod(this.DiscordClient, this.TriggerManager);
                        console.log('   - Załadowano moduł');
                    } catch (exception) {
                        console.log('   - Wystąpił błąd Podczas ładowania ');
                        console.log(exception);
                    }
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