import { StateBehavior } from "mineflayer-statemachine";
import { Vec3 } from "vec3";
import { Bot, Chest, Player } from "mineflayer";
import { EventEmitter } from "events";
import { Entity } from "prismarine-entity";
import { Item } from "prismarine-item";
import { Block } from "prismarine-block";
import { Window } from "prismarine-windows";
import { Recipe } from "prismarine-recipe";
import { ChatMessage } from "prismarine-chat";
import { Movements, goals } from "mineflayer-pathfinder";
import { stateShare } from "./stateShare";


const delay: any = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GotoSharedData extends StateParent implements StateBehavior {
    private share: stateShare;
    private reached: boolean = false;

    constructor(bot: Bot, stateName: string, share: stateShare) {
        super(bot, stateName);
        this.share = share;

        this.Reset();
    }

    private Reset(): void {
        this.reached = false;
    }

    onStateEntered(): void {
        const defaultMove: Movements = new Movements(this.bot, this.mcData);
        this.bot.pathfinder.setMovements(defaultMove);

        if (this.share.data != null) {
            this.bot.pathfinder.goto(
                new goals.GoalNear(
                    this.share.data.position.x,
                    this.share.data.position.y,
                    this.share.data.position.z,
                    1
                ),
                () => {
                    this.reached = true;
                }
            );
        }
    }

    onStateExited(): void {
        this.Reset();
    }

    hasReached() {
        return this.reached;
    }
}

export class EmptyInventory extends StateParent implements StateBehavior {
    vec: Vec3;

    done: boolean = false;
    chestFull: boolean = false;

    constructor(bot: Bot, vec: Vec3, stateName: string) {
        super(bot, stateName);

        this.vec = vec;
        this.Reset();
    }

    private Reset(): void {
        this.done = false;
        this.chestFull = false;
    }

    private async depositAllItems(chestToOpen: Block) {
        this.Reset();

        let chest: Chest = await this.bot.openChest(chestToOpen);
        await delay(2500);
        let items: Item[] = this.bot.inventory.items();
        let triesRemaining: number = 45;
        while (triesRemaining >= 0) {
            items = this.bot.inventory.items();
            if (items.length <= 0) break;

            for (const item of items) {
                console.log(item.type);
                if (item != null) {
                    await chest.deposit(item.type, null, item.count, async (err) => {
                        if (err != undefined && err != null && triesRemaining <= 0) {
                            // console.log(err.message);
                            //
                            // await delay(1500);
                            // items = this.bot.inventory.items();
                            // if(items.length > 0) {
                            //     this.chestFull = true;
                            //     return;
                            // }
                        }
                    });
                }
                await delay(500);
            }
            await delay(500);
            triesRemaining--;
        }
        await delay(2500);
        chest.close();

        this.done = true;
        return;
    }

    onStateEntered(): void {
        this.Reset();

        let chestToOpen: Block | null = this.bot.blockAt(this.vec);
        if (chestToOpen != null) {
            this.bot.lookAt(chestToOpen.position).then(async () => {
                if (chestToOpen != null) {
                    console.log("depositAllItems");
                    await this.depositAllItems(chestToOpen);
                    console.log("");
                }
            });
        }
    }

    onStateExited(): void {
        this.Reset();
    }

    IsChestFull(): boolean {
        return this.chestFull;
    }

    IsDone(): boolean {
        return this.done;
    }
}

export class CompassPort extends StateParent implements StateBehavior {
    slot: number = -1;
    done: boolean = false;

    constructor(bot: Bot, stateName: string, slot: number) {
        super(bot, stateName);

        this.slot = slot;
        this.Reset();
    }

    private Reset(): void {
        this.done = false;
    }

    async onStateEntered(): Promise<void> {
        this.Reset();

        this.bot.setQuickBarSlot(0);
        this.bot.activateItem();

        await delay(1500);
        await this.bot.simpleClick.rightMouse(this.slot);
        await delay(3000);

        this.done = true;
    }

    Done(): boolean {
        return this.done;
    }

    onStateExited(): void {
        this.Reset();
    }
}

export class GoToIsland extends StateParent implements StateBehavior {
    goIslandSlot: number = -1;
    done: boolean = false;

    constructor(bot: Bot, stateName: string, goIslandSlot: number) {
        super(bot, stateName);

        this.goIslandSlot = goIslandSlot;
    }

    private Reset(): void {
        this.done = false;
    }

    async onStateEntered(): Promise<void> {
        this.Reset();

        this.bot.chat("/home");
        await delay(3000);
        await this.bot.simpleClick.leftMouse(this.goIslandSlot);
        await delay(8000);

        this.done = true;
    }

    onStateExited(): void {
        this.Reset();
    }

    Done(): boolean {
        return this.done;
    }
}

export class GoToHome extends StateParent implements StateBehavior {
    homeName: string = "";
    done: boolean = false;

