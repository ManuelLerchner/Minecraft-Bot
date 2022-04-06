import { Vec3 } from "vec3";
import { Bot } from "mineflayer";
import { Action } from "../Action";
import { goals } from "mineflayer-pathfinder";

export class WalkOverAreaAction extends Action {
    goals: goals.Goal[] = [];
    constructor(bot: Bot, private corner1: Vec3, private corner2: Vec3) {
        super(bot);

        let blocksToCover = this.calculatePath();

        for (let pos of blocksToCover) {
            this.goals.push(new goals.GoalBlock(pos.x, pos.y, pos.z));
        }
    }

    async onStateEntered() {
        try {
            for (let goal of this.goals) {
                await this.bot.pathfinder.goto(goal, () => {});
            }

            this.setFinished();
        } catch (err: any) {
            console.log(err);
            this.setError(err);
        }
    }

    calculatePath() {
        let x1 = Math.min(this.corner1.x, this.corner2.x);
        let x2 = Math.max(this.corner1.x, this.corner2.x);

        let y1 = Math.min(this.corner1.y, this.corner2.y);
        let y2 = Math.max(this.corner1.y, this.corner2.y);

        let z1 = Math.min(this.corner1.z, this.corner2.z);
        let z2 = Math.max(this.corner1.z, this.corner2.z);

        let positionsToCover = [];

        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                positionsToCover.push(new Vec3(x, y, z1));
                positionsToCover.push(new Vec3(x, y, z2));

                let tmp = z1;
                z1 = z2;
                z2 = tmp;
            }
        }

        return positionsToCover;
    }

    canThrowError(): boolean {
        return true;
    }
}
