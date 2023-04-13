import { Client, Events, Snowflake } from "discord.js";
import logger from "@includes/logger";

export default class InteractionManager {

    public Client: Client;
    private Interactions: {
        global: Map<String, Function>
        guild: Map<Snowflake, Map<string, Function>>
    }

    constructor(Client: Client) {
        this.Client = Client;
        this.Interactions = {
            global: new Map(),
            guild: new Map()
        }

        Client.on(Events.InteractionCreate, async (interaction) => {
            try {
                if (interaction.isCommand() ||
                    interaction.isContextMenuCommand() ||
                    interaction.isUserContextMenuCommand() ||
                    interaction.isChatInputCommand()) {

                    var commandName = interaction.commandName;
                    var action: Function;

                    // Local Interactions
                    if (interaction.inGuild()) {
                        let Guild = this.Interactions.guild.get(interaction.guildId);
                        if (Guild.has(commandName)) {
                            action = Guild.get(commandName);
                        }
                    }
                    // If local action have same same name as global it will be overwritten by global
                    action = this.Interactions.global.get(commandName);
                    action(interaction);
                }
            } catch (error) {
                logger.error(error);
            }
        });
    }
    
    async setGuilds() {
        let guilds = (await this.Client.guilds.fetch()).keys();
        for (const key of guilds) {
            this.Interactions.guild.set(key, new Map());
        }
    }

    addGlobalInteraction(name: string, execute: Function) {
        this.Interactions.global.set(name.toLocaleLowerCase(), execute);
    }

    addGuildInteraction(name: string, guildId: string, execute: Function) {
        let Guild = this.Interactions.guild.get(guildId);
        Guild.set(name.toLocaleLowerCase(), execute);
    }

    getInteractions() {
        return this.Interactions;
    }
}