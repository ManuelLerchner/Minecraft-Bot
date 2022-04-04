import { Action } from "./Action";
import { Bot} from "mineflayer";

export class Identity extends Action {
    constructor(bot: Bot, name: string) {
        super(bot, name);
        this.setFinished();
    }

    onStateEntered(): void {}

    onStateExited(): void {}

    canThrowError(): boolean {
        return false;
    }
}
