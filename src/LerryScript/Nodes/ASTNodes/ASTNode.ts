import { Bot } from "mineflayer";
import { CompileResult } from "../../Types/CompileResult";
import { Node } from "../Node";
import { IfNode } from "./StructureNodes/IfNode";
import { SequentialNode } from "./StructureNodes/SequentialNode";
import { TaskNode } from "./StructureNodes/TaskNode";
import { TryNode } from "./StructureNodes/TryNode";
import { WhileNode } from "./StructureNodes/WhileNode";

export interface ASTNode extends Node {
    compile(bot: Bot): CompileResult;
}
