import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, SnowflakeUtil } from "discord.js";
import { InteractionBuilder } from "@src/utils";
import InteractionManager from "@core/InteractionManager";

interface Player {
    user: string | null;
    option: number | null;
}

/*const
    ROCK = formatEmoji('1054889270642483301'),
    PAPER = formatEmoji('1054890020999278622'),
    SCISSORS = formatEmoji('1054890020999278622');*/

function getWinner(Players: Map<string, Player>): string | null {
    // Players Map to Array
    const player1 = [...Players][0];
    const player2 = [...Players][1];

    if ((player1[1].option + 1) % 3 == player2[1].option)
        // PLAYER 2 WIN
        return player2[1].user;
    else if (player1[1].option == player2[1].option)
        // TIE
        return null;
    else
        // PLAYER 1 WIN
        return player1[1].user;
}

function allPlayersChose(players: Map<string, Player>) {
    for (const [, player] of players) {
        if (player.option == null)
            return false;
    }
    return true;
}

async function execute(interaction: CommandInteraction) {
    const rockid = SnowflakeUtil.generate().toString();
    const paperid = SnowflakeUtil.generate().toString();
    const scissorsid = SnowflakeUtil.generate().toString();
    const type = ["Rock", "Paper", "Scissors"];
    const ids = [rockid, paperid, scissorsid];

    var players: Map<string, Player> = new Map();

    players.set(interaction.user.id, { user: null, option: null });
    for (const option of interaction.options.data) {
        if (option.user.id == interaction.user.id) {
            interaction.reply({ content: "You cant battle yourself", ephemeral: true });
            return;
        }
        players.set(option.user.id, { user: null, option: null });
    }

    const filter = (i) => ids.indexOf(i.customId) >= 0 && players.has(i.user.id);
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 1000 * 60 * 5 });

    collector.on('collect', async (i: ButtonInteraction) => {
        let selection = ids.indexOf(i.customId);

        await i.deferUpdate();
        await i.editReply({ content: 'A PLAYER clicked!' });
        players.set(i.user.id, { user: i.user.username, option: selection });
        if (allPlayersChose(players)) {
            // Send end event
            collector.stop();
        }
    });

    collector.on('end', (collected: Map<string, ButtonInteraction>) => {
        if (allPlayersChose(players)) {
            var string: string = "";
            for (const [, player] of players) {
                string += `${player.user} choose ${type[player.option]}\n`;
            }
            let winner = getWinner(players);
            if (winner == null) {
                interaction.editReply({ content: 'There is a tie!\n' + string, components: null });
            } else {
                interaction.editReply({ content: `${winner} is Winner\n` + string, components: null });
            }
        } else {
            interaction.editReply({ content: 'Other player not respond', components: null });
        }
    });

    var row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            [
                new ButtonBuilder()
                    .setCustomId(rockid)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("ROCK"),
                new ButtonBuilder()
                    .setCustomId(paperid)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("PAPER"),
                new ButtonBuilder()
                    .setCustomId(scissorsid)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("SCISSORS")
            ]
        );
    interaction.reply({ content: "", components: [row] });
}

const name = "rock";
const Command = new InteractionBuilder(name)
    .setExecute(execute)
    .SlashCommand("infinite");

InteractionManager.addGlobalInteraction(Command); 