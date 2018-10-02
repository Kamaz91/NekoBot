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
            return false;
        }
    }

    MatchInTriggersList(trigger) {
        var len = this.TriggersList.length;
        for (var i = 0; i < len; i++) {
            var x = new RegExp(`^${this.TriggersList[i].activator}(\\s|$)`, "i").exec(trigger)
            if (x != null) {
                let text = x.input.slice(x[0].length).trim();
                return { key: x[0].trim(), raw: x.input, text: text, arguments: text.split(' ') };
            }
        }
        return null;
    };

    CheckTrigger(message) {
        if (!message.author.bot) {
            var match = this.MatchInTriggersList(message.content)
            if (match != null) {
                this.TriggersList.find((element, index, array) => {
                    if (element.activator == match.key) {
                        try {
                            let date = new Date();
                            let t = [
                                `0${date.getHours()}`.slice(-2),   // Godziny
                                `0${date.getMinutes()}`.slice(-2), // Minuty
                                `0${date.getSeconds()}`.slice(-2)  // Sekundy
                            ];
                            console.log(t.join(':'));
                            console.log(element);
                            element.content(message, match);
                            return true;
                        } catch (exception) {
                            return false;
                        }
                    }
                    return false;
                });
            }
        }
    }
}

module.exports = TriggerManager;