import { Bot } from "mineflayer";
import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../../../Actions/Action";
import { CompileResult } from "../../../Types/CompileResult";
import { ASTNode } from "../ASTNode";
import chalk from "chalk";
import { createTransition } from "../../../Transitions/Transitions";
import { IdentityAction } from "../../../Actions/Simple/IdentityAction";

export class IgnoreErrorNode implements ASTNode {
    actions: ASTNode[];
    constructor(child: ASTNode, ...children: ASTNode[]) {
        this.actions = [child, ...children];
    }

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);
        let str = "";
        str += indentation + chalk.blue("{\n");
        for (let action of this.actions) {
            str += action.prettyPrint(indent + 1) + "\n";
        }
        str += indentation + chalk.blue("}");
        return str;
    }

    createInternalStates(bot: Bot, compiledChildren: CompileResult[]) {
        let startSequential = new IdentityAction(bot);
        startSequential.setStateName("IgnoreError-Node");

        let endSequential = new IdentityAction(bot);
        endSequential.setStateName("End IgnoreError-Node");

        let taskEnter = compiledChildren[0].enter;
        let taskExit = compiledChildren[compiledChildren.length - 1].exit;

        let enterTask = createTransition(
            startSequential,
            taskEnter,
            () => true,
            "Enter IgnoreError-Node"
        );
        let leaveTask = createTransition(
            taskExit,
            endSequential,
            () => taskExit.isFinished() || taskExit.isErrored(),
            "Exit from IgnoreError-Node"
        );

        let internalActions: Action[] = [startSequential, endSequential];
        let internalTransitions: StateTransition[] = [enterTask, leaveTask];

        return {
            internalActions,
            internalTransitions,
            enter: startSequential,
            exit: endSequential,
        };
    }

    compile(bot: Bot): CompileResult {
        let compiledChildren = this.actions.map((action) => action.compile(bot));

        let {
            internalActions: actions,
            internalTransitions: transitions,
            enter,
            exit,
        } = this.createInternalStates(bot, compiledChildren);

        for (let i = 0; i < compiledChildren.length - 1; i++) {
            let curr = compiledChildren[i];
            let next = compiledChildren[i + 1];

            let from = curr.exit || curr.actions[curr.actions.length - 1];
            let to = next.enter || next.actions[0];

            transitions.push(
                createTransition(
                    from,
                    to,
                    () => from.isFinished() || from.isErrored(),
                    "Action finsihed or Errored"
                )
            );
        }

        for (let compResult of compiledChildren) {
            actions = actions.concat(compResult.actions);
            transitions = transitions.concat(compResult.transitions);
        }

        for (let compResult of compiledChildren) {
            for (let childAction of compResult.actions) {
                if (!childAction.errorChaught && childAction.canThrowError()) {
                    childAction.errorChaught = true;
                }
            }
        }

        return {
            actions,
            transitions,
            possibleErrors: [],
            enter,
            exit,
        };
    }
}
