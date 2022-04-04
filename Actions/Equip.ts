import { Action } from "./Action";
import { StateBehavior } from "mineflayer-statemachine";
import { Vec3 } from "vec3";
import { Bot, Chest, Player } from "mineflayer";

import { Movements, goals } from "mineflayer-pathfinder";
import { DepositTask } from "../Types/DepositTask";
import { EquipTask } from "../Types/EquipTask";

const mcData = require("minecraft-data");

export class Equip extends Action {
    mcData: any;
    constructor(bot: Bot, name: string, private task: EquipTask) {
        super(bot, name);
        this.mcData = mcData("1.17");
    }

    async onStateEntered() {
        let itemNr = this.mcData.itemsByName[this.task.item].id;

        try {
            await this.bot.equip(itemNr, this.task.destination);
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
