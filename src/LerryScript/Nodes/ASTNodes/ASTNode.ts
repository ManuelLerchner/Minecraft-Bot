import { Bot } from "mineflayer";
import { CompileResult } from "../../Types/CompileResult";
import { Node } from "../Node";

export interface ASTNode extends Node {
    compile(bot: Bot): CompileResult;
}
