import { Action } from "./Action";
import { Bot } from "mineflayer";

export class IdleState extends Action {
    constructor(bot: Bot, errorMsg: string) {
        super(bot, errorMsg);
    }

    onStateEntered(): void {}

    onStateExited(): void {}

    canThrowError(): boolean {
        return false;
    }
}
