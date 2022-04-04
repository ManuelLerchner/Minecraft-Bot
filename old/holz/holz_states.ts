import {StateBehavior} from "mineflayer-statemachine";
import {Vec3} from "vec3";
import {Bot, Chest, Player} from 'mineflayer';
import {EventEmitter} from 'events';
import {Entity} from 'prismarine-entity';
import {Item} from 'prismarine-item';
import {Block} from 'prismarine-block';
import {Window} from 'prismarine-windows';
import {Recipe} from 'prismarine-recipe';
import {ChatMessage} from 'prismarine-chat';
import {Movements, goals} from 'mineflayer-pathfinder';
import {StateParent} from "../_classes/states";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class Vorbereiten implements StateBehavior {
    //region Variablen
    bot: Bot;
    active: boolean;
    done: boolean = false;
    stateName: string = '';

    minDurability: number = -1;
    minSaplings: number = -1;
    noAxe: boolean = false;
    noSapling: boolean = false;
    //endregion
    //region Konsturktoren
    constructor(bot: Bot, statename: string, minDurability: number, minSaplings: number) {
        this.bot = bot;
        this.active = false;
        this.stateName = statename;
        this.minDurability = minDurability;
        this.minSaplings = minSaplings;
    }

    //endregion
    //region Axt/Sapling überprüfen
    async checkAxe(): Promise<void> {
        const mcData: any = require('minecraft-data')(this.bot.version);
        let Axe: Item[] = this.bot.inventory.items().filter(item => item.name === "iron_axe");
        let pItem: any = mcData.itemsByName.iron_axe;

        if (Axe.length != 0) {
            let remaining: number = pItem.maxDurability - Axe[0].durabilityUsed;

            if (remaining <= this.minDurability) {
                this.noAxe = true;
                return;
            }
            await this.bot.equip(Axe[0], 'hand', (res) => {
                if (res) {
                    // Fehler keine Picke wird gefunden
                    this.noAxe = true;
                } else {
                    this.noAxe = false;
                }
            });
        } else {
            this.noAxe = true;
        }
        return;
    }

    async checkSaplings() {
        const mcData: any = require('minecraft-data')(this.bot.version);

        let saplingArray: Item[] = this.bot.inventory.items().filter(item => (item.name == "oak_sapling" || item.name == "birch_sapling"
            || item.name == "spruce_sapling" || item.name == "jungle_sapling" || item.name == "acacia_sapling" || item.name == "dark_oak_sapling"));

        if (saplingArray.length != 0) {

            for (let index: number = 0; index < saplingArray.length; index++) {
                let sapling: Item = saplingArray[index];
                if (sapling.count < this.minSaplings) {
                    this.noSapling = true;
                } else {
                    this.noSapling = false;
                    break;
                }

            }

        } else {
            this.noSapling = true;
        }
        return;
    }

    //endregion
    //region Entered/Exited-Events
    async onStateEntered(): Promise<void> {
        this.done = false;
        await this.checkAxe();

        if (!this.noAxe) {
            await this.checkSaplings();
            if (!this.noSapling) {
                this.done = true;
                return;
            }
        }
        this.done = true;
        return;
    };


    onStateExited(): void {
        this.done = false;
        this.noAxe = false;

    };

    //endregion
    //region Getter
    Done(): boolean {
        return this.done;
    }


    NoAxe(): boolean {
        return this.noAxe;
    }

    NoSapling(): boolean {
        return this.noSapling;
    }

    //endregion
};


export class HoleItemAusKiste implements StateBehavior {
    //region Variablen
    bot: Bot;
    active: boolean = false;
    stateName: string = '';
    itemArray: string[];
    anzahl: number = -1;
    vecKiste: Vec3;
    done: boolean = false;
    success: boolean = false;
    //endregion
    //region Konstruktoren
    constructor(bot: Bot, statename: string, itemArray: string[], anzahl: number, vecKiste: Vec3) {
        this.bot = bot;
        this.active = false;
        this.stateName = statename;
        this.itemArray = itemArray;
        this.anzahl = anzahl;
        this.vecKiste = vecKiste;
    }

