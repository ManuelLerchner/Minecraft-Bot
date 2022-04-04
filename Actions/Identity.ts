import { Action } from "./Action";
import { StateBehavior } from "mineflayer-statemachine";
import { Vec3 } from "vec3";
import { Bot, Chest, Player } from "mineflayer";

export class Identity extends Action {
    constructor(bot: Bot, name: string) {
        super(bot, name);
        this.setFinished();
    }

    onStateEntered(): void {}

    onStateExited(): void {}

    canThrowError(): boolean {
        return false;
    }
}
