import { Vec3 } from "vec3";
import { Bot } from "mineflayer";
import { Action } from "../Action";
import { goals } from "mineflayer-pathfinder";

export class MineBlocksAction extends Action {
    constructor(bot: Bot, private func: (bot: Bot) => Vec3[]) {
        super(bot);
    }

    async onStateEntered() {
        try {
            let positionsToMine = this.func(this.bot);
            for (let pos of positionsToMine) {
                let block = this.bot.blockAt(pos);

                if (!block) {
                    throw new Error("No block at " + pos);
                }

                let targetGoal = new goals.GoalBreakBlock(pos.x, pos.y, pos.z, this.bot);

                await this.bot.pathfinder.goto(targetGoal);

                await this.bot.lookAt(pos, true);

                if (!this.bot.canDigBlock(block)) {
                    throw new Error("Cant dig block " + block);
                }

                await this.bot.dig(block);
            }
            this.setFinished();
        } catch (err: any) {
            this.setError(err);
        }
    }

    canThrowError(): boolean {
        return true;
    }
}
