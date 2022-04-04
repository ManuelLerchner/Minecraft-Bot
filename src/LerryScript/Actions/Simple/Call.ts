import { Bot } from "mineflayer";
import { Action } from "../Action";

export class Call extends Action {
    constructor(bot: Bot, name: string, private func: () => void) {
        super(bot, name);
    }

    onStateEntered(): void {
        this.func();
        this.setFinished();
    }

    canThrowError(): boolean {
        return false;
    }
}
