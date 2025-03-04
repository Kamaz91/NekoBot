import { EventEmitter } from "events";
import { QuoteData } from "../types/quotes.js";

class QuoteStore<T extends QuoteData> extends EventEmitter {
    private Storage: Map<string, T>;
    private Timeouts: Map<string, ReturnType<typeof setTimeout>>

    constructor() {
        super();
        this.Storage = new Map();
        this.Timeouts = new Map();
    }
    addElement(id: string, data: T, timeout?: number) {
        if (this.Storage.has(id)) {
            throw `Element with id:${id} exist`;
        }

        this.Storage.set(id, data);

        if (timeout) {
            this.setTimer(id, timeout);
        }
    }
    editElement(id: string, data: T) {
        if (!this.Storage.has(id)) {
            throw `Element with id:${id} not exist`;
        }
        this.Storage.set(id, data);
    }
    getElement(id: string): T | undefined {
        if (!this.Storage.has(id)) {
            throw `Element with id:${id} not exist`;
        }
        return this.Storage.get(id);
    }
    getElementsIdByUser(userId: string): string[] {
        let elements: string[] = [];
        for (let [_id, data] of this.Storage) {
            if (data.userId == userId) {
                elements.push(data.Id);
            }
        }
        return elements;
    }
    getElementByUserAndGuild(userId: string, guildId: string): T | undefined {
        for (let [_id, data] of this.Storage) {
            if (data.userId == userId && data.guildId == guildId) {
                return data;
            }
        }
        return undefined;
    }
    removeElement(id: string) {
        if (!this.Storage.has(id)) {
            throw `Element with id:${id} not exist`;
        }
        this.Storage.delete(id);
    }
    resetTimer(id: string, timeout: number) {
        if (!this.Timeouts.has(id)) {
            throw "Cannot reset, Timeout not exist id:" + id;
        }
        clearTimeout(this.Timeouts.get(id));
        this.setTimer(id, timeout);
    }
    setTimer(id: string, timeout: number) {
        if (this.Timeouts.has(id)) {
            throw "Timeout is already set for id:" + id;
        }
        if (!this.Storage.has(id)) {
            throw "Cannot set Timeout element not exist id:" + id;
        }

        let timer = setTimeout(() => {
            this.emit("timeout", { elementId: id, data: this.Storage.get(id) });
            this.Storage.delete(id);
        }, timeout);
        this.Timeouts.set(id, timer);
    }
}

var Store = new QuoteStore();

export default Store;