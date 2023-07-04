import logger from "@includes/logger";
import Client from "@core/Connection";
import { Database, Disconnect } from '@includes/database';

import ModuleManager from "@core/ModuleManager";
import "@core/EventsManager";
import "@core/InteractionManager"

import Config from "@core/Config";

import "@src/EnabledModules";
import "@src/EnabledCommands";

Client.on('ready', () => {
    ModuleManager.setConfigReadyListener(Config);
    logger.info('Connected!');
});
Client.on('reconnecting', function () {
    logger.info('reconnecting');
});
Client.on('disconnect', closeEvent => {
    logger.info('************');
    logger.info('End of Session');
});
Client.on('error', error => {
    console.log(error);
    logger.error('Discord error');
    logger.error(error);
});
Client.on('debug', message => {
    logger.debug(message);
});

process.on("SIGINT", () => {
    logger.info("Caught SIGINT.");
    Disconnect();
    Client.destroy();
});
/*client.on('message', message => {
    var guildchan = '';
    if (message.guild && message.channel) {
        guildchan = ` @ ${message.guild.name} -> #${message.channel.name}`;
    }

    logger.info(`${message.author.username + guildchan}: ${message.content}`);
});*/

export async function login() {
    var token = await GetToken();
    Client.login(token);
}

async function GetToken() {
    var query = await Database()
        .from("api_tokens")
        .select("*")
        .where({ token_type: "discord" })
        .first();

    if (!query) {
        logger.error("Cant login to discord");
        logger.error(">token is empty");
        throw new Error("Database Query Error");
    }
    return query.token;
}

export { Client };