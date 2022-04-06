import { Bot } from "mineflayer";
import { Action } from "../Action";

export class IdentityAction extends Action {
    constructor(bot: Bot) {
        super(bot);
    }

    onStateEntered(): void {
        this.setFinished();
    }

    canThrowError(): boolean {
        return false;
    }
}
