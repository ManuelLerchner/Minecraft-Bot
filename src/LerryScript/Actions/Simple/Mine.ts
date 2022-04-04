
import { Vec3 } from "vec3";
import { Bot } from "mineflayer";
import { Action } from "../Action";

export class Mine extends Action {
    constructor(bot: Bot, name: string, private pos: Vec3) {
        super(bot, name);
    }

    async onStateEntered() {
        await this.bot.lookAt(this.pos, true);

        let block = this.bot.blockAt(this.pos);

        if (!block) {
            this.setError(new Error("No block found at " + this.pos));
            return;
        }

        if (!this.bot.canDigBlock(block)) {
            this.setError(new Error("Can't dig block at " + this.pos));
            return;
        }

        try {
            await this.bot.dig(block);
            this.setFinished();
        } catch (err: any) {
            this.setError(err);
        }
    }

    canThrowError(): boolean {
        return true;
    }
}
