import { Action } from "../Action";
import { Bot } from "mineflayer";
import { MouseClick } from "../../Types/MouseClick";

export class ClickInventory extends Action {
    constructor(bot: Bot, name: string, private button: MouseClick, private slotId: number) {
        super(bot, name);
    }

    async onStateEntered() {
        if (this.button === "left") {
            await this.bot.simpleClick.leftMouse(this.slotId);
        } else if (this.button === "right") {
            await this.bot.simpleClick.rightMouse(this.slotId);
        }

        this.setFinished();
    }

    canThrowError(): boolean {
        return false;
    }
}
