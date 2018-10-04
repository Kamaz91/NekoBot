class TriggerManager {
    constructor(client) {
        this.client = client;
        this.TriggersList = [];
        this.TriggerDefaultPrefix = "!";

        this.client.on('message', message => {
            this.CheckTrigger(message);
        });
    }

    RegisterTrigger(trigger) {
        if (trigger.content != null && trigger.key != null) {
            // szablon obiektu wyzwalacza
            var temp = {
                moduleName: null,
                activator: null,
                key: null,
                desc: null,
                subTrigger: null,
                content: null,
                prefix: this.TriggerDefaultPrefix
            }
            // łączenie obiektów
            var x = Object.assign(temp, trigger);
            // tworzenie aktywatora
            x.activator = x.prefix + x.key;
            //
            this.TriggersList.push(x);
            console.log("Registered trigger: " + x.activator);
            return true;
        } else {
            console.log("Cannot registered trigger: " + trigger.key + " Content:" + trigger.content);
            return false;
        }
    }


    MatchInTriggersList(trigger, triggersList) {
        for (var i = 0; i < triggersList.length; i++) {
            var x = new RegExp(`^${triggersList[i].activator}(\\s|$)`, "i").exec(trigger)
            if (x != null) {
                let text = x.input.slice(x[0].length).trim();
                return { key: x[0].trim(), subKey: null, raw: x.input, text: text, arguments: text.split(' ') };
            }
        }
        return null;
    };

    CheckTrigger(message) {
        if (!message.author.bot) {
            var triggerMatch = this.MatchInTriggersList(message.content, this.TriggersList)
            if (triggerMatch != null) {
                this.TriggersList.find((element, index, array) => {
                    if (element.activator == triggerMatch.key) {
                        if (element.subTrigger != null && triggerMatch.arguments.length > 0) {
                            var subTriggerMatch = this.MatchInTriggersList(triggerMatch.text, element.subTrigger)
                            if (subTriggerMatch != null) {
                                return element.subTrigger.find((element, index, array) => {
                                    try {
                                        if (subTriggerMatch.key == element.activator) {
                                            triggerMatch.subKey = subTriggerMatch.key;
                                            triggerMatch.text = subTriggerMatch.text;
                                            triggerMatch.arguments = subTriggerMatch.arguments;

                                            element.content(message, triggerMatch);
                                            return true;
                                        }
                                    } catch (exception) {
                                        console.log(exception);
                                        return false;
                                    }
                                });
                            }
                        }
                        try {
                            element.content(message, triggerMatch);
                            return true;
                        } catch (exception) {
                            console.log(exception);
                            return false;
                        }
                    }
                    return false;
                });
            }
        }
        return false;
    }
}

module.exports = TriggerManager;