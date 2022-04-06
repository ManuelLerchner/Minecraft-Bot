import { Action } from "../Action";
import { Bot } from "mineflayer";

export class ActivateHotbarIconAction extends Action {
    constructor(bot: Bot, private hotbarIdx: number) {
        super(bot);
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
