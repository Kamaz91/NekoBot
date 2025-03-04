import ModuleBuilder from "./ModuleBuilder.js";
import Timer from "./Timer.js";

function wait(timeout, callback?) {
    return new Promise<any>((resolve) => {
        return setTimeout(() => {
            callback ? resolve(callback()) : resolve(true);
        }, timeout);
    });
}

function errorLog(logger, text, error) {
    logger.error(text);
    logger.error(JSON.stringify(error));
}

export { ModuleBuilder, Timer, wait, errorLog };