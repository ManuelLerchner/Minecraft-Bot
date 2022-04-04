import { Node } from "./Nodes";
import { Vec3 } from "vec3";
import { GoTo } from "../Actions/GoTo";
import { Bot } from "mineflayer";
import { Action } from "../Actions/Action";
import { StateTransition } from "mineflayer-statemachine";
import { IdleState } from "../Actions/IdleState";
import { Sleep } from "../Actions/Sleep";
import { Function } from "../Actions/Function";
import { Mine } from "../Actions/Mine";
import { DepositToChest } from "../Actions/DepositToChest";
import { TakeFromChest } from "../Actions/TakeFromChest";
import { Equip } from "../Actions/Equip";
import { CompileResult } from "../Types/CompileResult";
import chalk from "chalk";

export class TaskNode implements Node {
    params: any[] = [];
    taskName: string;

    constructor(
        private action: "goto" | "mine" | "sleep" | "call" | "deposit" | "take" | "idle" | "equip",
        private name: string,
        ...params: any[]
    ) {
        this.params = params;
        this.taskName = this.action + " '" + this.name + this.formatParameters(params);
    }

    formatParameters(params: any[]): string {
        return (
            (params.length > 0 ? " : " : "") +
            params
                .map((p) => {
                    if (typeof p === "function") return "function";
                    return p.toString();
                })
                .join(", ")
        );
    }

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);
        let str =
            indentation +
            chalk.green(this.action) +
            " '" +
            this.name +
            "'" +
            this.formatParameters(this.params);

        return str;
    }

    getAction(bot: Bot): Action {
        if (this.params.length === 0) {
            switch (this.action) {
                case "idle":
                    return new IdleState(bot, "Idle");
            }
        }

        if (this.params.length === 1) {
            let firstParam = this.params[0];
            switch (this.action) {
                case "goto":
                    if (!(firstParam instanceof Vec3))
                        throw new Error("Invalid position: " + firstParam);
                    return new GoTo(bot, this.taskName, firstParam as Vec3);

                case "mine":
                    if (!(firstParam instanceof Vec3))
                        throw new Error("Invalid position: " + firstParam);
                    return new Mine(bot, this.taskName, firstParam as Vec3);

                case "sleep":
                    if (typeof firstParam !== "number")
                        throw new Error("Invalid time:" + firstParam);
                    return new Sleep(bot, this.taskName, firstParam);

                case "call":
                    if (typeof firstParam !== "function")
                        throw new Error("Invalid function:" + firstParam);
                    return new Function(bot, this.taskName, firstParam);

                case "equip":
                    return new Equip(bot, this.taskName, firstParam);
            }
        }

        if (this.params.length === 2) {
            let firstParam = this.params[0];
            let secondParam = this.params[1];

            switch (this.action) {
                case "deposit":
                    if (!(firstParam instanceof Vec3))
                        throw new Error("Invalid position: " + firstParam);

                    return new DepositToChest(bot, this.taskName, firstParam, secondParam);

                case "take":
                    if (!(firstParam instanceof Vec3))
                        throw new Error("Invalid position: " + firstParam);

                    return new TakeFromChest(bot, this.taskName, firstParam, secondParam);
            }
        }

        throw new Error("Unsupported action: " + this.action + " params:" + this.params);
    }

    compile(bot: Bot): CompileResult {
        let action: Action = this.getAction(bot);

        let transitions: StateTransition[] = [];

        let enter: Action = action;
        let exit: Action = action;

        let possibleErrors = [];
        if (action.canThrowError()) {
            possibleErrors.push(action);
        }

        return {
            actions: [action],
            transitions,
            possibleErrors,
            enter,
            exit,
        };
    }
}
