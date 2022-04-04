import { Action } from "./Action";
import { StateBehavior } from "mineflayer-statemachine";
import { Vec3 } from "vec3";
import { Bot, Chest, Player } from "mineflayer";

export class IdleState extends Action {
    constructor(bot: Bot, errorMsg: string) {
        super(bot, errorMsg);
    }

    onStateEntered(): void {}

    onStateExited(): void {}

    canThrowError(): boolean {
        return false;
    }
}
