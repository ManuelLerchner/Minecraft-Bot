import { Action } from "./Action";
import { Vec3 } from "vec3";
import { Bot } from "mineflayer";
import { DepositTask } from "../Types/DepositTask";
import { mcData } from "../projectSettings";

export class DepositToChest extends Action {
    constructor(bot: Bot, name: string, private pos: Vec3, private itemsToDeposit: DepositTask) {
        super(bot, name);

        for (let [name, amount] of Object.entries(this.itemsToDeposit)) {
            let item = mcData.itemsByName[name];

            if (!item) {
                throw new Error("No item found with name " + name);
            }
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

        for (let [name, amount] of Object.entries(this.itemsToDeposit)) {
            let item = mcData.itemsByName[name];

            let depositAmount = amount;
            if (amount === "all") {
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
    }

    onStateExited(): void {
        this.reset();
    }

    canThrowError(): boolean {
        return true;
    }
}
