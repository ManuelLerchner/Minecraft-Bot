import { Bot } from "mineflayer";
import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../../../Actions/Action";
import { CompileResult } from "../../../Types/CompileResult";
import { ASTNode } from "../ASTNode";
import chalk from "chalk";
import { Vec3 } from "vec3";

import { DepositTask } from "../../../Types/DepositTask";
import { EquipTask } from "../../../Types/EquipTask";
import { DepositToChest } from "../../../Actions/Simple/DepositToChest";
import { Equip } from "../../../Actions/Simple/Equip";
import { GoTo } from "../../../Actions/Simple/GoTo";
import { IdleState } from "../../../Actions/Simple/IdleState";
import { Mine } from "../../../Actions/Simple/Mine";
import { Sleep } from "../../../Actions/Simple/Sleep";
import { TakeFromChest } from "../../../Actions/Simple/TakeFromChest";
import { Call } from "../../../Actions/Simple/Call";
import { Chat } from "../../../Actions/Simple/Chat";
import { ActivateHotbarIcon } from "../../../Actions/Simple/ActivateHotbarIcon";
import { ClickInventory } from "../../../Actions/Simple/ClickInventory";

export class TaskNode implements ASTNode {
    params: any[] = [];
    taskName: string;

    constructor(
        private action:
            | "goto"
            | "mine"
            | "sleep"
            | "call"
            | "deposit"
            | "take"
            | "idle"
            | "equip"
            | "chat"
            | "activateHotbarItem"
            | "clickInventory",

        private name: string,
        ...params: any[]
    ) {
        this.params = params;
        this.taskName = this.action + " '" + this.name + ": " + this.formatParameters(params);
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
            chalk.green(this.action) +
            " '" +
            this.name +
            "': " +
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
                    return new Call(bot, this.taskName, firstParam);

                case "equip":
                    let equipTask: EquipTask = firstParam as EquipTask;

                    if (!(typeof equipTask.itemName === "string"))
                        throw new Error(
                            "Invalid item: " +
                                equipTask.itemName +
                                " on" +
                                JSON.stringify(equipTask)
                        );

                    return new Equip(bot, this.taskName, equipTask);

                case "chat":
                    if (typeof firstParam !== "string")
                        throw new Error("Invalid chat message:" + firstParam);
                    return new Chat(bot, this.taskName, firstParam);

                case "activateHotbarItem":
                    if (typeof firstParam !== "number")
                        throw new Error("Invalid hotbar idx:" + firstParam);
                    return new ActivateHotbarIcon(bot, this.taskName, firstParam);
            }
        }

        if (this.params.length === 2) {
            let firstParam = this.params[0];
            let secondParam = this.params[1];

            switch (this.action) {
                case "deposit":
                    if (!(firstParam instanceof Vec3))
                        throw new Error("Invalid position: " + firstParam);

                    let depositTask: DepositTask = secondParam as DepositTask;

                    if (!(typeof depositTask.itemName === "string"))
                        throw new Error(
                            "Invalid item name: " +
                                secondParam +
                                " on" +
                                JSON.stringify(depositTask)
                        );

                    if (
                        !(typeof depositTask.amount === "number" || secondParam["amount"] === "all")
                    )
                        throw new Error(
                            "Invalid amount: " +
                                secondParam["amount"] +
                                " on" +
                                JSON.stringify(depositTask)
                        );

                    return new DepositToChest(bot, this.taskName, firstParam, secondParam);

                case "take":
                    if (!(firstParam instanceof Vec3))
                        throw new Error("Invalid position: " + firstParam);

                    return new TakeFromChest(bot, this.taskName, firstParam, secondParam);

                case "clickInventory":
                    if (!(firstParam === "left" || firstParam === "right"))
                        throw new Error("Invalid click: " + firstParam);

                    if (typeof secondParam !== "number")
                        throw new Error("Invalid slot idx: " + secondParam);

                    return new ClickInventory(bot, this.taskName, firstParam, secondParam);
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
