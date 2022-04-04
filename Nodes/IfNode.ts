import { TaskNode } from "./TaskNode";
import { Node } from "./Node";
import { Vec3 } from "vec3";
import { Bot } from "mineflayer";

import { StateBehavior, StateTransition } from "mineflayer-statemachine";
import { Action } from "../Actions/Action";
import { Identity } from "../Actions/Identity";
import { CompileResult } from "../Types/CompileResult";
import chalk from "chalk";

export class IfNode implements Node {
    constructor(
        public condition: () => boolean,
        public trueBranch: Node,
        public falseBranch: Node
    ) {}

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);
        let functionIndent = indentation + "  ";
        let str = "";

        let functionPretty = this.condition
            .toString()
            .split("\n")
            .map((line) => functionIndent + line)
            .join("\n");

        str += indentation + chalk.magenta("if (\n");
        str += functionPretty + "\n";
        str += indentation + chalk.magenta(") do {\n");
        str += this.trueBranch.prettyPrint(indent + 1) + "\n";
        str += indentation + chalk.magenta("} else {\n");

        str += this.falseBranch.prettyPrint(indent + 1) + "\n";
        str += indentation + chalk.magenta("}");

        return str;
    }

    createInternalStates(
        bot: Bot,
        compiledTrueBranch: CompileResult,
        compiledFalseBranch: CompileResult
    ) {
        let startIf = new Identity(bot, "If-Node");
        let endWhile = new Identity(bot, "End If-Node");

        let trueBranchEnter = compiledTrueBranch.enter;
        let trueBranchExit = compiledTrueBranch.exit;

        let falseBranchEnter = compiledFalseBranch.enter;
        let falseBranchExit = compiledFalseBranch.exit;

        let gotoTrueBranch = this.createTransition(startIf, trueBranchEnter, () =>
            this.condition()
        );

        let gotoFalseBranch = this.createTransition(
            startIf,
            falseBranchEnter,
            () => !this.condition()
        );

        let exitIfFromTrue = this.createTransition(
            trueBranchExit,
            endWhile,
            trueBranchExit.isFinished
        );
        let exitIfFromFalse = this.createTransition(
            falseBranchExit,
            endWhile,
            falseBranchExit.isFinished
        );

        let internalActions: Action[] = [startIf, endWhile];
        let internalTransitions: StateTransition[] = [
            gotoTrueBranch,
            exitIfFromTrue,
            gotoFalseBranch,
            exitIfFromFalse,
        ];

        return {
            internalActions,
            internalTransitions,
            enter: startIf,
            exit: endWhile,
        };
    }

    compile(bot: Bot): CompileResult {
        let compiledTrueBranch = this.trueBranch.compile(bot);
        let compiledFalseBranch = this.falseBranch.compile(bot);

        let internal = this.createInternalStates(bot, compiledTrueBranch, compiledFalseBranch);

        let actions = [
            ...internal.internalActions,
            ...compiledTrueBranch.actions,
            ...compiledFalseBranch.actions,
        ];

        let transitions = [
            ...internal.internalTransitions,
            ...compiledTrueBranch.transitions,
            ...compiledFalseBranch.transitions,
        ];

        let canThrowError = compiledTrueBranch.possibleErrors || compiledFalseBranch.possibleErrors;

        return {
            actions,
            transitions,
            possibleErrors: canThrowError,
            enter: internal.enter,
            exit: internal.exit,
        };
    }

    createTransition(from: Action, to: Action, func: () => boolean): StateTransition {
        return new StateTransition({
            parent: from,
            child: to,
            shouldTransition: func,
            name: from.stateName + " -> " + to.stateName,
        });
    }
}
