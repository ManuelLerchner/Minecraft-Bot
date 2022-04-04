import { Bot } from "mineflayer";
import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../../../Actions/Action";
import { CompileResult } from "../../../Types/CompileResult";
import { ASTNode } from "../ASTNode";
import chalk from "chalk";
import { createTransition } from "../../../Transitions/Transitions";

export class SequentialNode implements ASTNode {
    actions: ASTNode[];
    constructor(action: ASTNode, ...actions: ASTNode[]) {
        this.actions = [action, ...actions];
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

    compile(bot: Bot): CompileResult {
        let actions: Action[] = [];
        let transitions: StateTransition[] = [];

        let compiledChildren = this.actions.map((action) => action.compile(bot));

        for (let i = 0; i < compiledChildren.length - 1; i++) {
            let curr = compiledChildren[i];
            let next = compiledChildren[i + 1];

            let from = curr.exit || curr.actions[curr.actions.length - 1];
            let to = next.enter || next.actions[0];

            transitions.push(createTransition(from, to, from.isFinished, "Action finsihed"));
        }

        for (let action of compiledChildren) {
            actions = actions.concat(action.actions);
            transitions = transitions.concat(action.transitions);
        }

        let possibleErrors = compiledChildren
            .map((c) => c.possibleErrors)
            .reduce((a, b) => a.concat(b), []);

        return {
            actions,
            transitions,
            possibleErrors,
            enter: compiledChildren[0].enter,
            exit: compiledChildren[compiledChildren.length - 1].exit,
        };
    }
}
