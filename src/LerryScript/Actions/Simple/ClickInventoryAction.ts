import { Action } from "../Action";
import { Bot } from "mineflayer";
import { MouseButton } from "../../Types/MouseButton";

export class ClickInventoryAction extends Action {
    constructor(bot: Bot,  private button: MouseButton, private slotId: number) {
        super(bot);
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
