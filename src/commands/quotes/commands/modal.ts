import { ModalSubmitInteraction } from "discord.js";
import { embedBuildFields, isInteractionCustomIdValid } from "../utility.js";
import InteractionManager from "../../../core/InteractionManager.js";
import Store from "../../../store/quotes.js";

export async function changeTitle(Interaction: ModalSubmitInteraction, id?: string) {
    if (!isInteractionCustomIdValid(id)) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }

    if (!Interaction.inGuild()) {
        InteractionManager.sendInteractionNotExecutable(Interaction);
        return;
    }

    let title = Interaction.fields.getTextInputValue("title")
    let UserData = Store.getElement(id);

    if (UserData) {
        UserData.Quote.title = title;
        UserData.Interaction.editReply({ embeds: [embedBuildFields(UserData.Quote, UserData.Quote.messageLink, Interaction.user.displayAvatarURL({ size: 64 }))] });

        Interaction.reply({ content: "Title Changed to " + title, ephemeral: true });
    }
}