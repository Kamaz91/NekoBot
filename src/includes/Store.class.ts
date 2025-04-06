import { EventEmitter } from "events";

export class Store<T> extends EventEmitter {
    public Storage: Map<string, T> = new Map();
    public Timeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

    constructor() {
        super();
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