import { Bot } from "mineflayer";
import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../../../Actions/Action";
import { CompileResult } from "../../../Types/CompileResult";
import { ASTNode } from "../ASTNode";
import chalk from "chalk";
import { Vec3 } from "vec3";

export abstract class TaskNode implements ASTNode {
    private params: any[] = [];

    constructor(private action: string, protected description: string, ...params: any[]) {
        this.params = params;
    }

    getStateName() {
        return this.action + ": '" + this.description + ": " + this.formatParameters(this.params);
    }

    formatParameters(params: any[]): string {
        let str = params
            .map((param) => {
                if (param instanceof Vec3) {
                    return param.toString();
                } else {
                    return JSON.stringify(param);
                }
            })
            .join(", ");
        return str;
    }

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);
        let str =
            indentation +
            chalk.green(this.action + ":") +
            " '" +
            this.description +
            "': " +
            this.formatParameters(this.params);

        return str;
    }

    abstract getAction(bot: Bot): Action;

    compile(bot: Bot): CompileResult {
        let action: Action = this.getAction(bot);

        action.setStateName(this.getStateName());

        let possibleErrors: Action[] = [];
        if (action.canThrowError()) {
            possibleErrors = [action];
        }

        return {
            actions: [action],
            transitions: [],
            possibleErrors,
            enter: action,
            exit: action,
        };
    }
}
