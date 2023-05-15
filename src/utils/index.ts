import InteractionBuilder from "./InteractionBuilder";
import ModuleBuilder from "./ModuleBuilder";
import Timer from "./Timer";

function wait(timeout, callback) {
    return new Promise<any>((resolve) => {
        return setTimeout(() => {
            resolve(callback());
        }, timeout);
    });
}

export { InteractionBuilder, ModuleBuilder, Timer, wait }