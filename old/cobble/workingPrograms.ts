import { WhileNode, TryNode, SequentialNode, TaskNode, IfNode } from "../src/LerryScript/Nodes/Nodes";
import { Vec3 } from "vec3";
import { mcData } from "../../src/LerryScript/projectSettings";


let bot: any;

const infiniteRepeat = () => true;

const hasLessThan10Cobble = () => {
    let cobble = bot.inventory.items().find((item) => item.name === "cobblestone");
    return !cobble || cobble.count < 10;
};

function hasPickaxe() {
    let hasPickaxe = bot.inventory.items().find((item) => item.name === "wooden_pickaxe");
    return !!hasPickaxe;
}

function pickaxeHasMoreThan10Durability() {
    let pickaxe = bot.inventory.items().find((item) => item.name === "wooden_pickaxe");

    if (!pickaxe) return false;

    let mcDataPickaxe = mcData.itemsByName.wooden_pickaxe;
    let remaining = mcDataPickaxe.maxDurability - pickaxe.durabilityUsed;
    return remaining > 10;
}

export const farmCobble_ReplacePickaxeIfNearlyBroken = new WhileNode(
    infiniteRepeat,
    new SequentialNode(
        new IfNode(
            hasPickaxe,
            new SequentialNode(
                new TaskNode("equip", "wooden_pickaxe to hand", {
                    wooden_pickaxe: "hand",
                }),
                new IfNode(
                    pickaxeHasMoreThan10Durability,
                    new SequentialNode(
                        new TaskNode("goto", "cobble farm", new Vec3(214, 64, 181)),

                        new WhileNode(
                            hasLessThan10Cobble,
                            new TaskNode("mine", "cobble", new Vec3(215, 65, 181))
                        ),

                        new TaskNode("goto", "cobblestone chest", new Vec3(219, 64, 175)),

                        new TryNode(
                            new TaskNode("deposit", "all cobblestone", new Vec3(219, 64, 175), {
                                cobblestone: "all",
                            }),
                            new TaskNode("idle", "because chest is full")
                        ),

                        new TaskNode("sleep", "for", 2000)
                    ),
                    new SequentialNode(
                        new TaskNode("goto", "used pickaxes chest", new Vec3(217, 64, 171)),

                        new TaskNode("deposit", "used wooden pickaxe", new Vec3(219, 64, 171), {
                            wooden_pickaxe: 1,
                        })
                    )
                )
            ),
            new SequentialNode(
                new TaskNode("goto", "pickaxe chest", new Vec3(217, 64, 173)),

                new TryNode(
                    new TaskNode("take", "take pickaxe", new Vec3(219, 64, 173), {
                        wooden_pickaxe: 1,
                    }),
                    new TaskNode("sleep", "because there no pickaxe in chest", 5000)
                )
            )
        )
    )
);
