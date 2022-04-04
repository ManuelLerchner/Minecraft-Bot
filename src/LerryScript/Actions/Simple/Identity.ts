
import { Bot } from "mineflayer";
import { Action } from "../Action";

export class Identity extends Action {
    constructor(bot: Bot, name: string) {
        super(bot, name);
    }

    onStateEntered(): void {
        this.setFinished();
    }

    canThrowError(): boolean {
        return false;
    }
}
