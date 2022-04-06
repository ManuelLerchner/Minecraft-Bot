import { Bot } from "mineflayer";
import { Action } from "../Action";
import { Vec3 } from "vec3";
import { DepositTask } from "../../Types/DepositTask";
import { mcData } from "../../Settings";

export class TakeFromChestAction extends Action {
    itemName: string;
    amount: number | "all";
    constructor(bot: Bot, private pos: Vec3, itemsToTake: DepositTask) {
        super(bot);

        this.itemName = itemsToTake.itemName;
        this.amount = itemsToTake.amount;

        if (!this.itemName || !mcData.itemsByName[this.itemName]) {
            throw new Error(
                "No item found with name " + this.itemName + " in " + JSON.stringify(itemsToTake)
            );
        }
    }

    async onStateEntered() {
        await this.bot.lookAt(this.pos, true);

        let chestBlock = this.bot.blockAt(this.pos);

        if (!chestBlock || chestBlock.displayName !== "Chest") {
            this.setError(new Error("No chest found at " + this.pos));
            return;
        }

        let chest = await this.bot.openChest(chestBlock);

        let item = mcData.itemsByName[this.itemName];

        let takeAmount = this.amount;
        if (takeAmount === "all") {
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

    canThrowError(): boolean {
        return true;
    }
}
