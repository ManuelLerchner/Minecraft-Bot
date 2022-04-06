import { Bot } from "mineflayer";
import { Action } from "../Action";

export class CallAction extends Action {
    constructor(bot: Bot, private func: () => void) {
        super(bot);
    }

    onStateEntered(): void {
        this.func();
        this.setFinished();
    }

    canThrowError(): boolean {
        return false;
    }
}
