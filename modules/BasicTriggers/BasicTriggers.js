class BasicTriggers {
    constructor(DiscordClient, triggerManager) {
        triggerManager.addTrigger({
            name: "xx",
            content: "lol",
            prefix: "!" //optional. if not defined using default prefix
        });
    }
}
module.exports = BasicTriggers;