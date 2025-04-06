import { ChatInputCommandInteraction } from "discord.js";

export async function mainCommand(interaction: ChatInputCommandInteraction) {
    let client = interaction.client;
    const interactionCreatedAt = interaction.createdAt.getTime();
    const botInteractionInterception = new Date().getTime();
    const ping = botInteractionInterception - interactionCreatedAt;

    let replied = await interaction.reply({
        embeds: [
            {
                title: "Ping!",
                description: `Interaction created at: ${new Date(interactionCreatedAt).toISOString()}\nPing:${ping}ms`,
                color: 0x00ff00
            }
        ]
    });
    replied.createdAt.getTime();
    const botInteractionInterception2 = new Date().getTime();
    const ping2 = botInteractionInterception2 - replied.createdAt.getTime();

    await interaction.followUp({
        embeds: [
            {
                title: "Pong!",
                description: `Interaction created at: ${new Date(interactionCreatedAt).toDateString()}\nPing:${ping}ms\n`,
                color: 0x00ff00
            }
        ]
    });
}