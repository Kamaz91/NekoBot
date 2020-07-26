class TriggerManager {
    constructor(client) {
        this.client = client;
        this.TriggersList = [];
        this.TriggerDefaultPrefix = "!";

        this.client.on('message', message => {
            this.CheckTrigger(message);
        });
    }

    RegisterTrigger(data) {
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
        var trigger = Object.assign(temp, data);
        trigger.activator = trigger.prefix + trigger.key;

        if (trigger.content != null && trigger.key != null && this.IsTriggerExist(trigger.activator) == false) {
            this.TriggersList.push(trigger);
            console.info("Registered trigger: " + trigger.activator);
            return true;
        } else {
            console.warn("Cannot register trigger: " + trigger.key + " Content:" + trigger.content);
            return false;
        }
    }

    IsTriggerExist(activator) {
        if (this.TriggersList.find((element, index) => {
                if (element.activator == activator) {
                    return true;
                }
            })) return true;
        else return false
    }

    IsTriggersExist(ModuleName) {
        var i = 0;
        this.TriggersList.find((element, index) => {
            if (element.moduleName == ModuleName) {
                i++
            }
        });
        return i;
    }

    GetTriggerByKey(Key) {
        var x = null;
        x = this.TriggersList.find((element, index) => {
            if (element.key == Key) {
                return element;
            }
        });
        return x;
    }

    GetTriggerByActivator(activator) {
        var x = null;
        x = this.TriggersList.find((element, index) => {
            if (element.activator == activator) {
                return element;
            }
        });
        return x;
    }

    GetTriggersByModuleName(ModuleName) {
        var elements = [];
        this.TriggersList.find((element, index) => {
            if (element.ModuleName == ModuleName) {
                elements.push(element);
            }
        });
        return elements;
    }

    GetTriggers(ModuleName) {
        return this.TriggersList;
    }

    RemoveTriggers() {
        this.TriggersList = [];
    }

    RemoveTriggersByModule(moduleName) {
        var i = 0;
        this.TriggersList.find((element, index) => {
            if (element.moduleName == moduleName) {
                this.triggersList.splice(index, 1);
                i++
            }
        });
        return i;
    }

    RemoveTriggerByActivator(Activator) {
        return this.TriggersList.find((element, index) => {
            if (element.Activator == Activator) {
                this.triggersList.splice(index, 1);
                return true;
            }
        });
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
                                        console.error(exception);
                                        return false;
                                    }
                                });
                            }
                        }
                        try {
                            element.content(message, triggerMatch);
                            return true;
                        } catch (exception) {
                            console.error(exception);
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