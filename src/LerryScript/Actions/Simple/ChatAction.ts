import { Action } from "../Action";
import { Bot } from "mineflayer";

export class ChatAction extends Action {
    constructor(bot: Bot, private message: string) {
        super(bot);
    }

    onStateEntered(): void {
        this.bot.chat(this.message);
        this.setFinished();
    }

    canThrowError(): boolean {
        return false;
    }
}
