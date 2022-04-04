import { Action } from "./Action";
import { StateBehavior } from "mineflayer-statemachine";
import { Vec3 } from "vec3";
import { Bot, Chest, Player } from "mineflayer";

import { Movements, goals } from "mineflayer-pathfinder";
import { DepositTask } from "../Types/DepositTask";

const mcData = require("minecraft-data");

export class TakeFromChest extends Action {
    mcData: any;
    constructor(bot: Bot, name: string, private pos: Vec3, private itemsToTake: DepositTask) {
        super(bot, name);
        this.mcData = mcData("1.17");
    }

    async onStateEntered() {
        await this.bot.lookAt(this.pos, true);

        let chestBlock = this.bot.blockAt(this.pos);

        if (!chestBlock || chestBlock.displayName !== "Chest") {
            this.setError(new Error("No chest found at " + this.pos));
            return;
        }

        let chest = await this.bot.openChest(chestBlock);

        for (let [name, amount] of Object.entries(this.itemsToTake)) {
            let item = this.mcData.itemsByName[name];

            if (!item) {
                this.setError(new Error("No item found with name " + name));
                return;
            }

            let takeAmount = amount;
            if (amount === "all") {
                takeAmount = chest.count(item.id, null);
            }
            try {
                await chest.withdraw(item.id, item.metadata, takeAmount as number);
            } catch (e: any) {
                chest.close();
                this.setError(e);
                return;
            }

            this.setFinished();
            chest.close();
        }
    }

    onStateExited(): void {
        this.reset();
    }

    canThrowError(): boolean {
        return true;
    }
}