    //endregion
    //region Entered/Exited-Events
    async onStateEntered(): Promise<void> {
        this.done = false;
        this.success = false;
        const mcData = require('minecraft-data')(this.bot.version);
        await delay(1000);

        var chestToOpen: any = this.bot.blockAt(this.vecKiste);
        let chest: any;
        chest = await this.bot.openChest(chestToOpen);
        chest = await this.bot.openChest(chestToOpen);
        Sprung1: {
            for (let index = 0; index < this.itemArray.length; index++) {
                let itemElement: Item = mcData.itemsByName[this.itemArray[index]];
                let AllItems: any = chest.containerItems();
                let filteredItems = AllItems.filter((item: { name: string; }) => item.name === itemElement.name); // containerItems
                for (let index2 = 0; index2 < filteredItems.length; index2++) {
                    if (filteredItems[index2].count >= this.anzahl) {
                        await chest.withdraw(mcData.itemsByName[itemElement.name].id, null, this.anzahl).then(() => {
                            this.success = true;
                        })
                            .catch((res: any) => {
                                if (res) {
                                    this.success = false;
                                }
                            });
                        if (this.success) {
                            break Sprung1;
                        }
                    }
                }
            }
        }
        chest.close();
        this.done = true;
        return;
    };

    onStateExited() {
        this.done = false;
        this.success = false;
    };

    //endregion
    //region Getter
    Done(): boolean {
        return this.done;
    }

    Sucess(): boolean {
        return this.success;
    }

    //endregion
};

export class SucheHolz implements StateBehavior {
    //region Variablen
    bot: Bot;
    active: boolean;
    stateName: string;
    baumhoehe: number;
    done: boolean = false;
    error: boolean = false;
    NoSapling: boolean = false;
    saplingArray: string[] = ["oak_sapling", "birch_sapling", "spruce_sapling", "jungle_sapling", "acacia_sapling", "dark_oak_sapling"];
    woodArray = ["oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log"];
    //endregion
    //region Konstruktoren
    constructor(bot: Bot, statename: string, baumhoehe: number) {
        this.bot = bot;
        this.active = false;
        this.stateName = statename;
        this.baumhoehe = baumhoehe;
    }

    //endregion
    //region Methoden
    async BaumAbbauen(position: Vec3): Promise<void> {
        const mcData = require('minecraft-data')(this.bot.version)
        let defaultMove: Movements = new Movements(this.bot, mcData)
        defaultMove.blocksCantBreak = new Set();
        defaultMove.blocksCantBreak.add(mcData.blocksByName.cobblestone_slab.id);
        defaultMove.scafoldingBlocks = [];

        for (let index = 0; index < this.woodArray.length; index++) {
            defaultMove.blocksCantBreak.add(mcData.blocksByName[this.woodArray[index]].id)
        }

        this.bot.pathfinder.setMovements(defaultMove);
        await this.bot.pathfinder.goto(new goals.GoalNear(position.x, this.bot.entity.position.y, position.z, 1)).then(async (res) => {
            for (let index = 0; index < this.baumhoehe; index++) {
                let block: Block|null = this.bot.blockAt(new Vec3(position.x, position.y + index, position.z));
                if(block == null) continue;

                if (this.woodArray.includes(block.name)) {
                    let IronAxe: Item[] = this.bot.inventory.items().filter(item => item.name == mcData.itemsByName["iron_axe"].name);
                    await this.bot.equip(IronAxe[0], 'hand');
                    await this.bot.dig(block, true);
                }

                // try {
                //
                // } catch (error) {
                //     this.error = true;
                // }
            }
        });
    }

