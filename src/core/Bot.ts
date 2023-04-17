import logger from "@includes/logger";
import Client from "@core/Connection";
import EM from "@includes/EventsManager";
import IM from "@includes/InteractionManager"
import { Database } from '@includes/database';
import config from "@includes/config";

var InteractionManager = new IM(Client);
var EventsManager = new EM(Client);

Client.on('ready', () => {
    InteractionManager.setGuilds();
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
    logger.error('Discord error');
    logger.error(error);
    logger.error(error.message);
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

export { Client, config, InteractionManager, EventsManager };