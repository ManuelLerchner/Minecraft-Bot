import { Action } from "./Action";
import { StateBehavior } from "mineflayer-statemachine";
import { Vec3 } from "vec3";
import { Bot, Chest, Player } from "mineflayer";

import { Movements, goals } from "mineflayer-pathfinder";

export class GoTo extends Action {
    goal: goals.GoalXZ;
    constructor(bot: Bot, name: string, pos: Vec3) {
        super(bot, name);
        this.goal = new goals.GoalXZ(pos.x, pos.z);
    }

    async onStateEntered() {
        try {
            await this.bot.pathfinder.goto(this.goal, () => {});
            this.setFinished();
        } catch (err: any) {
            this.setError(err);
        }
    }

    onStateExited(): void {
        this.reset();
    }

    canThrowError(): boolean {
        return true;
    }
}
