import { Bot, createBot } from "mineflayer";
import { Vec3 } from "vec3";
import { simulate } from "../src/LerryScript/Simulator";
import { ASTNode } from "./LerryScript/Nodes/ASTNodes/ASTNode";
import { IfNode } from "./LerryScript/Nodes/ASTNodes/StructureNodes/IfNode";
import { SequentialNode } from "./LerryScript/Nodes/ASTNodes/StructureNodes/SequentialNode";
import { TaskNode } from "./LerryScript/Nodes/ASTNodes/StructureNodes/TaskNode";
import { TryNode } from "./LerryScript/Nodes/ASTNodes/StructureNodes/TryNode";
import { WhileNode } from "./LerryScript/Nodes/ASTNodes/StructureNodes/WhileNode";
import { AndNode } from "./LerryScript/Nodes/CondtionNodes/Boolean/AndNode";
import { ConditionNode } from "./LerryScript/Nodes/CondtionNodes/CondtionNode";

import { FunctionCondtionNode } from "./LerryScript/Nodes/CondtionNodes/Condtitions/FunctionConditionNode";
import { InventoryConditionNode } from "./LerryScript/Nodes/CondtionNodes/Condtitions/InventoryConditionNode";
import { RunParkour } from "./LerryScript/Templates/RunParkour";

const bot: Bot = createBot({
    host: "localhost",
    username: "LerryBot",
});

let hasPickaxeWithMoreThan10Durability: ConditionNode = new InventoryConditionNode(
    "atleast",
    1,
    "wooden_pickaxe",
    {
        comparison: "more_than",
        durability: 10,
    }
);

let hasLessThan10Cobble: ConditionNode = new InventoryConditionNode("atmost", 10, "cobblestone");

let rootNode: ASTNode = new WhileNode(
    new FunctionCondtionNode("infinite repeat", () => true),
    new TryNode(
        new SequentialNode(
            new IfNode(
                new InventoryConditionNode("atleast", 1, "wooden_pickaxe"),
                new SequentialNode(
                    new TaskNode("equip", "wooden_pickaxe to hand", {
                        itemName: "wooden_pickaxe",
                        place: "hand",
                    }),
                    new IfNode(
                        hasPickaxeWithMoreThan10Durability,
                        new SequentialNode(
                            new TaskNode("goto", "cobble farm", new Vec3(214, 64, 181)),

                            new WhileNode(
                                new AndNode(
                                    hasLessThan10Cobble,
                                    hasPickaxeWithMoreThan10Durability
                                ),
                                new SequentialNode(
                                    new TaskNode("mine", "cobble 1", new Vec3(215, 65, 181)),
                                    new TaskNode("mine", "cobble 2", new Vec3(214, 65, 180))
                                )
                            ),

                            new TaskNode("chat", "enough cobble", "I have enough cobble"),
                            RunParkour,
                            new TaskNode("goto", "cobblestone chest", new Vec3(219, 64, 175)),

                            new TryNode(
                                new TaskNode("deposit", "all cobblestone", new Vec3(219, 64, 175), {
                                    itemName: "cobblestone",
                                    amount: "all",
                                }),
                                new TaskNode("idle", "because chest is full")
                            ),

                            new TaskNode("sleep", "for", 2000)
                        ),
                        new SequentialNode(
                            new TaskNode("goto", "used pickaxes chest", new Vec3(217, 64, 171)),

                            new TaskNode("deposit", "used wooden pickaxe", new Vec3(219, 64, 171), {
                                itemName: "wooden_pickaxe",
                                amount: 1,
                            })
                        )
                    )
                ),
                new SequentialNode(
                    new TaskNode("goto", "pickaxe chest", new Vec3(217, 64, 173)),

                    new TryNode(
                        new TaskNode("take", "take pickaxe", new Vec3(219, 64, 173), {
                            itemName: "wooden_pickaxe",
                            amount: 1,
                        }),
                        new TaskNode("sleep", "because there no pickaxe in chest", 5000)
                    )
                )
            )
        ),
        new TaskNode("sleep", "for", 10000)
    )
);

// rootNode = new SequentialNode(
//     new TaskNode("activateHotbarItem", "open compass", 4),
//     new TaskNode("clickInventory", "click on skyblock", "left", 17)
// );

simulate(rootNode, bot);
