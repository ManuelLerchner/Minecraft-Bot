import { Action } from "./Action";
import { Bot } from "mineflayer";

export class Function extends Action {
    constructor(bot: Bot, name: string, private func: () => void) {
        super(bot, name);
    }

    onStateEntered(): void {
        this.func();
        this.setFinished();
    }

    onStateExited(): void {
        this.reset();
    }

    canThrowError(): boolean {
        return false;
    }
}