    async SetzeSapling(position: Vec3): Promise<void> {
        const mcData = require('minecraft-data')(this.bot.version);
        await this.bot.pathfinder.goto(new goals.GoalNear(position.x, this.bot.entity.position.y, position.z, 1), async () => {
            let Saplings: Item[] = this.bot.inventory.items().filter(item => this.saplingArray.includes(item.name));
            this.bot.equip(Saplings[0], 'hand', async (res: any) => {
                if (res) {
                    this.NoSapling = true;
                } else {
                    this.NoSapling = false;
                    position = position.offset(0, 1, 0);
                    await this.bot.lookAt(position);
                    let SaplingToSet: Block | null = this.bot.blockAt(position);
                    if (SaplingToSet != null) {
                        await this.bot.placeBlock(SaplingToSet, new Vec3(0, -1, 2));
                    }
                }
            });
            //Sapling muss gesetzt werden
        })
    }

    async FindeHolz(): Promise<void> {
        const mcData: any = require('minecraft-data')(this.bot.version);
        const ids: number[] = [mcData.blocksByName["dirt"].id];
        let dirtblocks: Vec3[] = this.bot.findBlocks({matching: ids, maxDistance: 50, count: 50});

        //Jeder DirtBlock
        for (let index: number = 0; index < dirtblocks.length; index++) {
            let position: Vec3 = dirtblocks[index];
            let array: number[] = [0, 1, 2, 3, 4, 5, 6];
            //Alle Blöcke auf Holz untersuchen

            let BlockToPlace: Block | null = this.bot.blockAt(dirtblocks[index].offset(0, 1, 0));
            if (BlockToPlace != null) {
                if (!this.woodArray.includes(BlockToPlace.name) && !this.saplingArray.includes(BlockToPlace.name)) {
                    //Pflanze Sapling
                    await this.SetzeSapling(position);
                } else if (this.woodArray.includes(BlockToPlace.name)) {
                    for (let variable of array) {
                        let positionWithOffset: Vec3 = position.offset(0, variable, 0);
                        let possibleWoodBlock: Block | null = this.bot.blockAt(positionWithOffset);
                        if (possibleWoodBlock != null) {
                            await this.BaumAbbauen(possibleWoodBlock.position);
                            await delay(4000);
                            await this.SetzeSapling(position);
                            break;
                        }
                    }
                }

            }
        }
    }

    //endregion
    //region Entered/exited-Events
    async onStateEntered() {
        this.done = false;
        //await this.FindeHolz();
        await delay(2000);
        this.done = true;
    };

    onStateExited() {
        this.done = false;
    };

    //endregion
    //region Getter
    Done(): boolean {
        return this.done;
    }

    Error(): boolean {
        return this.error;
    }

    //endregion
}


export class LeereInvErweitert implements StateBehavior {
    //region Variablen
    bot: Bot;
    active: boolean;
    stateName: string;
    vec: Vec3;
    minDurability: number;
    minSaplings: number;
    noAxe: boolean = false;
    saplingChestEmpty: boolean = false;
    axeChestEmpty: boolean = false;
    outputChestFull: boolean = false;
    done: boolean = false;
    //endregion
    //region Konstruktoren
    constructor(bot: Bot, vec: Vec3, statename: string, minDurability: number, minSaplings: number) {
        this.bot = bot;
        this.vec = vec;
        this.active = false;
        this.stateName = statename;
        this.minDurability = minDurability;
        this.minSaplings = minSaplings;
    }

    //endregion
    //region Methods
    async checkAxe() {
        const mcData = require('minecraft-data')(this.bot.version)
        let Axe: Item[] = this.bot.inventory.items().filter(item => item.name === "iron_axe");
        let pItem: any = mcData.itemsByName.iron_axe;

        if (Axe.length != 0) {
            let remainingDurability: number = pItem.maxDurability - Axe[0].durabilityUsed;

            if (remainingDurability <= this.minDurability) {
                this.noAxe = true;
                return;
            }
            await this.bot.equip(Axe[0], 'hand', (res) => {
                if (res) {
                    // Fehler keine Picke wird gefunden
                    this.noAxe = true;
                    return;
                } else {
                    this.noAxe = false;
                    return;
                }
            });
        } else {
            this.noAxe = true;
        }
        return;
    }

