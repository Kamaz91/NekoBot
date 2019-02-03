const Discord = require('discord.js');
const Cfg = require('../../includes/Config.js');
class BasicTriggers {
    constructor(DiscordClient, TriggerManager, ModuleLoader) {
        this.Client = DiscordClient;
        this.ModuleLoader = ModuleLoader;
        this.TriggerManager = TriggerManager;
        this.Activity = {
            text: "NekoBot get some .help",
            options: { type: "LISTENING" }
        };

        this.Client.on('ready', () => {
            this.Client.user.setActivity(this.Activity.text, this.Activity.options.type);
        });

        TriggerManager.RegisterTrigger({
            moduleName: "Fun",
            desc: "chrzan",
            content: (message, trigger) => { message.reply("je chrzan") },
            key: "chrzan",
            prefix: "!" //optional. if not defined using default prefix
        });
        TriggerManager.RegisterTrigger({
            moduleName: "Fun",
            desc: "x",
            content: (message, trigger) => { this.pisz(message, trigger) },
            key: "pisz",
            prefix: "!" //optional. if not defined using default prefix
        });
        TriggerManager.RegisterTrigger({
            moduleName: "Fun",
            desc: "x",
            content: (message, trigger) => { this.avatar(message, trigger) },
            key: "avatar",
            prefix: "!" //optional. if not defined using default prefix
        });
        TriggerManager.RegisterTrigger({
            moduleName: "BasicTriggers",
            desc: "x",
            content: (message, trigger) => { this.setActivity(message, trigger) },
            key: "activity",
            prefix: "!" //optional. if not defined using default prefix
        });
        TriggerManager.RegisterTrigger({
            moduleName: "BasicTriggers",
            desc: "dev",
            content: (message, trigger) => { this.embed(message, trigger) },
            key: "devtools",
            prefix: "!" //optional. if not defined using default prefix
        });
        TriggerManager.RegisterTrigger({
            moduleName: "BasicTriggers",
            content: (message, trigger) => { this.showTriggers(message, trigger) },
            key: "help",
            desc: "i'm helping",
            subTrigger: [{
                    activator: "get",
                    desc: "x",
                    content: (message, trigger) => { this.showTrigger(message, trigger); }
                },
                {
                    activator: "all",
                    desc: "x",
                    content: (message, trigger) => { this.showTriggers(message, trigger) }
                }
            ],
            prefix: "." //optional. if not defined using default prefix
        });
    }

    showTrigger(message, trigger) {
        if (this.TriggerManager.IsTriggerExist(trigger.arguments[0])) {
            var trig = this.TriggerManager.GetTriggerByActivator(trigger.arguments[0]);

            var embed = {
                "embed": {
                    "color": 0x464442,
                    "author": {
                        "name": message.author.username,
                        "icon_url": message.author.avatarURL
                    },
                    "fields": [{
                            "name": "moduleName",
                            "value": trig.moduleName
                        },
                        {
                            "name": "key",
                            "value": trig.key
                        },
                        {
                            "name": "prefix",
                            "value": trig.prefix
                        },
                        {
                            "name": "activator",
                            "value": trig.activator
                        },
                        {
                            "name": "description",
                            "value": trig.desc
                        }
                    ]
                }
            };
            message.channel.send(embed);
        } else {
            message.channel.send(`Trigger: ${trigger.arguments[0]}, not found`);
        }
    }

    showTriggers(message, trigger) {
        var trigers = this.TriggerManager.GetTriggers();
        var fields = new Array();
        var moduletrigs = {};
        for (var i in trigers) {
            if (moduletrigs[trigers[i].moduleName] === undefined) {
                moduletrigs[trigers[i].moduleName] = [];
            }
            moduletrigs[trigers[i].moduleName].push(trigers[i].activator);
        }
        for (var i in moduletrigs) {
            fields.push({ name: i, value: moduletrigs[i].join(', ') });
        }

        var embed = {
            "embed": {
                "color": 0x464442,
                "author": {
                    "name": message.author.username,
                    "icon_url": message.author.avatarURL
                },
                "fields": fields
            }
        };
        message.channel.send(embed);
    }

