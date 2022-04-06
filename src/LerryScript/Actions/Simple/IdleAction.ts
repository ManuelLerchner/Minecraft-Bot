
import { Bot } from "mineflayer";
import { Action } from "../Action";

export class IdleAction extends Action {
    constructor(bot: Bot) {
        super(bot);
    }

    onStateEntered(): void {}

    canThrowError(): boolean {
        return false;
    }
}
