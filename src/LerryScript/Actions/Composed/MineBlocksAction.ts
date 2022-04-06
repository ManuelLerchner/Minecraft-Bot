import { Vec3 } from "vec3";
import { Bot } from "mineflayer";
import { Action } from "../Action";
import { goals } from "mineflayer-pathfinder";
import { EquipTask } from "../../Types/EquipTask";
import { mcData } from "../../Settings";

export class MineBlocksAction extends Action {
    constructor(bot: Bot, private func: (bot: Bot) => Vec3[], private equipTask: EquipTask) {
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

                let targetGoal = new goals.GoalNear(pos.x, pos.y, pos.z, 4);

                await this.bot.pathfinder.goto(targetGoal);

                let farmItem = mcData.itemsByName[this.equipTask.itemName].id;

                await this.bot.equip(farmItem, this.equipTask.place);

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
