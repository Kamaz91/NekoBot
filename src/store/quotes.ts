import { QuoteData } from "../types/quotes.js";
import { Store } from "../includes/Store.class.js";

class QuoteStore extends Store<QuoteData> {
    declare Storage: Map<string, QuoteData>;
    declare Timeouts: Map<string, ReturnType<typeof setTimeout>>;

    constructor() {
        super();
    }

    getElementsIdByUser(userId: string): string[] {
        let elements: string[] = [];
        for (let [_id, data] of this.Storage) {
            if (data.userId == userId) {
                elements.push(data.Id);
            }
        }
        return elements;
    }
    getElementByUserAndGuild(userId: string, guildId: string): QuoteData | undefined {
        for (let [_id, data] of this.Storage) {
            if (data.userId == userId && data.guildId == guildId) {
                return data;
            }
        }
        return undefined;
    }
}

var Storage = new QuoteStore();
export default Storage;