    async depositSpecialItems(chestToOpen: Block) {
        this.outputChestFull = false;
        this.axeChestEmpty = false;
        this.saplingChestEmpty = false;

        const mcData = require('minecraft-data')(this.bot.version)
        const chest: Chest = await this.bot.openChest(chestToOpen);

        let items: Item[] = this.bot.inventory.items();
        let axeItem: any = mcData.itemsByName.iron_axe;
        let saplingArray: String[] = ["oak_sapling", "birch_sapling", "spruce_sapling", "jungle_sapling", "acacia_sapling", "dark_oak_sapling"]
        let SaplingImInventar: boolean = false;
        for (const item of items) {
            //Axt im Inventar gefunden
            if (item.name === axeItem.name) {
                let remainingDurability = axeItem.maxDurability - item.durabilityUsed;
                if (remainingDurability < this.minDurability) {
                    await chest.deposit(item.type, null, 1).catch((res) => {
                        this.outputChestFull = true;
                    });
                }
            }
            //Sapling im Inventar gefunden
            else if (saplingArray.includes(item.name)) {
                if (SaplingImInventar) {
                    await chest.deposit(item.type, null, item.count).catch((res) => {
                        this.outputChestFull = true;
                    });
                } else {
                    if (item.count > this.minSaplings) {
                        await chest.deposit(item.type, null, (item.count - this.minSaplings)).catch((res) => {
                            this.outputChestFull = true;
                        });
                        SaplingImInventar = true;
                    }
                }
            } else {
                await chest.deposit(item.type, null, item.count).catch((res) => {
                    this.outputChestFull = true;
                });
            }
        }
    }

    //endregion
    //region Entered/Exited-Events
    onStateEntered() {
        this.done = false;
        this.outputChestFull = false;

        var chestToOpen: any = this.bot.blockAt(this.vec);
        this.bot.lookAt(chestToOpen.position).then(async () => {
            this.checkAxe();
            await this.depositSpecialItems(chestToOpen);
        });
        this.done = true;
    };

    onStateExited() {
        this.done = false;
        this.outputChestFull = false;
    };

    //endregion
    //region Getter
    ChestFull(): boolean {
        return this.outputChestFull;
    }

    Done(): boolean {
        return this.done;
    }

    SaplingChestEmpty(): boolean {
        return this.saplingChestEmpty;
    }

    AxeChestEmpty(): boolean {
        return this.axeChestEmpty;
    }

    NoAxe(): boolean {
        return this.noAxe;
    }

    OutputChestFull(): boolean {
        return this.outputChestFull;
    }

    //endregion
}

export class EmptyInventory extends StateParent implements StateBehavior {
    //region Variablen
    vec: Vec3;
    done: boolean = false;
    chestFull: boolean = false;
    minDurability: number;
    minSaplings: number;

    //endregion
    constructor(bot: Bot, vec: Vec3, stateName: string, minDurability: number, minSaplings: number) {
        super(bot, stateName);
        this.vec = vec;
        this.minDurability = minDurability;
        this.minSaplings = minSaplings;
        this.Reset();
    }

    private Reset(): void {
        this.done = false;
        this.chestFull = false;
    }

