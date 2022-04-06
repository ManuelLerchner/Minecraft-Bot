import { ASTNode } from "../ASTNode";
import { Bot } from "mineflayer";
import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../../../Actions/Action";
import { CompileResult } from "../../../Types/CompileResult";
import chalk from "chalk";
import { ConditionNode } from "../../CondtionNodes/CondtionNode";
import { createTransition } from "../../../Transitions/Transitions";
import { IdentityAction } from "./../../../Actions/Simple/IdentityAction";

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
        let startWhile = new IdentityAction(bot);
        startWhile.setStateName("While-Node:" + this.condition.getName());

        let endWhile = new IdentityAction(bot);
        endWhile.setStateName("End While-Node");

        let input = compiledBody.enter;
        let output = compiledBody.exit;

        let enterLoop = createTransition(
            startWhile,
            input,
            this.condition.getCondition(bot),
            "Enter Loop"
        );

        let returnFromLoop = createTransition(
            startWhile,
            endWhile,
            () => !this.condition.getCondition(bot)(),
            "Exit while"
        );

        let loop = createTransition(output, startWhile, output.isFinished, "Return from Loop");

        let internalActions: Action[] = [startWhile, endWhile];
        let internalTransitions: StateTransition[] = [enterLoop, loop, returnFromLoop];

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
}
