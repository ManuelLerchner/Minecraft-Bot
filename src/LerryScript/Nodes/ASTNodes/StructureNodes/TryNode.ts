import { Bot } from "mineflayer";
import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../../../Actions/Action";
import { CompileResult } from "../../../Types/CompileResult";
import { ASTNode } from "../ASTNode";
import chalk from "chalk";
import { Identity } from "../../../Actions/Identity";

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
        let startTry = new Identity(bot, "Try-Node");
        let endTry = new Identity(bot, "End Try-Node");

        let taskEnter = compiledTask.enter;
        let errorEnter = compiledError.enter;

        let taskExit = compiledTask.exit;
        let errorExit = compiledError.exit;

        let enterTask = this.createTransition(startTry, taskEnter, () => true);
        let leaveTask = this.createTransition(taskExit, endTry, taskExit.isFinished);

        let enterErrors = [];
        for (let child of compiledTask.actions) {
            if (!child.errorChaught) {
                enterErrors.push(this.createTransition(child, errorEnter, () => child.isErrored()));
                child.errorChaught = true;
            }
        }

        let leaveError = this.createTransition(errorExit, endTry, errorExit.isFinished);

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

    createTransition(from: Action, to: Action, func: () => boolean): StateTransition {
        return new StateTransition({
            parent: from,
            child: to,
            shouldTransition: func,
            name: from.stateName + " -> " + to.stateName,
        });
    }
}