    private async depositAllValidItems(chestToOpen: Block) {
        //Überschreiben, If-Verschachtelung falsch, muss erneuert werden
        this.Reset();
        let chest: Chest = await this.bot.openChest(chestToOpen);
        let items: Item[] = this.bot.inventory.items();
        const mcData: any = require('minecraft-data')(this.bot.version);
        let axeItem: any = mcData.itemsByName.iron_axe;
        let SaplingImInventar: boolean = false;
        const saplingArray: string[] = ["oak_sapling", "birch_sapling", "spruce_sapling", "jungle_sapling", "acacia_sapling", "dark_oak_sapling"];

        for (const item of items) {
            if (item != null) {

                //Axt im Inventar gefunden
                if (item.name === axeItem.name) {
                    let remainingDurability = axeItem.maxDurability - item.durabilityUsed;
                    if (remainingDurability < this.minDurability) {
                        await chest.deposit(item.type, null, 1, (err) => {
                            if (err != undefined && err != null) {
                                this.chestFull = true;
                            }
                            return;
                        });
                    }
                }
                //Sapling im Inventar gefunden
                else if (saplingArray.includes(item.name)) {
                    if (SaplingImInventar) {
                        await chest.deposit(item.type, null, item.count, (err) => {
                            if (err != undefined && err != null) {
                                this.chestFull = true;
                            }
                            return;
                        });
                    } else {
                        if (item.count > this.minSaplings) {
                            await chest.deposit(item.type, null, item.count - this.minSaplings, (err) => {
                                if (err != undefined && err != null) {
                                    this.chestFull = true;
                                }
                                return;
                            });
                            SaplingImInventar = true;
                        }
                    }
                } else {
                    await chest.deposit(item.type, null, item.count, (err) => {
                        if (err != undefined && err != null) {
                            this.chestFull = true;
                        }
                        return;
                    });
                }
            }
        }
        await delay(1500);
        chest.close();

        this.done = true;
        return;
    }

    onStateEntered(): void {
        this.Reset();

        let chestToOpen: Block | null = this.bot.blockAt(this.vec);
        if (chestToOpen != null) {
            this.bot.lookAt(chestToOpen.position).then(async () => {
                if (chestToOpen != null)
                    await this.depositAllValidItems(chestToOpen);
            });
        }
    };

    onStateExited(): void {
        this.Reset();
    };

    IsChestFull(): boolean {
        return this.chestFull;
    }

    IsDone(): boolean {
        return this.done;
    }
}

export class Failure implements StateBehavior {
    //region Variablen
    bot: Bot;
    active: boolean;
    stateName: string;
    text: string = "";
    //endregion
    //region Konstruktor
    constructor(bot: Bot, statename: string, text: string) {
        this.bot = bot;
        this.active = false;
        this.stateName = statename;
        this.text = text;
    }

    //endregion
    //region Entered/Existed-Event
    onStateEntered() {
        //this.bot.chat("FEHLER: " + this.text);
    };

    onStateExited() {
        //this.bot.chat("Fehler behoben:"+this.text);
    };

    //endregion
}

export class GoToRandom extends StateParent implements StateBehavior {
    done: boolean = false;
    doExit: boolean = false;

    constructor(bot: Bot, stateName: string) {
        super(bot, stateName);
        this.Reset();
    }

    private async GoTo(position: Vec3): Promise<void> {
        await this.bot.pathfinder.goto(new goals.GoalNear(position.x, position.y, position.z, 3), async () => {
            this.done = true;
            return;
        });
    }

    private async getRandom(min: number, max: number): Promise<number> {
        return Math.random() * (max - min) + min;
    }

    async onStateEntered() {
        this.Reset();
        const mcData: any = require('minecraft-data')(this.bot.version)
        const ids: number[] = [mcData.blocksByName["dirt"].id]
        const DirtBlocks: Vec3[] = this.bot.findBlocks({matching: ids, maxDistance: 50, count: 50});

        // Checken ob irgendwo ein Air Block über dem Dirt ist
        for (let index: number = 0; index < DirtBlocks.length; index++) {
            let BlockToPlace: Block | null = this.bot.blockAt(DirtBlocks[index].offset(0, 1, 0));
            if (BlockToPlace != null && (BlockToPlace.name == ("air") || BlockToPlace.name.includes("_log") )) {
                this.doExit = true;
                break;

            } else if (BlockToPlace != null) {
                this.doExit = false;
            }
        }

        if (!this.doExit)
        {
            let rand: number = await this.getRandom(0, DirtBlocks.length - 1);
            await this.GoTo(DirtBlocks[Math.trunc(rand)]);
        }


        this.done = true;
    };

    private Reset(): void {
        this.done = false;
        this.doExit = false;
    }

    onStateExited() {
        this.Reset();
    };

    IsDone(): boolean {
        return this.done;
    }

    DoExit(): boolean {
        return this.doExit;
    }
}