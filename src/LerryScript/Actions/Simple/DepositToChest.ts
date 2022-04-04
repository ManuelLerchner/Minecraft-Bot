import { Bot } from "mineflayer";
import { Action } from "../Action";
import { Vec3 } from "vec3";
import { DepositTask } from "../../Types/DepositTask";
import { mcData } from "../../Settings";

export class DepositToChest extends Action {
    itemName: string;
    amount: number | "all";

    constructor(bot: Bot, name: string, private pos: Vec3, private itemsToDeposit: DepositTask) {
        super(bot, name);

        this.itemName = itemsToDeposit.itemName;
        this.amount = itemsToDeposit.amount;

        if (!this.itemName || !mcData.itemsByName[this.itemName]) {
            throw new Error(
                "No item found with name " + this.itemName + " in " + JSON.stringify(itemsToDeposit)
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

        let depositAmount = this.amount;
        if (depositAmount === "all") {
            depositAmount = this.bot.inventory.count(item.id, null);
        }

        try {
            await chest.deposit(item.id, item.metadata, depositAmount as number);
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
