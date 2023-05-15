export default class Timer {
    timer: number | null;
    callback: Function;
    timeout: number;

    constructor(callback: Function, timeout: number) {
        this.timer = setTimeout(callback, timeout);
        this.callback = callback;
        this.timeout = timeout;
    }
    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    start() {
        if (!this.timer) {
            this.stop();
            this.timer = setTimeout(this.callback, this.timeout);
        }
        return this;
    }

    // start with new or original interval, stop current interval
    reset(newT = this.timeout) {
        this.timeout = newT;
        return this.stop().start();
    }
}