import { Bot } from "mineflayer";
import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../../../Actions/Action";
import { Identity } from "../../../Actions/Simple/Identity";
import { CompileResult } from "../../../Types/CompileResult";
import { ASTNode } from "../ASTNode";
import { ConditionNode } from "../../CondtionNodes/CondtionNode";
import chalk from "chalk";
import { createTransition } from "../../../Transitions/Transitions";

export class IfNode implements ASTNode {
    constructor(
        public condition: ConditionNode,
        public ifTrue: ASTNode,
        public ifFalse?: ASTNode
    ) {}

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);
        let str = "";

        str += indentation + chalk.magenta("if (\n");
        str += this.condition.prettyPrint(indent + 1) + "\n";
        str += indentation + chalk.magenta(") do {\n");
        str += this.ifTrue.prettyPrint(indent + 1) + "\n";
        if (this.ifFalse) {
            str += indentation + chalk.magenta("} else {\n");
            str += this.ifFalse.prettyPrint(indent + 1) + "\n";
            str += indentation + chalk.magenta("}");
        }

        return str;
    }

    createInternalStates(
        bot: Bot,
        compiledTrueBranch: CompileResult,
        compiledFalseBranch: CompileResult | null
    ) {
        let startIf = new Identity(bot, "If-Node:\n" + this.condition.getName());
        let endIf = new Identity(bot, "End If-Node");

        let internalActions: Action[] = [startIf, endIf];
        let internalTransitions: StateTransition[] = [];

        if (compiledFalseBranch) {
            let gotoFalseBranch = createTransition(
                startIf,
                compiledFalseBranch.enter,
                () => !this.condition.getCondition(bot)(),
                "Enter False Branch"
            );

            let exitIfFromFalse = createTransition(
                compiledFalseBranch.exit,
                endIf,
                compiledFalseBranch.exit.isFinished,
                "Exit False Branch"
            );

            internalTransitions.push(gotoFalseBranch, exitIfFromFalse);
        } else {
            let gotoEnd = createTransition(
                startIf,
                endIf,
                () => !this.condition.getCondition(bot)(),
                "Exit If-Node dircetly"
            );
            internalTransitions.push(gotoEnd);
        }

        let gotoTrueBranch = createTransition(
            startIf,
            compiledTrueBranch.enter,
            this.condition.getCondition(bot),
            "Enter True Branch"
        );

        let exitIfFromTrue = createTransition(
            compiledTrueBranch.exit,
            endIf,
            compiledTrueBranch.exit.isFinished,
            "Exit from True Branch"
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
        let compiledTrueBranch = this.ifTrue.compile(bot);

        let compiledFalseBranch = null;
        if (this.ifFalse) {
            compiledFalseBranch = this.ifFalse.compile(bot);
        }

        let internalLogic = this.createInternalStates(bot, compiledTrueBranch, compiledFalseBranch);

        let actions = [...internalLogic.internalActions, ...compiledTrueBranch.actions];
        let transitions = [...internalLogic.internalTransitions, ...compiledTrueBranch.transitions];

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
            enter: internalLogic.enter,
            exit: internalLogic.exit,
        };
    }
}
