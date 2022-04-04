import { Node } from "./Nodes";
import { Bot } from "mineflayer";
import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../Actions/Action";
import { Identity } from "../Actions/Identity";
import { CompileResult } from "../Types/CompileResult";
import chalk from "chalk";

export class IfNode implements Node {
    constructor(
        public condition: () => boolean,
        public trueBranch: Node,
        public falseBranch?: Node
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
        if (this.falseBranch) {
            str += indentation + chalk.magenta("} else {\n");
            str += this.falseBranch.prettyPrint(indent + 1) + "\n";
            str += indentation + chalk.magenta("}");
        }

        return str;
    }

    createInternalStates(
        bot: Bot,
        compiledTrueBranch: CompileResult,
        compiledFalseBranch: CompileResult | null
    ) {
        let startIf = new Identity(bot, "If-Node");
        let endIf = new Identity(bot, "End If-Node");

        let internalActions: Action[] = [startIf, endIf];
        let internalTransitions: StateTransition[] = [];

        if (compiledFalseBranch) {
            let gotoFalseBranch = this.createTransition(
                startIf,
                compiledFalseBranch.enter,
                () => !this.condition()
            );

            let exitIfFromFalse = this.createTransition(
                compiledFalseBranch.exit,
                endIf,
                compiledFalseBranch.exit.isFinished
            );

            internalTransitions.push(gotoFalseBranch, exitIfFromFalse);
        } else {
            let gotoEnd = this.createTransition(startIf, endIf, () => !this.condition());
            internalTransitions.push(gotoEnd);
        }

        let gotoTrueBranch = this.createTransition(startIf, compiledTrueBranch.enter, () =>
            this.condition()
        );

        let exitIfFromTrue = this.createTransition(
            compiledTrueBranch.exit,
            endIf,
            compiledTrueBranch.exit.isFinished
        );

        internalTransitions.push(gotoTrueBranch, exitIfFromTrue);

        return {
            internalActions,
            internalTransitions,
            enter: startIf,
            exit: endIf,
        };
    }

    compile(bot: Bot): CompileResult {
        let compiledTrueBranch = this.trueBranch.compile(bot);

        let compiledFalseBranch = null;
        if (this.falseBranch) {
            compiledFalseBranch = this.falseBranch.compile(bot);
        }

        let internal = this.createInternalStates(bot, compiledTrueBranch, compiledFalseBranch);

        let actions = [...internal.internalActions, ...compiledTrueBranch.actions];
        let transitions = [...internal.internalTransitions, ...compiledTrueBranch.transitions];

        let canThrowError = compiledTrueBranch.possibleErrors;

        if (compiledFalseBranch) {
            actions = [...actions, ...compiledFalseBranch.actions];
            transitions = [...transitions, ...compiledFalseBranch.transitions];

            canThrowError = [...canThrowError, ...compiledFalseBranch.possibleErrors];
        }

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
