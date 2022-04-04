import { Bot } from "mineflayer";
import { CompileResult } from "../Types/CompileResult";
import { IfNode } from "./IfNode";
import { SequentialNode } from "./SequentialNode";
import { TaskNode } from "./TaskNode";
import { TryNode } from "./TryNode";
import { WhileNode } from "./WhileNode";

interface Node {
    prettyPrint(indent: number): string;
    compile(bot: Bot): CompileResult;
}

export { Node, IfNode, SequentialNode, TaskNode, TryNode, WhileNode };
