import { Action } from "./Action";
import { Bot } from "mineflayer";

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
