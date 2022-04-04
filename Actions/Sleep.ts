import { Action } from "./Action";
import { StateBehavior } from "mineflayer-statemachine";
import { Vec3 } from "vec3";
import { Bot, Chest, Player } from "mineflayer";

import { Movements, goals } from "mineflayer-pathfinder";

export class Sleep extends Action {
    constructor(bot: Bot, name: string, private msSleep: number) {
        super(bot, name);
    }

    onStateEntered(): void {
        this.sleep(this.msSleep).then(() => {
            this.setFinished();
        });
    }

    onStateExited(): void {
        super.reset();
    }

    sleep(time: any): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    canThrowError(): boolean {
        return false;
    }
}