    constructor(bot: Bot, stateName: string, homeName: string) {
        super(bot, stateName);

        this.homeName = homeName;
    }

    private Reset(): void {
        this.done = false;
    }

    async onStateEntered(): Promise<void> {
        this.Reset();

        this.bot.chat("/home " + this.homeName);
        await delay(7000);

        this.done = true;
    }

    onStateExited(): void {
        this.Reset();
    }

    Done(): boolean {
        return this.done;
    }
}

export class SearchDirt extends StateParent implements StateBehavior {
    radius: number;
    share: stateShare;
    private done: boolean = false;
    private found: boolean = false;

    // Info block wird referenziert und in der Hauptklasse verwaltet
    constructor(bot: Bot, stateName: string, radius: number, share: stateShare) {
        super(bot, stateName);
        this.radius = radius;
        this.share = share;
    }

    private Reset(): void {
        this.done = false;
        this.found = false;
    }

    async onStateEntered(): Promise<void> {
        this.Reset();
        const ids: number[] = [this.mcData.blocksByName["dirt"].id];
        let dirtblocks: Vec3[] = this.bot.findBlocks({
            matching: ids,
            maxDistance: 50,
            count: 50,
        });

        for (let index: number = 0; index < dirtblocks.length; index++) {
            let position: Vec3 = dirtblocks[index];
            let BlockAbove: Block | null = this.bot.blockAt(position.offset(0, 1, 0));
            if (BlockAbove != null && !BlockAbove.name.includes("_sapling")) {
                this.share.data = BlockAbove;
                this.found = true;
                break;
            }
        }

        this.done = true;
    }

    onStateExited(): void {
        this.Reset();
    }

    Done(): boolean {
        return this.done;
    }

    Found(): boolean {
        return this.found;
    }
}

export class DecideAction extends StateParent implements StateBehavior {
    abbauen: boolean = false;
    setzen: boolean = false;
    done: boolean = false;
    share: stateShare;

    constructor(bot: Bot, stateName: string, share: stateShare) {
        super(bot, stateName);
        this.share = share;
    }

    private Reset(): void {
        this.done = false;
        this.abbauen = false;
        this.setzen = false;
    }

    async onStateEntered(): Promise<void> {
        this.Reset();

        if (this.share.data != null) {
            let temp: Block | null = await this.bot.blockAt(
                this.share.data.position.offset(0, 1, 0)
            );
            if (temp) {
                if (temp.name.includes("_log")) {
                    this.abbauen = true;
                } else if (temp.name == "air") {
                    this.setzen = true;
                }
            }
        }

        this.done = true;
    }

    onStateExited(): void {
        this.Reset();
    }

    Done(): boolean {
        return this.done;
    }

    Setzen(): boolean {
        return this.setzen;
    }

    Abbauen(): boolean {
        return this.abbauen;
    }
}

export class CutTree extends StateParent implements StateBehavior {
    done: boolean = false;
    share: stateShare;

    constructor(bot: Bot, stateName: string, share: stateShare) {
        super(bot, stateName);
        this.share = share;
    }

    private Reset(): void {
        this.done = false;
    }

    async onStateEntered(): Promise<void> {
        this.Reset();

        if (this.share.data == null) return;
        else {
            for (let i = 0; i < 6; i++) {
                let temp: Block | null = this.bot.blockAt(this.share.data.position.offset(0, i, 0));
                if (temp) {
                    if (temp.name.includes("_log")) {
                        await this.bot.dig(temp);
                    }
                }
            }
        }

        this.done = true;
    }

    onStateExited(): void {
        this.Reset();
    }

    Done(): boolean {
        return this.done;
    }
}

export class PlantSapling extends StateParent implements StateBehavior {
    done: boolean = false;
    share: stateShare;

    constructor(bot: Bot, stateName: string, share: stateShare) {
        super(bot, stateName);
        this.share = share;
    }

    private Reset(): void {
        this.done = false;
    }

    async onStateEntered(): Promise<void> {
        this.Reset();

        if (this.share.data == null) return;
        else {
            let temp: Block | null = this.bot.blockAt(this.share.data.position.offset(0, -1, 0));
            if (temp) {
                if (temp.name == "dirt") {
                    // equip sapling
                    let Saplings: Item[] = this.bot.inventory
                        .items()
                        .filter((item) => item.name.includes("_sapling"));
                    await this.bot.equip(Saplings[0], "hand");

                    await this.bot.lookAt(temp.position.add(new Vec3(0, 1, 0)));
                    try {
                        await this.bot.placeBlock(temp, new Vec3(0, 1, 0)); // this.bot.entity.position.minus(temp.position).offset(0,1,0)
                    } catch (e) {}
                }
            }
        }

        this.done = true;
    }

    onStateExited(): void {
        this.Reset();
    }

    Done(): boolean {
        return this.done;
    }
}
