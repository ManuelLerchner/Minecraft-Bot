import { Bot } from "mineflayer";
import { StateBehavior, StateTransition } from "mineflayer-statemachine";
import { Action } from "../Actions/Action";
import { CompileResult } from "../Types/CompileResult";

export interface Node {
    prettyPrint(indent: number): string;

    compile(bot: Bot): CompileResult;
}
