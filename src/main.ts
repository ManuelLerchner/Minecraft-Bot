import * as mineflayer from "mineflayer";
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

const bot: mineflayer.Bot = mineflayer.createBot({
    host: "localhost",
    username: "LerryBot",
});

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

let pickaxeHasMoreThan10Durability: ConditionNode = new InventoryConditionNode(
    "exactly",
    1,
    "wooden_pickaxe",
    {
        comparison: "more than",
        durability: 10,
    }
);

let hasLessThan10Cobble: ConditionNode = new InventoryConditionNode("less than", 10, "cobblestone");

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

let rootNode: ASTNode = new WhileNode(
    new FunctionCondtionNode("infinite repeat", () => true),
    new SequentialNode(
        new IfNode(
            new InventoryConditionNode("exactly", 1, "wooden_pickaxe"),
            new SequentialNode(
                new TaskNode("equip", "wooden_pickaxe to hand", {
                    wooden_pickaxe: "hand",
                }),
                new IfNode(
                    pickaxeHasMoreThan10Durability,
                    new SequentialNode(
                        new TaskNode("goto", "cobble farm", new Vec3(214, 64, 181)),

                        new WhileNode(
                            new AndNode(hasLessThan10Cobble, pickaxeHasMoreThan10Durability),
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

simulate(rootNode, bot);
