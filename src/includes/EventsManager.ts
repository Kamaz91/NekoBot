import logger from "@includes/logger";
import { Client, Events } from "discord.js";

export default class EventsManager {

    private Client: Client;
    private Events: Map<string, Array<Function>>;

    constructor(Client) {
        this.Client = Client;
        this.Events = new Map();

        this.setEventListeners();
    }

    private setEventListeners() {
        for (const [, eventName] of Object.entries(Events)) {

            logger.info("Set event listener:" + eventName);

            this.Events.set(eventName, new Array());
            this.Client.on(eventName.toString(), (...args) => {
                this.doEventTasks(eventName, args)
            });
        }
    }

    private doEventTasks(eventName, args) {
        let functions = this.Events.get(eventName);
        // if empty do nothing
        if (functions.length < 0)
            return;
        for (const execute of functions) {
            execute(...args);
        }
    }

    public addEventTask(Events: Events | Events[], newTask: Function) {
        if (typeof Events !== "object") {
            var arr = new Array();
            arr.push(Events);
            Events = arr;
        }

        for (const name of Events) {
            if (this.Events.has(name)) {
                let tasks = this.Events.get(name);
                tasks.push(newTask);
            } else {
                logger.error("Event:" + name + " doesn't exists");
            }
        }
    }
}