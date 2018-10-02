const Discord = require('discord.js');
class BasicTriggers {
    constructor(DiscordClient, TriggerManager, ModuleLoader) {
        this.client = DiscordClient;
        this.ModuleLoader = ModuleLoader;
        this.TriggerManager = TriggerManager;

        TriggerManager.RegisterTrigger({
            moduleName: "BasicTriggers",
            content: (message, trigger) => { message.reply("test") },
            key: "test",
            prefix: "." //optional. if not defined using default prefix
        });
        TriggerManager.RegisterTrigger({
            moduleName: "BasicTriggers",
            content: this.test2,
            key: "test2",
            prefix: "." //optional. if not defined using default prefix
        });
    }
    test2(message, trigger) {
        var a = '';
        var x;
        for (x = 0; x < trigger.arguments.length; x++) {
            a += '[' + x + '] => ' + trigger.arguments[x] + '\n';
        };
        console.log(trigger.arguments);
        var embed = {
            "embed": {
                "color": 0x464442,
                "author": {
                    "name": message.author.username,
                    "icon_url": message.author.avatarURL
                },
                "fields": [
                    {
                        "name": "text",
                        "value": trigger.text
                    },
                    {
                        "name": "key",
                        "value": trigger.key
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
        message.channel.send("test2").catch(console.error);
        message.channel.send(embed).catch(console.error);
    }
}
module.exports = BasicTriggers;