import { StateParent } from "../../_classes/states";
import { StateBehavior } from "mineflayer-statemachine";
import { Vec3 } from "vec3";
import { Bot, Chest } from "mineflayer";
import { Block } from "prismarine-block";
import { delay } from "../helper";

export class GetPickaxe extends StateParent implements StateBehavior {
    vec: Vec3;
    done: boolean = false;
    chestEmpty: boolean = false;

    constructor(bot: Bot, vec: Vec3, stateName: string) {
        super(bot, stateName);
        this.vec = vec;
    }

    async withdrawIronPickaxe(chestToOpen: Block) {
        this.done = false;
        this.chestEmpty = false;
        //this.bot.setQuickBarSlot(0);

        const chest: Chest = await this.bot.openChest(chestToOpen);
        await delay(2500);
        await chest
            .withdraw(this.mcData.itemsByName.iron_pickaxe.id, null, 1)
            .catch((res) => {
                if (res) {
                    this.chestEmpty = true;
                    this.done = true;
                }
            })
            .then(async () => {
                await delay(2500);
                this.done = true;
            });
        await delay(2500);
        chest.close();
        await delay(1500);
    }

    onStateEntered(): void {
        this.done = false;
        this.chestEmpty = false;

        let chestToOpen: Block | null = this.bot.blockAt(this.vec);
        if (chestToOpen != null) {
            this.bot.lookAt(chestToOpen.position).then(async () => {
                if (chestToOpen != null)
                    await this.withdrawIronPickaxe(chestToOpen);
            });
        }
    }

    onStateExited(): void {
        this.done = false;
        this.chestEmpty = false;
    }

    ChestEmpty(): boolean {
        return this.chestEmpty;
    }

    Done(): boolean {
        return this.done;
    }
}
