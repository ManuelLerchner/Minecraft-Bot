import { Bot, createBot } from "mineflayer";
import { Vec3 } from "vec3";
import { simulate } from "../src/LerryScript/Simulator";
import { ASTNode } from "./LerryScript/Nodes/ASTNodes/ASTNode";
import { IfNode } from "./LerryScript/Nodes/ASTNodes/StructureNodes/IfNode";
import { SequentialNode } from "./LerryScript/Nodes/ASTNodes/StructureNodes/SequentialNode";
import { TaskNode } from "./LerryScript/Nodes/ASTNodes/StructureNodes/TaskNode";
import { TryNode } from "./LerryScript/Nodes/ASTNodes/StructureNodes/TryNode";
import { WhileNode } from "./LerryScript/Nodes/ASTNodes/StructureNodes/WhileNode";
import {
    ChatNode,
    DepositToChestNode,
    EquipNode,
    GoToNode,
    IdleNode,
    MineBlockNode,
    MineBlocksNode,
    PlaceBlockNode,
    SleepNode,
    TakeFromChestNode,
    WalkOverAreaNode,
} from "./LerryScript/Nodes/ASTNodes/Tasks/Tasks";
import { AndNode } from "./LerryScript/Nodes/CondtionNodes/Boolean/AndNode";
import { ConditionNode } from "./LerryScript/Nodes/CondtionNodes/CondtionNode";

import { FunctionCondtionNode } from "./LerryScript/Nodes/CondtionNodes/Condtitions/FunctionConditionNode";
import { InventoryConditionNode } from "./LerryScript/Nodes/CondtionNodes/Condtitions/InventoryConditionNode";

import { mcData } from "./LerryScript/Settings";
import { NotNode } from "./LerryScript/Nodes/CondtionNodes/Boolean/NotNode";
import { IgnoreErrorNode } from "./LerryScript/Nodes/ASTNodes/SyntacticSugar/IgnoreErrorNode";
import { farmCobbleNode } from "./LerryScript/Templates/FarmCobble";
import { farmWoodNode } from "./LerryScript/Templates/FarmWood";

const bot: Bot = createBot({
    host: "localhost",
    username: "LerryBot",
});

let rootNode: ASTNode = new WhileNode(
    new FunctionCondtionNode("infinite repeat", () => true),
    new TryNode(new SequentialNode(farmWoodNode), new SleepNode("sleep", 5000))
);

simulate(rootNode, bot);