    embed(message, trigger) {
        if (message.author.id === new Cfg().adminId) {
            var a = '';
            var x;
            for (x in trigger.arguments) {
                a += '[' + x + '] => ' + trigger.arguments[x] + '\n';
            };

            if (a == null || a.length == 0) a = 'nothing';
            if (trigger.text == null || trigger.text.length == 0) trigger.text = 'nothing';
            if (trigger.subKey == null) trigger.subKey = 'nothing';

            var embed = {
                "embed": {
                    "color": 0x464442,
                    "author": {
                        "name": message.author.username,
                        "icon_url": message.author.avatarURL
                    },
                    "fields": [{
                            "name": "text",
                            "value": trigger.text
                        },
                        {
                            "name": "key",
                            "value": trigger.key
                        },
                        {
                            "name": "subKey",
                            "value": trigger.subKey
                        },
                        {
                            "name": "Raw",
                            "value": trigger.raw
                        },
                        {
                            "name": "arguments",
                            "value": a
                        }
                    ]
                }
            };
            message.channel.send(embed).catch(console.error);
        }
    }

    setActivity(message, trigger) {
        if (message.author.id === new Cfg().adminId) {
            if (trigger.text.length > 1) {
                switch (trigger.arguments[0]) {
                    case "ST":
                        var options = { type: "STREAMING", url: trigger.arguments[1] };
                        var text = trigger.text.substr(trigger.arguments[1].length + 3).trim();
                        break;
                    case "LS":
                        var options = { type: "LISTENING" };
                        var text = trigger.text.substr(trigger.arguments[0].length).trim();
                        break;
                    case "WT":
                        var options = { type: "WATCHING" };
                        var text = trigger.text.substr(trigger.arguments[0].length).trim();
                        break;
                    default:
                        var options = { type: "PLAYING" };
                        var text = trigger.text;
                        break;
                }
                this.Client.user.setActivity(text, options);
                this.Activity = { text: text, options: options };
            } else {
                this.Client.user.setActivity();
                this.Activity = null;
            }
        }
    }

    avatar(message, trigger) {
        if (trigger.text.length == 0) {
            message.channel.send(message.author.displayAvatarURL);
        } else {
            if (message.channel.type !== "dm") {
                var guildMember = message.guild.members.get(trigger.arguments[0].replace(/<|!|>|@/gi, ''));
                if (guildMember) {
                    message.channel.send(guildMember.user.displayAvatarURL);
                } else {
                    message.reply("User not found");
                }
            } else {
                message.reply("You can not search users by DM");
            }
        }
    }

    pisz(message, trigger) {

        // Alfabet pasujących znaków
        var alfafbet = 'abcdefghijklmnopqrstuvwxyz';
        // Budowanie stringa 
        var stringBuild = '';
        // Iteracja pojedyńczych znaków w stringu
        for (var val of trigger.text) {

            // Pojedyńczy znak zmieniany na mały
            var char = val.toString().toLocaleLowerCase();
            // Zamiana polskich znaków na zwykłe
            switch (char) {
                case 'ą':
                    char = 'a';
                    break;
                case 'ę':
                    char = 'e';
                    break;
                case 'ć':
                    char = 'c';
                    break;
                case 'ł':
                    char = 'l';
                    break;
                case 'ń':
                    char = 'n';
                    break;
                case 'ó':
                    char = 'o';
                    break;
                case 'ś':
                    char = 's';
                    break;
                case 'ż':
                    char = 'z';
                    break;
                case 'ź':
                    char = 'z';
                    break;
            }
            // Jeśli znak jest w alfabecie
            if (alfafbet.indexOf(char) > -1) {
                stringBuild += ':regional_indicator_' + char.toString() + ':';
            } else
            // Jeśli znak jest pytajnikiem 
            if ('?' === char) {
                stringBuild += ':grey_question:';
            } else
            // Jeśli znak jest wykrzynikiem
            if ('!' === char) {
                stringBuild += ':grey_exclamation:';
            } else
            // Jeśli znak jest odstępem podwójna spacja
            if (' ' === char) {
                stringBuild += '  ';
            } else {
                stringBuild += char;
            }
            //console.log(val);
        }
        // Wysłanie wiadomości do kanału/użytkownika
        message.channel.send(stringBuild);

        // Kasowanie wiadomości aktywującej
        if (message.deletable) {
            message.delete()
                .catch(console.error);
        } else {
            console.log("cant delete message, no permissions");
        }
    }
}
module.exports = BasicTriggers;