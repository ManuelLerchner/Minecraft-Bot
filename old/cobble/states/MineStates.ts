import { StateParent } from "../../_classes/states";
import { StateBehavior } from "mineflayer-statemachine";
import { Vec3 } from "vec3";
import { Bot } from "mineflayer";
import { Item } from "prismarine-item";
import { Block } from "prismarine-block";
import { delay } from "../helper";

export class MineBlocks extends StateParent implements StateBehavior {
    vecL: Vec3;
    vecR: Vec3;
    count: number = 0;
    minBlocks: number = 0;
    counter: number = 0;
    noPickaxe: boolean = false;
    done: boolean = false;

    constructor(
        bot: Bot,
        vecL: Vec3,
        vecR: Vec3,
        stateName: string,
        count: number,
        minBlocks: number
    ) {
        super(bot, stateName);

        this.vecL = vecL;
        this.vecR = vecR;
        this.count = count;
        this.minBlocks = minBlocks;
    }

    async onStateEntered(): Promise<void> {
        this.noPickaxe = false;
        this.done = false;
        this.counter = 0;

        await delay(1500);
        await this.CheckPick();

        await this.bot.waitForChunksToLoad(async () => {
            for (let index = 0; index < this.count; index++) {
                await this.CheckPick();
                if (this.noPickaxe == true) {
                    break;
                }

                let target1: Block | null = this.bot.blockAt(this.vecL);

                if (!target1) {
                    index--;
                    continue;
                }

                console.log(index);

                if (target1 && this.bot.canDigBlock(target1)) {
                    await this.bot.dig(target1);
                    this.bot.stopDigging();
                    await delay(50);
                    this.counter++;
                }

                await this.CheckPick();
                if (this.noPickaxe) {
                    break;
                }

                let target2: Block | null = this.bot.blockAt(this.vecR);
                if (!target2) {
                    index--;
                    continue;
                }

                if (target2 && this.bot.canDigBlock(target2)) {
                    await this.bot.dig(target2);
                    this.bot.stopDigging();
                    await delay(175);
                    this.counter++;
                    this.done = false;
                }
            }

            this.done = true;
        });
    }

    CheckPick(): void {
        let pickAxe: Item[] = this.bot.inventory
            .items()
            .filter((item) => item.name === "iron_pickaxe");
        let pItem = this.mcData.itemsByName.iron_pickaxe;

        if (pickAxe.length != 0) {
            let remaining = pItem.maxDurability - pickAxe[0].durabilityUsed;

            if (remaining <= this.minBlocks) {
                this.noPickaxe = true;
                return;
            }
            this.bot.equip(pickAxe[0], "hand", (res) => {
                if (res) {
                    this.noPickaxe = true;
                } else {
                    this.noPickaxe = false;
                }
            });
        } else {
            this.noPickaxe = true;
        }
    }

    NoPickaxe(): boolean {
        return this.noPickaxe;
    }

    Done(): boolean {
        return this.done;
    }

    onStateExited(): void {
        this.noPickaxe = false;
        this.done = false;
    }
}
