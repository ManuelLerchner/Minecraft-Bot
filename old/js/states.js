const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements;
const {GoalNear, GoalXZ} = require('mineflayer-pathfinder').goals
const mineflayer = require('mineflayer')
const {Chest} = require("mineflayer");
const Vec3 = require('vec3').Vec3;

const GeheZu = (function () {

    function GeheZu(bot, vec, statename) {
        this.bot = bot;
        this.vec = vec;
        this.active = false;
        this.stateName = statename;
    }

    GeheZu.prototype.onStateEntered = function () {
        const mcData = require('minecraft-data')(this.bot.version)
        const defaultMove = new Movements(this.bot, mcData)
        this.bot.pathfinder.setMovements(defaultMove);

        this.bot.pathfinder.goto(new GoalXZ(this.vec.x, this.vec.z, 0), () => {
            this.reached = true;
        });
    };
    GeheZu.prototype.onStateExited = function () {
        this.reached = false;
    };

    this.reached = false;

    GeheZu.prototype.Reached = function () {
        return this.reached;
    }

    return GeheZu;
}());

const Vorbereiten = (function () {

    function Vorbereiten(bot, statename, minDurability, minSaplings) {
        this.bot = bot;
        this.active = false;
        this.stateName = statename;
        this.minDurability = minDurability;
        this.minSaplings = minSaplings;
    }

    Vorbereiten.prototype.checkAxe = async function () {
        const mcData = require('minecraft-data')(this.bot.version)
        let Axe = this.bot.inventory.items().filter(item => item.name === "diamond_axe");
        let pItem = mcData.itemsByName.diamond_axe;

        if (Axe.length != 0) {
            let remaining = pItem.maxDurability - Axe[0].durabilityUsed;

            if (remaining <= this.minDurability) {
                this.noAxe = true;
                return;
            }
            // mcData.itemsByName.diamond_axe.id
            this.bot.equip(Axe[0], 'hand', (res) => {
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

    Vorbereiten.prototype.checkSaplings = async function () {
        const mcData = require('minecraft-data')(this.bot.version)
        let saplingArray = this.bot.inventory.items().filter(item => (item.name == "oak_sapling" || item.name == "birch_sapling"
            || item.name == "spruce_sapling" || item.name == "jungle_sapling" || item.name == "acacia_sapling" || item.name == "dark_oak_sapling"));

        if (saplingArray.length != 0) {

            for (let index = 0; index < saplingArray.length; index++) {
                let sapling = saplingArray[index];
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


    Vorbereiten.prototype.onStateEntered = async function () {
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
    Vorbereiten.prototype.onStateExited = function () {
        this.done = false;
        this.noAxe = false;

    };
    Vorbereiten.prototype.Done = function () {
        return this.done;
    }


    Vorbereiten.prototype.NoAxe = function () {
        return this.noAxe;
    }
    Vorbereiten.prototype.NoSapling = function () {
        return this.noSapling;
    }

    return Vorbereiten;
}());


const HoleItemAusKiste = (function () {

    function HoleItemAusKiste(bot, statename, itemArray, anzahl, vecKiste) {
        this.bot = bot;
        this.active = false;
        this.stateName = statename;
        this.itemArray = itemArray;
        this.anzahl = anzahl;
        this.vecKiste = vecKiste;
    }

    HoleItemAusKiste.prototype.onStateEntered = async function () {
        this.done = false;
        this.sucess = false;
        const mcData = require('minecraft-data')(this.bot.version)
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
        await delay(1000);

        var chestToOpen = this.bot.blockAt(this.vecKiste);
        let chest = await this.bot.openChest(chestToOpen);
        chest = await this.bot.openChest(chestToOpen);

        Sprung1: {
            for (let index = 0; index < this.itemArray.length; index++) {
                let itemElement = this.itemArray[index];

                let result = chest.containerItems().filter(item => item.name === itemElement);
                for (let index2 = 0; index2 < result.length; index2++) {
                    if (result[index2].count >= this.anzahl) {
                        await chest.withdraw(mcData.itemsByName[itemElement].id, null, this.anzahl).then(() => {
                            this.sucess = true;
                        })
                            .catch((res) => {
                                if (res) {
                                    this.sucess = false;
                                }
                            });
                        if (this.sucess) {
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
    HoleItemAusKiste.prototype.onStateExited = function () {
        this.done = false;
        this.sucess = false;
    };
    HoleItemAusKiste.prototype.Done = function () {
        return this.done;
    }
    HoleItemAusKiste.prototype.Sucess = function () {
        return this.sucess;
    }
    return HoleItemAusKiste;
}());

const SucheHolz = (function () {

    function SucheHolz(bot, statename, baumhoehe) {
        this.bot = bot;
        this.active = false;
        this.stateName = statename;
        this.baumhoehe = baumhoehe;
    }

    SucheHolz.prototype.BaumAbbauen = async function (position) {
        const mcData = require('minecraft-data')(this.bot.version)
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        let defaultMove = new Movements(this.bot, mcData)
        defaultMove.blocksCantBreak = new Set();
        defaultMove.blocksCantBreak.add(mcData.blocksByName.cobblestone_slab.id);
        defaultMove.scafoldingBlocks = [];
        let woodArray = ["oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log"];


        for (let index = 0; index < woodArray.length; index++) {
            defaultMove.blocksCantBreak.add(mcData.blocksByName[woodArray[index]].id)
        }
        this.bot.pathfinder.setMovements(defaultMove);


        await this.bot.pathfinder.goto(new GoalNear(position.x, position.y, position.z, 1), async () => {
            for (let index = 0; index < this.baumhoehe; index++) {
                let block = this.bot.blockAt(new Vec3(position.x, position.y + index, position.z));
                try {
                    if (woodArray.includes(block.name)) {
                        await this.bot.dig(block);
                        await delay(200);
                    }
                } catch (error) {
                    this.fehler = true;
                }
            }
            // let array=[0,1,2,3,4,5];
            // await Promise.all(array.map(async(index)=>{
            //     let block=this.bot.blockAt(new Vec3(position.x, position.y+index, position.z));
            //     try {
            //         if(woodArray.includes(block.name)){
            //             await this.bot.dig(block);
            //             await delay(200);
            //         }
            //     } catch (error) {
            //         this.bot.chat("error: "+error);
            //     }
            // }))
            // return;
        });
        return;
    }
    SucheHolz.prototype.SetzeSapling = async function (position) {
        await this.bot.pathfinder.goto(new GoalNear(position.x, position.y, position.z, 1), async () => {

        });
    }
    SucheHolz.prototype.FindeHolz = async function () {
        const mcData = require('minecraft-data')(this.bot.version)
        const ids = [mcData.blocksByName["dirt"].id]
        const blocks = this.bot.findBlocks({matching: ids, maxDistance: 50, count: 50})
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        for (let index = 0; index < blocks.length; index++) {
            const dirtBlock = blocks[index];
            let position = dirtBlock
            let array = [0, 1, 2, 3, 4, 5,6];
            for await (let variable of array) {
                let positionWithOffset = position.offset(0, variable, 0);
                let SapWood = this.bot.blockAt(positionWithOffset);

                if (SapWood) {
                    let woodArray = ["oak_log", "birch_log", "spruce_log", "jungle_log", "acacia_log", "dark_oak_log"];
                    let saplingArray = ["oak_sapling", "birch_sapling", "spruce_sapling", "jungle_sapling", "acacia_sapling", "dark_oak_sapling"]
                    if (woodArray.includes(SapWood.name)) {
                        this.bot.chat("Starte BaumAbbauen")
                        await this.BaumAbbauen(SapWood.position);
                        await delay(4000);
                        this.bot.chat("Ende BaumAbbauen");
                        break;
                    } else if (saplingArray.includes(SapWood.name)) {
                        //Der Sapling wurde gesetzt
                    } else {
                        //Es ist Air
                    }
                }
            }
        }
    }
    SucheHolz.prototype.onStateEntered = async function () {
        this.done = false;
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        await delay(200);
        await this.FindeHolz();


        this.done = true;
        return;
    };
    SucheHolz.prototype.onStateExited = function () {
        this.done = false;
    };
    SucheHolz.prototype.Done = function () {
        return this.done;
    }
    SucheHolz.prototype.Fehler = function () {
        return this.fehler;
    }
    return SucheHolz;
}());

const Abbauen = (function () {

    function Abbauen(bot, vecL, vecR, stateName, count, minBlocks) {
        this.bot = bot;
        this.active = false;
        this.vecL = vecL;
        this.vecR = vecR;
        this.stateName = stateName;
        this.count = count;
        this.minBlocks = minBlocks;
    }

    this.count = 20;
    this.counter = 0;

    Abbauen.prototype.onStateEntered = async function () {
        this.noPickaxe = false;
        this.done = false;
        this.counter = 0;

        await this.CheckPick();

        const afun = this.bot.waitForChunksToLoad(async () => {

            const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
            for (let index = 0; index < this.count; index++) {
                await this.CheckPick();
                if (this.noPickaxe == true) {
                    break;
                }

                let target1 = this.bot.blockAt(this.vecL);

                if (!target1) {
                    index--;
                    continue;
                }

                if (target1 && this.bot.canDigBlock(target1)) {
                    await this.bot.dig(target1);
                    this.bot.stopDigging();
                    await delay(50);
                    this.counter++;
                }

                await this.CheckPick();
                if (this.noPickaxe == true) {
                    break;
                }

                let target2 = this.bot.blockAt(this.vecR);
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
    };

    Abbauen.prototype.CheckPick = function () {
        const mcData = require('minecraft-data')(this.bot.version)
        let pickAxe = this.bot.inventory.items().filter(item => item.name === "diamond_pickaxe");
        let pItem = mcData.itemsByName.diamond_pickaxe;

        if (pickAxe.length != 0) {
            let remaining = pItem.maxDurability - pickAxe[0].durabilityUsed;

            if (remaining <= this.minBlocks) {
                this.noPickaxe = true;
                return;
            }

            this.bot.equip(pickAxe[0], 'hand', (res) => {
                if (res) {
                    // Fehler keine Picke wird gefunden
                    this.noPickaxe = true;
                } else {
                    this.noPickaxe = false;
                }
            });
        } else {
            this.noPickaxe = true;
        }
    }

    this.noPickaxe = false;
    Abbauen.prototype.NoPickaxe = function () {
        return this.noPickaxe;
    }

    this.done = false;

    Abbauen.prototype.Done = function () {
        return this.done;
    }

    Abbauen.prototype.onStateExited = function () {
        this.noPickaxe = false;
        this.done = false;
    };

    return Abbauen;
}());

const HolePicke = (function () {

    function HolePicke(bot, vec, statename) {
        this.bot = bot;
        this.vec = vec;
        this.active = false;
        this.stateName = statename;
    }

    HolePicke.prototype.withdrawDiamondPickaxe = async function (chestToOpen) {
        this.done = false;
        this.chestEmpty = false;

        const mcData = require('minecraft-data')(this.bot.version)
        const chest = await this.bot.openChest(chestToOpen);

        await chest.withdraw(mcData.itemsByName.diamond_pickaxe.id, null, 1).catch((res) => {
            if (res) {
                this.chestEmpty = true;
                this.done = true;
            }
        }).then(() => {
            this.done = true;
        });

        chest.close();
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        await delay(1500);

        this.done = true;
        return;
    }

    HolePicke.prototype.onStateEntered = function () {
        this.done = false;
        this.chestEmpty = false;

        var chestToOpen = this.bot.blockAt(this.vec);
        this.bot.lookAt(chestToOpen.position).then(async () => {
            await this.withdrawDiamondPickaxe(chestToOpen);
        });
    };

    HolePicke.prototype.onStateExited = function () {
        this.done = false;
        this.chestEmpty = false;
    };

    this.done = false;
    this.chestEmpty = false;

    HolePicke.prototype.ChestEmpty = function () {
        return this.chestEmpty;
    }

    HolePicke.prototype.Done = function () {
        return this.done;
    }

    return HolePicke;
}());

const LeereInv = (function () {

    function LeereInv(bot, vec, statename) {
        this.bot = bot;
        this.vec = vec;
        this.active = false;
        this.stateName = statename;
    }

    LeereInv.prototype.depositAllItems = async function (chestToOpen) {
        this.chestFull = false;
        this.done = false;
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        const mcData = require('minecraft-data')(this.bot.version);

        var chest = await this.bot.openChest(chestToOpen);
        let items = this.bot.inventory.items();
        for (const item of items) {
            if(item != null) {
                await chest.deposit(item.type, null, item.count, (err) => {
                    this.chestFull = true;
                    return;
                });
            }
        }
        await delay(1500);
        chest.close();
        /*

        var chest = await this.bot.openChest(chestToOpen);

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        await delay(150);

        let items = this.bot.inventory.items();


        while (items.length > 0 && !this.chestFull) {
            items = this.bot.inventory.items();
            console.log(items.length);

            let Fehler = false;
            try {
                await items.forEach(async (temp) => {
                    if(!Fehler && temp.type) {
                        await chest.deposit(temp.type, null, temp.count).catch(async (res) => {
                            //this.chestFull = true;
                            console.log("FEHLER1: " + res);
                            Fehler = true;
                        });
                    }
                    await delay(150);
                });
            } catch (e) {
                console.log("Fehler2: " + e);
            }

            await delay(150);
            items = this.bot.inventory.items();
        }
        console.log(items.length);

        chest.close();

        if (this.bot.inventory.items().length > 0) {
            this.chestFull = true;
        }
         */

        this.done = true;
        return;
    }

    LeereInv.prototype.onStateEntered = function () {
        this.done = false;
        this.chestFull = false;

        var chestToOpen = this.bot.blockAt(this.vec);
        this.bot.lookAt(chestToOpen.position).then(async () => {
            await this.depositAllItems(chestToOpen);
        });
    };

    LeereInv.prototype.onStateExited = function () {
        this.done = false;
    };

    this.done = false;
    this.chestFull = false;

    LeereInv.prototype.ChestFull = function () {
        return this.chestFull;
    }

    LeereInv.prototype.Done = function () {
        return this.done;
    }

    return LeereInv;
}());

/*
const LeereInvErweitert = (function () {

    function LeereInvErweitert(bot, vec, statename, minDurability, minSaplings) {
        this.bot = bot;
        this.vec = vec;
        this.active = false;
        this.stateName = statename;
        this.minDurability = minDurability;
        this.minSaplings = minSaplings;
    }
    LeereInvErweitert.prototype.checkAxe = async function () {
        const mcData = require('minecraft-data')(this.bot.version)
        let Axe = this.bot.inventory.items().filter(item => item.name === "diamond_axe");
        let pItem = mcData.itemsByName.diamond_axe;

        if (Axe.length != 0) {
            this.remaining = pItem.maxDurability - Axe[0].durabilityUsed;

            if (remaining <= this.minDurability) {
                this.noAxe = true;
                return;
            }
            // mcData.itemsByName.diamond_axe.id
            this.bot.equip(Axe[0], 'hand', (res) => {
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
    LeereInvErweitert.prototype.depositSpecialItems = async function (chestToOpen) {
        this.chestFull = false;
        const mcData = require('minecraft-data')(this.bot.version)
        const chest = await this.bot.openChest(chestToOpen);

        let items = this.bot.inventory.items();
        let axeItem = mcData.itemsByName.diamond_axe;
        let saplingArray = ["oak_sapling", "birch_sapling", "spruce_sapling", "jungle_sapling", "acacia_sapling", "dark_oak_sapling"]
        let SaplingImInventar = false;
        items.forEach(item => {
            //Axt
            if (item.name === axeItem.name) {
                let remainingDurability = axeItem.maxDurability - item.durabilityUsed;
                if (remainingDurability < this.minDurability) {
                    await chest.deposit(item.type, null, 1).catch((res) => {
                        this.chestAxeFull = true;
                    });
                }
            }
            //Sapling gefunden
            else if (saplingArray.includes(item.name)) {
                if (SaplingImInventar) {
                    await chest.deposit(item.type, null, item.count).catch((res) => {
                        this.chestSaplingFull = true;
                    });
                }
                else {
                    if (item.count > this.minSaplings) {
                        await chest.deposit(item.type, null, (item.count - this.minSaplings)).catch((res) => {
                            this.outputChestfull=true;
                        });
                        SaplingImInventar = true;
                    }
                }
            }
            else{
                await chest.deposit(item.type, null, item.count).catch((res) => {
                    this.outputChestfull=true;
                });
            }
        });
    }

    LeereInvErweitert.prototype.onStateEntered = function () {
        this.done = false;
        this.chestFull = false;

        var chestToOpen = this.bot.blockAt(this.vec);
        this.bot.lookAt(chestToOpen.position).then(async () => {
            await this.depositSpecialItems(chestToOpen);
        });
    };

    LeereInvErweitert.prototype.onStateExited = function () {
        this.done = false;
    };

    this.done = false;
    this.chestFull = false;

    LeereInvErweitert.prototype.ChestFull = function () {
        return this.chestFull;
    }

    LeereInvErweitert.prototype.Done = function () {
        return this.done;
    }

    return LeereInvErweitert;
}());
*/

const Failure = (function () {

    this.text = "";

    function Failure(bot, statename, text) {
        this.bot = bot;
        this.active = false;
        this.stateName = statename;
        this.text = text;
    }

    Failure.prototype.onStateEntered = function () {
        //this.bot.chat("FEHLER: " + this.text);
    };

    Failure.prototype.onStateExited = function () {
    };

    return Failure;
}());

const CompassPort = (function () {

    this.slot = -1;
    this.done = false;
    this.goIslandSlot = -1;

    function CompassPort(bot, statename, slot, goIslandSlot) {
        this.bot = bot;
        this.active = false;
        this.stateName = statename;
        this.slot = slot;
        this.goIslandSlot = goIslandSlot;
    }

    CompassPort.prototype.onStateEntered = async function () {
        this.done = false;
        this.bot.setQuickBarSlot(0)
        this.bot.activateItem();

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        await delay(1500);
        this.bot.simpleClick.rightMouse(this.slot);
        await delay(3000);
        this.bot.chat("/is");
        //Fehlersuche
        await delay(10000);
        this.bot.simpleClick.leftMouse(this.goIslandSlot);
        await delay(3000);

        this.done = true;
    };

    CompassPort.prototype.Done = function () {
        return this.done;
    }

    CompassPort.prototype.onStateExited = function () {
    };

    return CompassPort;
}());

module.exports = {GeheZu, Abbauen, HolePicke, LeereInv, Failure, CompassPort, Vorbereiten, SucheHolz, HoleItemAusKiste};