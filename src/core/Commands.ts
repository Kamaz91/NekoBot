import * as commands from "@src/EnabledCommands"
import { InteractionManager } from "@core/Bot"

for (let [, command] of Object.entries(commands)) {
    InteractionManager.addGlobalInteraction(command.name, command.execute);
}