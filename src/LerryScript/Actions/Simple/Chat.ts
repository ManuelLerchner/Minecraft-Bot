import { Action } from "../Action";
import { Bot } from "mineflayer";

export class Chat extends Action {
    constructor(bot: Bot, name: string, private message: string) {
        super(bot, name);
    }

    onStateEntered(): void {
        this.bot.chat(this.message);
        this.setFinished();
    }

    canThrowError(): boolean {
        return false;
    }
}
