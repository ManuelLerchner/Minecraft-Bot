import { Vec3 } from "vec3";
import { ASTNode } from "../Nodes/ASTNodes/ASTNode";
import { IfNode } from "../Nodes/ASTNodes/StructureNodes/IfNode";
import { SequentialNode } from "../Nodes/ASTNodes/StructureNodes/SequentialNode";
import { TryNode } from "../Nodes/ASTNodes/StructureNodes/TryNode";
import { WhileNode } from "../Nodes/ASTNodes/StructureNodes/WhileNode";
import {
    EquipNode,
    GoToNode,
    MineBlockNode,
    ChatNode,
    DepositToChestNode,
    IdleNode,
    SleepNode,
    TakeFromChestNode,
} from "../Nodes/ASTNodes/Tasks/Tasks";
import { AndNode } from "../Nodes/CondtionNodes/Boolean/AndNode";
import { NotNode } from "../Nodes/CondtionNodes/Boolean/NotNode";
import { ConditionNode } from "../Nodes/CondtionNodes/CondtionNode";
import { FunctionCondtionNode } from "../Nodes/CondtionNodes/Condtitions/FunctionConditionNode";
import { InventoryConditionNode } from "../Nodes/CondtionNodes/Condtitions/InventoryConditionNode";
import { RunParkour } from "./RunParkour";

let hasPickaxeWithMoreThan10Durability: ConditionNode = new InventoryConditionNode(
    "atleast",
    1,
    "wooden_pickaxe",
    {
        comparison: "more_than",
        durability: 10,
    }
);

export const farmCobbleNode: ASTNode = new SequentialNode(
    new IfNode(
        new NotNode(hasPickaxeWithMoreThan10Durability),
        new SequentialNode(
            new GoToNode("chests", new Vec3(217, 64, 173)),

            new DepositToChestNode("used wooden pickaxe", new Vec3(219, 64, 171), {
                itemName: "wooden_pickaxe",
                amount: "all",
            }),

            new TryNode(
                new TakeFromChestNode("take pickaxe", new Vec3(219, 64, 173), {
                    itemName: "wooden_pickaxe",
                    amount: 1,
                }),
                new SleepNode("because there no pickaxe in chest", 5000)
            )
        )
    ),

    new SequentialNode(
        new EquipNode("wooden_pickaxe to hand", {
            itemName: "wooden_pickaxe",
            place: "hand",
        }),

        new GoToNode("cobble farm", new Vec3(214, 64, 181)),

        new WhileNode(
            new AndNode(
                new InventoryConditionNode("atmost", 10, "cobblestone"),
                hasPickaxeWithMoreThan10Durability
            ),
            new SequentialNode(
                new MineBlockNode("cobble 1", new Vec3(215, 65, 181)),
                new MineBlockNode("cobble 2", new Vec3(214, 65, 180))
            )
        ),

        new ChatNode("enough cobble", "I have enough cobble"),

        new GoToNode("chests", new Vec3(217, 64, 173)),

        new TryNode(
            new DepositToChestNode("all cobblestone", new Vec3(219, 64, 175), {
                itemName: "cobblestone",
                amount: "all",
            }),
            new IdleNode("because chest is full")
        )
    )
);
