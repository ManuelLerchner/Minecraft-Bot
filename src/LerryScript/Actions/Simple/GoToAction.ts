import { Vec3 } from "vec3";
import { Bot } from "mineflayer";

import { Action } from "../Action";
import { goals } from "mineflayer-pathfinder";

export class GoToAction extends Action {
    goal: goals.GoalBlock;

    constructor(bot: Bot, pos: Vec3) {
        super(bot);
        this.goal = new goals.GoalBlock(pos.x, pos.y, pos.z);
    }

    async onStateEntered() {
        try {
            await this.bot.pathfinder.goto(this.goal, () => {});
            this.setFinished();
        } catch (err: any) {
            this.setError(err);
        }
    }

    canThrowError(): boolean {
        return true;
    }
}
