const Discord = require('discord.js');
class BasicTriggers {
    constructor(DiscordClient, TriggerManager, ModuleLoader) {
        this.client = DiscordClient;
        this.ModuleLoader = ModuleLoader;
        this.TriggerManager = TriggerManager;

        TriggerManager.RegisterTrigger({
            moduleName: "BasicTriggers",
            desc: "",
            content: (message, trigger) => { message.reply("test") },
            key: "test1",
            prefix: "." //optional. if not defined using default prefix
        });
        TriggerManager.RegisterTrigger({
            moduleName: "BasicTriggers",
            desc: "",
            content: (message, trigger) => { this.embed(message, trigger) },
            key: "test2",
            prefix: "." //optional. if not defined using default prefix
        });
        TriggerManager.RegisterTrigger({
            moduleName: "BasicTriggers",
            desc: "",
            content: null,
            key: "invalid1",
            prefix: "." //optional. if not defined using default prefix
        });
        TriggerManager.RegisterTrigger({
            moduleName: "BasicTriggers",
            desc: "",
            content: null,
            key: "",
            prefix: "." //optional. if not defined using default prefix
        });
        TriggerManager.RegisterTrigger({
            moduleName: "BasicTriggers",
            content: (message, trigger) => { this.embed(message, trigger) },
            key: "subtest1",
            subTrigger: [
                {
                    activator: "t1",
                    desc: "",
                    content: (message, trigger) => { this.embed(message, trigger) }
                },
                {
                    activator: "t2",
                    desc: "",
                    content: (message, trigger) => { message.channel.send(trigger.subKey) }
                }
            ],
            prefix: "." //optional. if not defined using default prefix
        });
    }
    embed(message, trigger) {
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
module.exports = BasicTriggers;