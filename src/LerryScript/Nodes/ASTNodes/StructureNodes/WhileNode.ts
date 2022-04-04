import { ASTNode } from "../ASTNode";
import { Bot } from "mineflayer";
import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../../../Actions/Action";
import { Identity } from "../../../Actions/Identity";
import { CompileResult } from "../../../Types/CompileResult";
import chalk from "chalk";
import { ConditionNode } from "../../CondtionNodes/CondtionNode";

export class WhileNode implements ASTNode {
    constructor(private condition: ConditionNode, public body: ASTNode) {}

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);
        let str = "";

        str += indentation + chalk.yellow("while (\n");
        str += this.condition.prettyPrint(indent + 1) + "\n";
        str += indentation + chalk.yellow(") do {\n");
        str += this.body.prettyPrint(indent + 1) + "\n";
        str += indentation + chalk.yellow("}");
        return str;
    }

    createInternalStates(bot: Bot, compiledBody: CompileResult) {
        let startWhile = new Identity(bot, "While-Node");
        let endWhile = new Identity(bot, "End While-Node");

        let input = compiledBody.enter;
        let output = compiledBody.exit;

        let remainInLoop = this.createTransition(
            startWhile,
            input,
            this.condition.getCondition(bot)
        );

        let leaveLoop = this.createTransition(
            startWhile,
            endWhile,
            () => !this.condition.getCondition(bot)(),
        );

        let loop = this.createTransition(output, startWhile, output.isFinished);

        let internalActions: Action[] = [startWhile, endWhile];
        let internalTransitions: StateTransition[] = [remainInLoop, loop, leaveLoop];

        return {
            internalActions,
            internalTransitions,

            enter: startWhile,
            exit: endWhile,
        };
    }

    compile(bot: Bot): CompileResult {
        let compiledBody = this.body.compile(bot);

        let { internalActions, internalTransitions, enter, exit } = this.createInternalStates(
            bot,
            compiledBody
        );

        let actions = [...internalActions, ...compiledBody.actions];
        let transitions = [...internalTransitions, ...compiledBody.transitions];

        let canThrowError = compiledBody.possibleErrors;

        return {
            actions,
            transitions,
            possibleErrors: canThrowError,
            enter,
            exit,
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
