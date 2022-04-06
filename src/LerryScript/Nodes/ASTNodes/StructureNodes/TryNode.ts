import { Bot } from "mineflayer";
import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../../../Actions/Action";
import { CompileResult } from "../../../Types/CompileResult";
import { ASTNode } from "../ASTNode";
import chalk from "chalk";

import { createTransition } from "../../../Transitions/Transitions";
import { IdentityAction } from "../../../Actions/Simple/IdentityAction";

export class TryNode implements ASTNode {
    constructor(public task: ASTNode, public error: ASTNode) {}

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);
        let str = "";

        str += indentation + chalk.cyan("try (\n");
        str += this.task.prettyPrint(indent + 1) + "\n";
        str += indentation + chalk.cyan(") onError {\n");
        str += this.error.prettyPrint(indent + 1) + "\n";
        str += indentation + chalk.cyan("}\n");

        return str;
    }

    createInternalStates(bot: Bot, compiledTask: CompileResult, compiledError: CompileResult) {
        let startTry = new IdentityAction(bot);
        startTry.setStateName("Try-Node");

        let endTry = new IdentityAction(bot);
        endTry.setStateName("End Try-Node");

        let taskEnter = compiledTask.enter;
        let errorEnter = compiledError.enter;

        let taskExit = compiledTask.exit;
        let errorExit = compiledError.exit;

        let enterTask = createTransition(startTry, taskEnter, () => true, "Enter Task");
        let leaveTask = createTransition(taskExit, endTry, taskExit.isFinished, "Exit from Task");

        let enterErrors = [];
        for (let child of compiledTask.actions) {
            if (!child.errorChaught && child.canThrowError()) {
                enterErrors.push(
                    createTransition(child, errorEnter, () => child.isErrored(), "Enter Error")
                );
                child.errorChaught = true;
            }
        }

        let leaveError = createTransition(
            errorExit,
            endTry,
            errorExit.isFinished,
            "Exit from Error"
        );

        let internalActions: Action[] = [startTry, endTry];
        let internalTransitions: StateTransition[] = [
            enterTask,
            leaveTask,
            ...enterErrors,
            leaveError,
        ];

        return {
            internalActions,
            internalTransitions,
            enter: startTry,
            exit: endTry,
        };
    }

    compile(bot: Bot): CompileResult {
        let compiledTask = this.task.compile(bot);
        let compiledError = this.error.compile(bot);

        let internal = this.createInternalStates(bot, compiledTask, compiledError);

        let actions = [
            ...internal.internalActions,
            ...compiledTask.actions,
            ...compiledError.actions,
        ];

        let transitions = [
            ...internal.internalTransitions,
            ...compiledTask.transitions,
            ...compiledError.transitions,
        ];

        let canThrowError = compiledError.possibleErrors;

        return {
            actions,
            transitions,
            possibleErrors: canThrowError,
            enter: internal.enter,
            exit: internal.exit,
        };
    }
}
