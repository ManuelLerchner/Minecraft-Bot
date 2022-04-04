import { Node } from "./Node";
import { Vec3 } from "vec3";
import { GoTo } from "../Actions/GoTo";
import { goals } from "mineflayer-pathfinder";

import { Bot } from "mineflayer";
import { Action } from "../Actions/Action";

import { StateBehavior, StateTransition } from "mineflayer-statemachine";
import { CompileResult } from "../Types/CompileResult";
import chalk from "chalk";

export class SequentialNode implements Node {
    actions: Node[];
    constructor(...action: Node[]) {
        this.actions = action;
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

            transitions.push(this.createTransition(from, to));
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

    createTransition(from: Action, to: Action): StateTransition {
        return new StateTransition({
            parent: from,
            child: to,
            shouldTransition: from.isFinished,
            name: from.stateName + " -> " + to.stateName,
        });
    }
}
