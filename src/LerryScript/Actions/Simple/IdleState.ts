
import { Bot } from "mineflayer";
import { Action } from "../Action";

export class IdleState extends Action {
    constructor(bot: Bot, errorMsg: string) {
        super(bot, errorMsg);
    }

    onStateEntered(): void {}

    canThrowError(): boolean {
        return false;
    }
}
