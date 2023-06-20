import InteractionBuilder from "./InteractionBuilder";
import ModuleBuilder from "./ModuleBuilder";
import Timer from "./Timer";

function wait(timeout, callback?) {
    return new Promise<any>((resolve) => {
        return setTimeout(() => {
            callback ? resolve(callback()) : resolve(true);
        }, timeout);
    });
}

export { InteractionBuilder, ModuleBuilder, Timer, wait };