import { Action } from "../Action";
import { Bot } from "mineflayer";

export class ActivateHotbarIcon extends Action {
    constructor(bot: Bot, name: string, private hotbarIdx: number) {
        super(bot, name);
    }

    async onStateEntered() {
        this.bot.setQuickBarSlot(this.hotbarIdx);
        this.bot.activateItem();

        this.setFinished();
    }

    canThrowError(): boolean {
        return false;
    }
}
